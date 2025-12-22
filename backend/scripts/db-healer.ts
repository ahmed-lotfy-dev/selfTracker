import { db } from "../src/db/index.js";
import { livestoreEvents } from "../src/db/schema/index.js";
import { sql, eq } from "drizzle-orm";

async function heal() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`[Healer] Starting ${isDryRun ? "DRY RUN" : "LIVE UPDATE"}...`);

  const events = await db.select().from(livestoreEvents);
  console.log(`[Healer] Found ${events.length} events to check.`);

  let healedCount = 0;

  for (const event of events) {
    let needsUpdate = false;
    const updates: any = {};

    // 1. Heal main timestamp column
    let ts = Number(event.timestamp);
    if (ts > 0 && ts < 100000000000) {
      ts *= 1000;
      updates.timestamp = ts;
      needsUpdate = true;
      console.log(`[Healer] Scaling timestamp for event ${event.id}: ${event.timestamp} -> ${ts}`);
    }

    // 2. Heal eventData JSON
    const data = typeof event.eventData === "string" ? JSON.parse(event.eventData) : event.eventData;
    let dataChanged = false;

    const dateKeys = ["createdAt", "updatedAt", "deletedAt", "dueDate", "deadline", "startTime", "endTime"];

    for (const key of dateKeys) {
      if (data[key] !== undefined && data[key] !== null) {
        let val = data[key];
        let itemTs = 0;

        if (typeof val === "number") {
          itemTs = val;
        } else if (typeof val === "string") {
          // If it's a numeric string, parse it
          const numeric = Number(val);
          if (!isNaN(numeric)) {
            itemTs = numeric;
          } else {
            // If it's an ISO string, it's already healed
            continue;
          }
        }

        if (itemTs > 0 && itemTs < 100000000000) {
          const newTs = itemTs * 1000;
          data[key] = new Date(newTs).toISOString();
          dataChanged = true;
          console.log(`[Healer] Scaling ${key} in data for event ${event.id}: ${val} -> ${data[key]}`);
        } else if (typeof val === "number") {
          // Even if it's ms, convert to ISO for schema compliance
          data[key] = new Date(val).toISOString();
          dataChanged = true;
        }
      }
    }

    if (dataChanged) {
      updates.eventData = data;
      needsUpdate = true;
    }

    if (needsUpdate) {
      healedCount++;
      if (!isDryRun) {
        await db.update(livestoreEvents).set(updates).where(eq(livestoreEvents.id, event.id));
      }
    }
  }

  console.log(`[Healer] Finished. Healed ${healedCount} events.`);
  if (isDryRun) {
    console.log("[Healer] This was a dry run. No database changes were made.");
  }
  process.exit(0);
}

heal().catch(err => {
  console.error("[Healer] FATAL ERROR:", err);
  process.exit(1);
});
