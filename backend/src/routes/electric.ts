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

electricRouter.get("/:table", async (c) => {
  const user = c.get("user" as any);
  const table = c.req.param("table");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  if (!ALLOWED_TABLES.includes(table)) {
    return c.json({ message: "Invalid table" }, 400);
  }

  if (!SOURCE_ID || !SOURCE_SECRET) {
    console.error("ELECTRIC_SOURCE_ID or ELECTRIC_SOURCE_SECRET not set");
    return c.json({ message: "Electric configuration missing" }, 500);
  }

  const url = new URL(c.req.url);
  const origin = new URL(ELECTRIC_URL);

  // Pass Electric protocol params
  url.searchParams.forEach((v, k) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(k)) {
      origin.searchParams.set(k, v);
    }
  });

  // Determine the actual table name in the destination (Electric/DB)
  let electricTable = table;
  if (table === "tasks") electricTable = "task_items";

  origin.searchParams.set("table", electricTable);

  // Tenant isolation: only show data for the current user
  const tablesWithUserId = [
    "task_items", "workout_logs", "weight_logs", "workouts",
    "user_goals", "expenses", "timer_sessions", "habits", "food_logs"
  ];

  if (tablesWithUserId.includes(electricTable)) {
    // Include user-specific data OR global data (null userId)
    let whereClause = `user_id='${user.id}' OR user_id IS NULL`;

    // If client requested specific filtering (e.g. date ranges), combine with AND
    const clientWhere = url.searchParams.get("where");
    if (clientWhere) {
      whereClause = `(${whereClause}) AND (${clientWhere})`;
    }

    origin.searchParams.set("where", whereClause);
  }



  origin.searchParams.set("source_id", SOURCE_ID);
  origin.searchParams.set("secret", SOURCE_SECRET);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(origin.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[ElectricProxy] Error from Electric (${res.status}): ${errorText}`);

      // If it's a 503 from Electric, we should tell the client why if it's a known quota issue
      if (res.status === 503 && errorText.includes("SOURCE_IS_ERROR")) {
        return c.json({
          success: false,
          message: "ElectricSQL Source Error",
          details: "The sync source is in an error state (likely quota exceeded or database connection issue).",
          raw: errorText
        }, 503);
      }
    }

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
      console.error(`[ElectricProxy] Request timed out for table: ${table}`);
      return c.json({ message: "Request timed out", details: "ElectricSQL service took too long to respond." }, 504);
    }
    console.error(`[ElectricProxy] Fetch failed for table ${table}:`, error);
    return c.json({ message: "Internal Server Error", error: error.message }, 500);
  }
});

export default electricRouter;
