import type { MiddlewareHandler } from "hono";
import { auth } from "../../lib/auth.js";

/**
 * Robust Middleware to authenticate requests using better-auth session tokens.
 * Handles both Bearer tokens and Cookies, specifically optimized for Hono + Electric SQL.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // 1. Skip auth for OPTIONS (CORS) and public auth routes
  if (c.req.method === "OPTIONS" || c.req.path.startsWith("/api/auth")) {
    return next();
  }

  try {
    // 2. Pass the full raw request headers to better-auth
    // This is the most reliable way as it preserves Host, Origin, User-Agent, etc.
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      // Diagnostic logging
      const authHeader = c.req.header("Authorization");
      const cookieHeader = c.req.header("Cookie");
      const tokenPreview = authHeader?.startsWith("Bearer ") 
        ? authHeader.substring(7, 17) + "..." 
        : "N/A";
        
      console.error(`[AuthMiddleware] ❌ Unauthorized: ${c.req.method} ${c.req.path}`);
      console.error(`  Token Preview: ${tokenPreview}`);
      console.error(`  Has Cookie: ${!!cookieHeader}`);
      
      return c.json({ error: "Unauthorized", message: "Invalid or expired session" }, 401);
    }

    // 3. Success - inject into Hono context
    c.set("user" as any, session.user);
    c.set("session" as any, session.session);

    await next();
  } catch (error) {
    console.error("[AuthMiddleware] ❌ Critical Authentication Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};