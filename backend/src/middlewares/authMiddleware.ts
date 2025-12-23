import type { MiddlewareHandler } from "hono";
import { db } from "../db/index.js";
import { sessions, users } from "../db/schema/index.js";
import { eq, and, gt } from "drizzle-orm";

/**
 * Middleware to authenticate requests using better-auth session tokens.
 * Directly validates session tokens from cookies against the database.
 * Supports both email/password and social login authentication.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const token = c.req.query('token');

    // Extract session token from query or cookies
    let sessionToken: string | undefined = token;

    if (!sessionToken) {
      const cookieHeader = c.req.header('Cookie') || '';
      // Try to extract from either cookie format
      const betterAuthMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
      const secureMatch = cookieHeader.match(/__Secure-better-auth\.session_token=([^;]+)/);
      sessionToken = betterAuthMatch?.[1] || secureMatch?.[1];
    }

    console.log(`[AuthMiddleware] Request Path: ${c.req.path} | Has Token: ${!!sessionToken}`);

    if (!sessionToken) {
      console.warn(`[AuthMiddleware] No session token found for request to ${c.req.path}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log(`[AuthMiddleware] Session token: ${sessionToken.substring(0, 20)}... (length: ${sessionToken.length})`);

    // Query session directly from database
    const sessionResult = await db
      .select({
        session: sessions,
        user: users
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.token, sessionToken),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!sessionResult || sessionResult.length === 0) {
      console.warn(`[AuthMiddleware] ❌ Session NOT FOUND or EXPIRED for token ${sessionToken.substring(0, 15)}...`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { session, user } = sessionResult[0];
    console.log(`[AuthMiddleware] ✓ Session found for user: ${user.email} (${user.id})`);

    c.set("user", user);
    c.set("session", session);

    await next();
  } catch (error) {
    console.error("[AuthMiddleware] Error validating session:", error);
    return c.json({ error: "Unauthorized" }, 401);
  }
};