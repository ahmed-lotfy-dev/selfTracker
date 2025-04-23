import { createClient } from "redis"

export const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.connect().catch((err) => {
  console.error("Redis connection error:", err)
  process.exit(1)
}
)
redisClient.on("error", (err) => {
  console.error("Redis error:", err)
})

redisClient.on("ready", () => {
  console.log("Redis client connected and ready")
})

redisClient.on("end", () => {
  console.log("Redis client disconnected")
})