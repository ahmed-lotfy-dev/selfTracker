import { Hono } from "hono"
import { db } from "../db"
import { livestoreEvents } from "../db/schema"
import { and, eq, gt } from "drizzle-orm"
import type { ServerWebSocket } from "bun"

const livestoreRouter = new Hono()

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
    console.log("[LiveStore] WebSocket connection opened")
  },
  close(ws: ServerWebSocket) {
    console.log("[LiveStore] WebSocket connection closed")
  },
}

async function handleWebSocketMessage(ws: ServerWebSocket, data: string) {
  try {
    const message = JSON.parse(data)

    if (message.type === "auth") {
      const authToken = message.authToken
      const storeId = message.storeId

      if (!authToken) {
        ws.send(JSON.stringify({ type: "error", message: "No auth token" }))
        ws.close()
        return
      }

      // Store metadata on the websocket
      (ws as any).storeId = storeId
        (ws as any).authToken = authToken

      ws.send(JSON.stringify({ type: "auth-success" }))
      return
    }

    const storeId = (ws as any).storeId

    if (message.type === "push") {
      await handlePush(message.batch, storeId, ws)
    } else if (message.type === "pull") {
      await handlePull(message.checkpoint, storeId, ws)
    }
  } catch (error) {
    console.error("[LiveStore] Error:", error)
    ws.send(JSON.stringify({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    }))
  }
}

async function handlePush(batch: LiveStoreEvent[], storeId: string, ws: ServerWebSocket) {
  try {
    for (const event of batch) {
      await db.insert(livestoreEvents).values({
        storeId,
        eventId: event.eventId,
        eventType: event.eventType,
        eventData: event.eventData,
        timestamp: event.timestamp,
      }).onConflictDoNothing()
    }

    ws.send(JSON.stringify({
      type: "push-ack",
      count: batch.length
    }))
  } catch (error) {
    console.error("[LiveStore] Push error:", error)
    ws.send(JSON.stringify({
      type: "error",
      message: "Failed to store events"
    }))
  }
}

async function handlePull(checkpoint: number, storeId: string, ws: ServerWebSocket) {
  try {
    const events = await db
      .select({
        eventId: livestoreEvents.eventId,
        eventType: livestoreEvents.eventType,
        eventData: livestoreEvents.eventData,
        timestamp: livestoreEvents.timestamp,
      })
      .from(livestoreEvents)
      .where(
        and(
          eq(livestoreEvents.storeId, storeId),
          gt(livestoreEvents.timestamp, checkpoint || 0)
        )
      )
      .orderBy(livestoreEvents.timestamp)
      .limit(1000)

    ws.send(JSON.stringify({
      type: "pull-response",
      events
    }))
  } catch (error) {
    console.error("[LiveStore] Pull error:", error)
    ws.send(JSON.stringify({
      type: "error",
      message: "Failed to fetch events"
    }))
  }
}

export default livestoreRouter
