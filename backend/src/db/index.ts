import * as schema from "./schema/index"

import { drizzle } from "drizzle-orm/node-postgres"

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true,
  },
  schema,
  // logger: true,
})

export type db = typeof db;
