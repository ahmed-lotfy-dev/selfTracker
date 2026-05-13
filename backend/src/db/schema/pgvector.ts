import { sql } from "drizzle-orm"
import { customType } from "drizzle-orm/pg-core"

export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1024)"
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value)
  },
})
