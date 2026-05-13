import { db } from "../src/db";
import { sessions } from "../src/db/schema/index";
import { eq } from "drizzle-orm";

const tokenToPath = process.argv[2];

if (!tokenToPath) {
  console.error("Please provide a token (or partial token) to check");
  process.exit(1);
}

// Clean token (handles signature split just like the middleware should)
const cleanToken = tokenToPath.split('.')[0];

console.log(`Searching for session starting with: ${cleanToken.substring(0, 10)}...`);

const results = await db.select().from(sessions).where(eq(sessions.token, cleanToken));

if (results.length === 0) {
  // If not found by exact token, try fuzzy search or just log counts
  const allSessions = await db.select().from(sessions).limit(5);
  console.log("Session NOT FOUND.");
  console.log(`Total sessions in DB (sample): ${allSessions.length}`);
  allSessions.forEach(s => console.log(` - ${s.token.substring(0, 10)}... (Expires: ${s.expiresAt})`));
} else {
  console.log("SUCCESS: Session found!");
  console.log(JSON.stringify(results[0], null, 2));
}
process.exit(0);
