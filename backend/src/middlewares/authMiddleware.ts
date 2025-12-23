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

    // Extract session token from query, Authorization header, or cookies
    let sessionToken: string | undefined = token;

    // Check Authorization header (Bearer token)
    if (!sessionToken) {
      const authHeader = c.req.header('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // Check cookies
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
    console.log(`[AuthMiddleware] Full token for debugging: ${sessionToken}`);

    // Query session directly from database
    console.log(`[AuthMiddleware] Querying database for session...`);
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

    console.log(`[AuthMiddleware] Query returned ${sessionResult.length} results`);

    if (sessionResult.length === 0) {
      // Debug: Check if ANY session exists for debugging
      const allSessionsCount = await db.select({ token: sessions.token }).from(sessions);
      console.log(`[AuthMiddleware] Total sessions in DB: ${allSessionsCount.length}`);

      // Check if token exists with different format
      const partialMatch = await db
        .select({ token: sessions.token })
        .from(sessions)
        .limit(5);
      console.log(`[AuthMiddleware] Sample session tokens in DB:`, partialMatch.map(s => `${s.token.substring(0, 20)}... (len: ${s.token.length})`));
    }

    if (sessionResult.length === 0) {
      console.log(`[AuthMiddleware] ❌ Session NOT FOUND or EXPIRED for token ${sessionToken.substring(0, 20)}...`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { session, user } = sessionResult[0];
    console.log(`[AuthMiddleware] ✓ Session found for user: ${user.email} (${user.id})`);

    c.set("user" as any, user);
    c.set("session", session);

    await next();
  } catch (error) {
    console.error("[AuthMiddleware] Error during authentication:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};