import "dotenv/config"
import * as schema from "./schema"

import { drizzle } from "drizzle-orm/node-postgres"

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  },
  schema,
})
