import { Hono } from "hono"
import { db } from "../db"
import { livestoreEvents, tasks, userGoals, weightLogs, workoutLogs } from "../db/schema"
import { and, eq, gt, sql } from "drizzle-orm"
import { auth } from "../../lib/auth"

function sanitizeData(obj: any): any {
  if (obj === null) return undefined
  if (typeof obj !== "object") return obj
  if (Array.isArray(obj)) return obj.map(sanitizeData)

  const newObj: any = {}
  for (const key in obj) {
    let val = obj[key]
    if (val === null) {
      newObj[key] = undefined
      continue
    }

    // Schema compliance: these must be strings
    if (["weight", "amount", "targetValue"].includes(key)) {
      newObj[key] = String(val)
      continue
    }

    // Schema compliance: these must be ISO dates
    if (["createdAt", "updatedAt", "deletedAt", "dueDate", "deadline", "startTime", "endTime"].includes(key)) {
      if (typeof val === "number" || (typeof val === "string" && !isNaN(Date.parse(val)))) {
        newObj[key] = new Date(val).toISOString()
        continue
      }
    }

    newObj[key] = sanitizeData(val)
  }
  return newObj
}

import type { ServerWebSocket } from "bun"

const livestoreRouter = new Hono()

livestoreRouter.post("/SyncHttpRpc.Push", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const body = await c.req.json()
    const { batch, storeId } = body
    // Verify storeId belongs to user
    if (storeId !== user.id) return c.json({ message: "Unauthorized" }, 401)

    await pushEventsToDb(batch, storeId)
    return c.json({ type: "push-ack", count: batch.length })
  } catch (error) {
    console.error("[LiveStore] HTTP Push error:", error)
    return c.json({ message: "Failed to store events" }, 500)
  }
})

livestoreRouter.post("/SyncHttpRpc.Pull", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const body = await c.req.json()
    const storeId = body.storeId
    const checkpoint = body.cursor?.eventSequenceNumber || 0

    // Verify storeId belongs to user
    if (storeId !== user.id) return c.json({ message: "Unauthorized" }, 401)

    const events = await fetchEvents(checkpoint, storeId)
    console.log(`[LiveStore] HTTP Pull for ${storeId} at ${checkpoint} returned ${events.length} events`)
    return c.json({
      type: "pull-response",
      events,
      backendId: "selftracker-v1"
    })
  } catch (error) {
    console.error("[LiveStore] HTTP Pull error:", error)
    return c.json({ message: "Failed to fetch events" }, 500)
  }
})

livestoreRouter.post("/SyncHttpRpc.Ping", async (c) => {
  return c.json({ type: "pong" })
})

livestoreRouter.post("/sync-existing", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  try {
    const storeId = user.id

    // Check if migration already happened (simple check: any events for this store?)
    const existingEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(livestoreEvents)
      .where(eq(livestoreEvents.storeId, storeId))

    if (existingEvents[0].count > 0) {
      return c.json({ message: "Migration already performed or store not empty", count: existingEvents[0].count })
    }

    const [legacyTasks, legacyWeights, legacyWorkouts, legacyGoals] = await Promise.all([
      db.select().from(tasks).where(eq(tasks.userId, storeId)),
      db.select().from(weightLogs).where(eq(weightLogs.userId, storeId)),
      db.select().from(workoutLogs).where(eq(workoutLogs.userId, storeId)),
      db.select().from(userGoals).where(eq(userGoals.userId, storeId)),
    ])

    const eventsToInsert: any[] = []

    // Map tasks
    legacyTasks.forEach(t => {
      eventsToInsert.push({
        storeId,
        eventId: crypto.randomUUID(),
        eventType: "v1.TaskCreated",
        eventData: {
          id: t.id,
          userId: storeId,
          title: t.title,
          category: t.category,
          description: t.description,
          dueDate: t.dueDate?.getTime(),
          priority: t.priority,
          createdAt: t.createdAt?.getTime(),
        },
        timestamp: t.createdAt?.getTime() || Date.now(),
      })
      if (t.completed) {
        eventsToInsert.push({
          storeId,
          eventId: crypto.randomUUID(),
          eventType: "v1.TaskCompleted",
          eventData: { id: t.id, updatedAt: t.updatedAt?.getTime() || Date.now() },
          timestamp: (t.updatedAt?.getTime() || Date.now()) + 1,
        })
      }
    })

    // Map Weights
    legacyWeights.forEach(w => {
      eventsToInsert.push({
        storeId,
        eventId: crypto.randomUUID(),
        eventType: "v1.WeightLogCreated",
        eventData: {
          id: w.id,
          userId: storeId,
          weight: w.weight,
          mood: w.mood,
          energy: w.energy,
          notes: w.notes,
          createdAt: w.createdAt?.getTime(),
        },
        timestamp: w.createdAt?.getTime() || Date.now(),
      })
    })

    // Map Workouts
    legacyWorkouts.forEach(w => {
      eventsToInsert.push({
        storeId,
        eventId: crypto.randomUUID(),
        eventType: "v1.WorkoutLogCreated",
        eventData: {
          id: w.id,
          userId: storeId,
          workoutId: w.workoutId,
          workoutName: w.workoutName,
          notes: w.notes,
          createdAt: w.createdAt?.getTime(),
        },
        timestamp: w.createdAt?.getTime() || Date.now(),
      })
    })

    // Map Goals
    legacyGoals.forEach(g => {
      eventsToInsert.push({
        storeId,
        eventId: crypto.randomUUID(),
        eventType: "v1.GoalCreated",
        eventData: {
          id: g.id,
          userId: storeId,
          goalType: g.goalType,
          targetValue: String(g.targetValue),
          deadline: g.deadline?.getTime(),
          createdAt: g.createdAt?.getTime(),
        },
        timestamp: g.createdAt?.getTime() || Date.now(),
      })
    })

    if (eventsToInsert.length > 0) {
      // Sort by timestamp to preserve order
      eventsToInsert.sort((a, b) => a.timestamp - b.timestamp)

      // Batch insert (Drizzle's insert might have limits on large arrays, 
      // but here it's probably fine for initial migration)
      await db.insert(livestoreEvents).values(eventsToInsert)
    }

    return c.json({ message: "Migration successful", eventsCreated: eventsToInsert.length })
  } catch (error) {
    console.error("[LiveStore] Migration error:", error)
    return c.json({ message: "Migration failed", error: String(error) }, 500)
  }
})

interface LiveStoreEvent {
  storeId: string
  eventId: string
  eventType: string
  eventData: any
  timestamp: number
}

// Bun WebSocket handler
export const websocket = {
  message(ws: ServerWebSocket, message: string | Buffer) {
    handleWebSocketMessage(ws, message.toString())
  },
  open(ws: ServerWebSocket) {
    // ws.data = { storeId: null }
  },
  close(ws: ServerWebSocket) {
    // close cleanup
  },
}

async function handleWebSocketMessage(ws: ServerWebSocket, data: string) {
  try {
    const rpcRequest = JSON.parse(data)
    console.log(`[LiveStore] RAW MESSAGE: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`)

    // Effect RPC sends messages with _tag: "Ping"
    if (rpcRequest._tag === "Ping") {
      console.log("[LiveStore] Received Ping, sending Pong")
      ws.send(JSON.stringify({ _tag: "Pong" }))
      return
    }

    if (rpcRequest._tag !== "Request") {
      console.log(`[LiveStore] Ignored non-request message: ${rpcRequest._tag}`)
      return
    }

    const { tag, payload, id, traceId } = rpcRequest

    console.log(`[LiveStore] WS Request Tag: ${tag} | ID: ${id} | Store: ${payload?.storeId}`)

    // Guard against missing ID (notifications don't need response, but requests do)
    if (id === undefined || id === null) {
      console.warn("[LiveStore] WS Warning: Received request without ID", tag)
      return
    }

    // session verification
    let storeId = payload?.storeId
    const innerPayload = payload?.payload
    // THE FIX: The token and cursor are nested at payload.payload
    const authToken = innerPayload?.authToken ?? payload?.authToken
    const cursorField = innerPayload?.cursor ?? payload?.cursor

    if (authToken) {
      const session = await auth.api.getSession({
        headers: new Headers({ Cookie: `__Secure-better-auth.session_token=${authToken}` })
      })
      if (session?.user) {
        console.log(`[LiveStore] WS Auth Success for user: ${session.user.id}`)
        storeId = session.user.id
      } else {
        console.log(`[LiveStore] WS Auth Failed for token: ${authToken.substring(0, 10)}...`)
      }
    } else {
      console.log(`[LiveStore] WS No AuthToken provided in payload`)
    }

    if (tag === "SyncWsRpc.Push") {
      await pushEventsToDb(payload.batch, storeId)

      ws.send(JSON.stringify({
        _tag: "Response",
        payload: { _tag: "Success", value: {} },
        id: id,
        requestId: id
      }))
    } else if (tag === "SyncWsRpc.Pull") {
      const checkpoint = cursorField?._tag === "Some" ? cursorField.value.eventSequenceNumber : 0
      const events = await fetchEvents(checkpoint, storeId)

      if (events.length > 0) {
        console.log(`[LiveStore] Pull for ${storeId} at ${checkpoint} returned ${events.length} events`)
        const sample = events[0]
        const sampleData = typeof sample.eventData === "string" ? JSON.parse(sample.eventData) : sample.eventData
        console.log(`[LiveStore] Sample Event[0]: type=${sample.eventType} data=${JSON.stringify(sampleData).substring(0, 100)}...`)
      }

      const responsePayload = {
        batch: events.map(e => {
          const data = typeof e.eventData === "string" ? JSON.parse(e.eventData) : e.eventData

          // THE FIX: Clean and standardize data for Schema compliance
          const processedData = sanitizeData(data)

          return {
            eventEncoded: { _tag: e.eventType, ...processedData },
            metadata: { _tag: "Some", value: { createdAt: new Date(Number(e.timestamp)).toISOString() } }
          }
        }),
        pageInfo: {
          hasMore: events.length >= 1000,
          cursor: events.length > 0
            ? { _tag: "Some", value: { eventSequenceNumber: events[events.length - 1].id } }
            : { _tag: "None" }
        },
        backendId: "selftracker-v1"
      }

      const response = JSON.stringify({
        _tag: "Response",
        payload: { _tag: "Success", value: responsePayload },
        id: id,
        requestId: id,
        traceId: traceId
      })
      console.log(`[LiveStore] Sending Pull response - ID: ${id}, Events: ${events.length}`)
      ws.send(response)
    }
  } catch (error) {
    console.error("[LiveStore] WS Error:", error)
  }
}



async function pushEventsToDb(batch: LiveStoreEvent[], storeId: string) {
  for (const event of batch) {
    // 1. Store the event for LiveStore sync
    await db.insert(livestoreEvents).values({
      storeId,
      eventId: event.eventId,
      eventType: event.eventType,
      eventData: event.eventData,
      timestamp: event.timestamp,
    }).onConflictDoNothing()

    // 2. Materialize the event into our legacy tables (Source of Truth)
    await materializeEvent(event, storeId)
  }
}

async function materializeEvent(event: LiveStoreEvent, storeId: string) {
  const { eventType, eventData } = event

  try {
    switch (eventType) {
      case "v1.TaskCreated":
        await db.insert(tasks).values({
          id: eventData.id,
          userId: storeId,
          title: eventData.title,
          category: eventData.category,
          description: eventData.description,
          dueDate: eventData.dueDate ? new Date(eventData.dueDate) : null,
          priority: eventData.priority || "medium",
          createdAt: eventData.createdAt ? new Date(eventData.createdAt) : new Date(),
          updatedAt: new Date(),
        }).onConflictDoNothing()
        break
      case "v1.TaskUpdated":
        await db.update(tasks).set({
          title: eventData.title,
          description: eventData.description,
          dueDate: eventData.dueDate ? new Date(eventData.dueDate) : undefined,
          priority: eventData.priority,
          updatedAt: new Date(eventData.updatedAt || Date.now()),
        }).where(eq(tasks.id, eventData.id))
        break
      case "v1.TaskCompleted":
        await db.update(tasks).set({
          completed: true,
          updatedAt: new Date(eventData.updatedAt || Date.now()),
        }).where(eq(tasks.id, eventData.id))
        break
      case "v1.TaskUncompleted":
        await db.update(tasks).set({
          completed: false,
          updatedAt: new Date(eventData.updatedAt || Date.now()),
        }).where(eq(tasks.id, eventData.id))
        break
      case "v1.TaskDeleted":
        await db.update(tasks).set({
          deletedAt: new Date(eventData.deletedAt || Date.now()),
          updatedAt: new Date(),
        }).where(eq(tasks.id, eventData.id))
        break

      case "v1.WeightLogCreated":
        await db.insert(weightLogs).values({
          id: eventData.id,
          userId: storeId,
          weight: eventData.weight,
          mood: eventData.mood,
          energy: eventData.energy,
          notes: eventData.notes,
          createdAt: eventData.createdAt ? new Date(eventData.createdAt) : new Date(),
          updatedAt: new Date(),
        }).onConflictDoNothing()
        break
      case "v1.WeightLogUpdated":
        await db.update(weightLogs).set({
          weight: eventData.weight,
          mood: eventData.mood,
          energy: eventData.energy,
          notes: eventData.notes,
          updatedAt: new Date(eventData.updatedAt || Date.now()),
        }).where(eq(weightLogs.id, eventData.id))
        break
      case "v1.WeightLogDeleted":
        await db.update(weightLogs).set({
          deletedAt: new Date(eventData.deletedAt || Date.now()),
          updatedAt: new Date(),
        }).where(eq(weightLogs.id, eventData.id))
        break

      case "v1.WorkoutLogCreated":
        await db.insert(workoutLogs).values({
          id: eventData.id,
          userId: storeId,
          workoutId: eventData.workoutId,
          workoutName: eventData.workoutName,
          notes: eventData.notes,
          createdAt: eventData.createdAt ? new Date(eventData.createdAt) : new Date(),
          updatedAt: new Date(),
        }).onConflictDoNothing()
        break
      case "v1.WorkoutLogDeleted":
        await db.update(workoutLogs).set({
          deletedAt: new Date(eventData.deletedAt || Date.now()),
          updatedAt: new Date(),
        }).where(eq(workoutLogs.id, eventData.id))
        break

      case "v1.GoalCreated":
        await db.insert(userGoals).values({
          id: eventData.id,
          userId: storeId,
          goalType: eventData.goalType,
          targetValue: eventData.targetValue,
          deadline: eventData.deadline ? new Date(eventData.deadline) : null,
          createdAt: eventData.createdAt ? new Date(eventData.createdAt) : new Date(),
          updatedAt: new Date(),
        }).onConflictDoNothing()
        break
      case "v1.GoalUpdated":
        await db.update(userGoals).set({
          targetValue: eventData.targetValue,
          deadline: eventData.deadline ? new Date(eventData.deadline) : undefined,
          achieved: eventData.achieved,
          updatedAt: new Date(eventData.updatedAt || Date.now()),
        }).where(eq(userGoals.id, eventData.id))
        break
      case "v1.GoalDeleted":
        await db.update(userGoals).set({
          deletedAt: new Date(eventData.deletedAt || Date.now()),
          updatedAt: new Date(),
        }).where(eq(userGoals.id, eventData.id))
        break
    }
  } catch (error) {
    console.error(`[LiveStore] Materialization error for ${eventType}:`, error)
    // We don't throw here to ensure the event itself is still stored even if legacy sync fails
  }
}

async function fetchEvents(checkpoint: number, storeId: string) {
  return await db
    .select({
      id: livestoreEvents.id,
      eventId: livestoreEvents.eventId,
      eventType: livestoreEvents.eventType,
      eventData: livestoreEvents.eventData,
      timestamp: livestoreEvents.timestamp,
    })
    .from(livestoreEvents)
    .where(
      and(
        eq(livestoreEvents.storeId, storeId),
        gt(livestoreEvents.id, checkpoint || 0)
      )
    )
    .orderBy(livestoreEvents.id)
    .limit(1000)
}

// handlePush and handlePull were replaced by helper functions above

export default livestoreRouter
