import { createClient } from "redis"

let redisClient: ReturnType<typeof createClient> | null = null

export function getRedisClient() {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      redisClient?.quit()
    })
  }
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL, 
    })

    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err)
    })

    redisClient.connect().catch(console.error)
  }

  return redisClient
}
