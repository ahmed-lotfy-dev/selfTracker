import { Hono } from "hono";
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const electricRouter = new Hono();

const ELECTRIC_URL = process.env.ELECTRIC_SERVICE_URL || "https://api.electric-sql.cloud/v1/shape";
const SOURCE_ID = process.env.ELECTRIC_SOURCE_ID;
const SOURCE_SECRET = process.env.ELECTRIC_SOURCE_SECRET;

const ALLOWED_TABLES = [
  "workout_logs",
  "weight_logs",
  "tasks",
  "workouts",
  "user_goals",
  "exercises",
  "training_splits",
  "workout_exercises",
  "expenses",
  "timer_sessions",
  "habits",
  "food_logs",
];

electricRouter.use("/*", authMiddleware);

electricRouter.on(["GET", "POST"], "/:table", async (c) => {
  const user = c.get("user" as any);
  const table = c.req.param("table");
  const method = c.req.method;

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (!ALLOWED_TABLES.includes(table)) {
    return c.json({ message: "Invalid table" }, 400);
  }

  if (!SOURCE_ID || !SOURCE_SECRET) {
    console.error("[ElectricProxy] ❌ Configuration missing: SOURCE_ID or SOURCE_SECRET not set");
    return c.json({ message: "Electric configuration missing" }, 500);
  }

  const url = new URL(c.req.url);
  const origin = new URL(ELECTRIC_URL);

  // 1. Pass through protocol params (offset, handle, live, etc.)
  url.searchParams.forEach((v, k) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(k)) {
      origin.searchParams.set(k, v);
    }
  });

  // 2. Set the actual table name (server-side mapping)
  let electricTable = table;
  if (table === "tasks") electricTable = "task_items";
  origin.searchParams.set("table", electricTable);

  // 3. Mandatory authorization filtering (Subset WHERE)
  // This ensures the client can ONLY see their own data.
  const tablesWithUserId = [
    "task_items", "workout_logs", "weight_logs", "workouts",
    "user_goals", "expenses", "timer_sessions", "habits", "food_logs"
  ];

  if (tablesWithUserId.includes(electricTable)) {
    // Basic user isolation using parameterized query
    // This is safer and better optimized by the sync service
    const whereClause = `"user_id" = $1 OR "user_id" IS NULL`;
    
    if (method === "GET") {
      origin.searchParams.set("where", whereClause);
      origin.searchParams.set("params[1]", user.id);
      
      // Client-side filtering via query params is NOT recommended for global shapes,
      // but if we support it, we must be careful with AND/OR precedence.
    } else {
      // For POST, the client might be sending its own subset filtering.
      // Electric combines main WHERE (URL) and subset WHERE (Body) with AND.
      origin.searchParams.set("where", whereClause);
      origin.searchParams.set("params[1]", user.id);
    }
  }

  // 4. Attach API Secrets
  origin.searchParams.set("source_id", SOURCE_ID);
  origin.searchParams.set("secret", SOURCE_SECRET);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for initial sync

  try {
    const finalUrl = origin.toString();
    const maskedUrl = finalUrl.replace(/secret=[^&]+/, "secret=***");
    console.log(`[ElectricProxy] 🔄 [${method}] Forwarding to Electric: ${maskedUrl}`);

    const startTime = Date.now();
    let res: Response;

    if (method === "POST") {
      const body = await c.req.text();
      res = await fetch(finalUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        signal: controller.signal,
      });
    } else {
      res = await fetch(finalUrl, { signal: controller.signal });
    }

    const duration = Date.now() - startTime;
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[ElectricProxy] ❌ Electric (${res.status}) after ${duration}ms: ${errorText}`);
      
      if (res.status === 401 || res.status === 403) {
        return c.json({ error: "Auth Error", message: "Electric service rejected secrets", details: errorText }, res.status);
      }
    } else {
      console.log(`[ElectricProxy] ✅ Electric (OK) in ${duration}ms`);
    }

    // Forward the response but clean up headers as per documentation
    const headers = new Headers(res.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`[ElectricProxy] ⏱️ Timeout for ${table} after 60s`);
      return c.json({ error: "Gateway Timeout", message: "Electric service took too long." }, 504);
    }
    console.error(`[ElectricProxy] 💥 System Error for ${table}:`, error.message || error);
    return c.json({ error: "Internal Error", message: error.message }, 500);
  }
});

export default electricRouter;
