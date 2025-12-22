import { db } from "../src/db/index"
import { livestoreEvents } from "../src/db/schema"
import { seedV2Events } from "../src/db/seed/seed-v2"
import { sql } from "drizzle-orm"

async function applySeedV2() {
  console.log("🚀 Reseting livestore_events and applying Seed v2 with STRICT SEQUENCE NUMBERS...")

  try {
    // 1. Clear existing events
    console.log("🗑️ Clearing existing events...")
    await db.delete(livestoreEvents)

    // 2. Clear identity sequence for ID if possible (postgres specific)
    try {
      await db.execute(sql`ALTER SEQUENCE livestore_events_id_seq RESTART WITH 1`)
      console.log("🔄 ID sequence reset.")
    } catch (e) {
      console.log("❕ Could not reset sequence (maybe not postgres or sequence name mismatch), continuing...")
    }

    // 3. Group events by storeId to assign sequential seqNums
    const eventsByStore: Record<string, any[]> = {}
    for (const event of seedV2Events) {
      if (!eventsByStore[event.storeId]) {
        eventsByStore[event.storeId] = []
      }
      eventsByStore[event.storeId].push(event)
    }

    const processedEvents: any[] = []

    // 4. Assign seqNums
    for (const storeId in eventsByStore) {
      const storeEvents = eventsByStore[storeId]
      // Sort by timestamp just in case
      storeEvents.sort((a, b) => a.timestamp - b.timestamp)

      let seqNum = 1
      for (const event of storeEvents) {
        processedEvents.push({
          ...event,
          seqNum: seqNum++,
          clientId: 'backend', // Standardize
          sessionId: 'seed-v2', // Standardize
          version: 1
        })
      }
    }

    // 5. Insert new events in batches
    console.log(`📦 Inserting ${processedEvents.length} processed events...`)

    // We insert in chunks to avoid any pool limits or message size limits
    const CHUNK_SIZE = 50
    for (let i = 0; i < processedEvents.length; i += CHUNK_SIZE) {
      const chunk = processedEvents.slice(i, i + CHUNK_SIZE)
      await db.insert(livestoreEvents).values(chunk)
      console.log(`  Processed ${Math.min(i + CHUNK_SIZE, processedEvents.length)} / ${processedEvents.length}`)
    }

    console.log("✅ Seed v2 applied successfully with valid sequences!")

  } catch (error) {
    console.error("❌ Failed to apply Seed v2:", error)
    process.exit(1)
  }
  process.exit(0)
}

applySeedV2()
