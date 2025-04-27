import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on("error", (err) => console.error("Redis Client Error", err))
redisClient.on("connect", () => console.log("Connected to Redis"))
redisClient.on("close", () => console.log("Disconnected from Redis"))

await redisClient.connect()

export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key)
    if (!data) return null

    // Extra validation for malformed JSON
    try {
      return JSON.parse(data)
    } catch (parseError) {
      console.error("JSON parse error for key:", key, "Data:", data)
      await redisClient.del(key) // Clean up invalid data
      return null
    }
  } catch (err) {
    console.error("Cache get error:", err)
    return null
  }
}

export const setCache = async (key: string, ttl: number, value: any) => {
  try {
    const serialized = JSON.stringify(value)
    const result = await redisClient.set(key, serialized, { EX: ttl })
    return result === "OK"
  } catch (err) {
    console.error("Cache set error:", err)
    return false
  }
}

export const clearCache = async (keys: string | string[]): Promise<void> => {
  try {
    const keyList = Array.isArray(keys) ? keys : [keys]
    await Promise.all(
      keyList.map((key) =>
        key.includes("*")
          ? redisClient
              .keys(key)
              .then((keys) => (keys.length ? redisClient.del(keys) : 0))
          : redisClient.del(key)
      )
    )
  } catch (err) {
    console.error("Cache clear error:", err)
  }
}
