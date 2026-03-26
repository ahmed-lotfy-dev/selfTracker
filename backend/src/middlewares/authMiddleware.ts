import type { MiddlewareHandler } from "hono";
import { auth } from "../../lib/auth.js";

/**
 * Middleware to authenticate requests using better-auth session tokens.
 * Uses official better-auth API to validate sessions from headers or cookies.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // Skip auth check for OPTIONS requests (CORS preflight) and auth routes (login/register)
  if (c.req.method === "OPTIONS" || c.req.path.startsWith("/api/auth")) {
    return next();
  }

  try {
    const authHeader = c.req.header("Authorization");
    const cookieHeader = c.req.header("Cookie");
    
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      console.error(`[AuthMiddleware] ❌ Unauthorized: ${c.req.method} ${c.req.path}`);
      console.error(`  Auth Header: ${authHeader ? 'Present (' + authHeader.substring(0, 15) + '...)' : 'MISSING'}`);
      console.error(`  Cookie Header: ${cookieHeader ? 'Present' : 'MISSING'}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user" as any, session.user);
    c.set("session" as any, session.session);

    await next();
  } catch (error) {
    console.error("[AuthMiddleware] Error during authentication:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};