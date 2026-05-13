import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../src/db/schema/index";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = drizzle(pool, { schema });

const email = "ahmed.lotfy37479@gmail.com";

const user = await db.query.users.findFirst({
  where: eq(schema.users.email, email)
});


if (user) {
  console.log(`FOUND USER: ${user.id} (${user.email})`);
} else {
  console.log(`USER NOT FOUND: ${email}`);
  const allUsers = await db.select().from(schema.users).limit(10);

  console.log("Current users in DB:");
  allUsers.forEach(u => console.log(` - ${u.email} (${u.id})`));
}
process.exit(0);
