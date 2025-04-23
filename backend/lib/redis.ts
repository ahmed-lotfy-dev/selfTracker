import { createClient } from "redis"

// export const redisClient = createClient({
//   url: process.env.REDIS_URL,
// })

// redisClient.connect().catch((err) => {
//   console.error("Redis connection error:", err)
//   process.exit(1)
// })
// redisClient.on("error", (err) => {
//   console.error("Redis error:", err)
// })

// redisClient.on("ready", () => {
//   console.log("Redis client connected and ready")
// })

// redisClient.on("end", () => {
//   console.log("Redis client disconnected")
// })

// utils/redis.ts

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
})

redisClient.on("error", (err) => console.error("Redis Client Error", err))

await redisClient.connect() // or manage connection centrally in app startup

redisClient.on("ready", () => {
  console.log("Redis client connected and ready")
})
redisClient.on("end", () => {
  console.log("Redis client disconnected")
})
redisClient.on("connect", () => {
  console.log("Redis client connected")
})
redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting")
})
redisClient.on("close", () => {
  console.log("Redis client closed")
})
redisClient.on("error", (err) => {
  console.error("Redis client error", err)
})
