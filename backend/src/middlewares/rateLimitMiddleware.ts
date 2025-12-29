import type { Context, Next } from "hono"
import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on("error", (err) => console.error("Redis Rate Limit Error", err))

if (!redisClient.isOpen) {
  await redisClient.connect()
}

type RateLimitConfig = {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
  message?: string
}

export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyPrefix = "ratelimit",
    message = "Too many requests, please try again later"
  } = config

  return async (c: Context, next: Next) => {
    const user = c.get("user" as any)

    if (!user?.id) {
      return c.json({ message: "Unauthorized" }, 401)
    }

    const key = `${keyPrefix}:${user.id}`
    const windowSeconds = Math.floor(windowMs / 1000)

    try {
      const current = await redisClient.incr(key)

      if (current === 1) {
        await redisClient.expire(key, windowSeconds)
      }

      const ttl = await redisClient.ttl(key)

      c.header("X-RateLimit-Limit", String(maxRequests))
      c.header("X-RateLimit-Remaining", String(Math.max(0, maxRequests - current)))
      c.header("X-RateLimit-Reset", String(Math.floor(Date.now() / 1000) + ttl))

      if (current > maxRequests) {
        return c.json(
          {
            message,
            retryAfter: ttl
          },
          429
        )
      }

      await next()
    } catch (error) {
      console.error("Rate limit error:", error)
      await next()
    }
  }
}

export const rateLimitPresets = {
  ai: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: "ratelimit:ai",
    message: "AI analysis limit reached. Please wait a minute."
  }),

  aiDaily: rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 100,
    keyPrefix: "ratelimit:ai:daily",
    message: "Daily AI analysis limit reached."
  }),

  standard: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyPrefix: "ratelimit:standard",
    message: "Too many requests."
  }),

  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: "ratelimit:auth",
    message: "Too many login attempts. Please wait 15 minutes."
  }),

  upload: rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: "ratelimit:upload",
    message: "Upload limit reached."
  })
}
