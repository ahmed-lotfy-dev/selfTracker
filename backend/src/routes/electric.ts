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
  "projects",
  "project_columns",
  "user_goals",
  "exercises",
  "training_splits",
  "workout_exercises",
  "expenses",
  "timer_sessions",
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

  // Server decides shape and tenant isolation
  origin.searchParams.set("table", table);

  // Tenant isolation: only show data for the current user
  // Note: For some tables like 'exercises' or 'training_splits' that might be public, 
  // we might want different logic. Focusing on user-owned data first.
  const tablesWithUserId = [
    "workout_logs", "weight_logs", "tasks", "workouts",
    "projects", "user_goals", "expenses", "timer_sessions"
  ];

  if (tablesWithUserId.includes(table)) {
    origin.searchParams.set("where", "user_id=$1");
    origin.searchParams.set("params", JSON.stringify([user.id]));
  }

  origin.searchParams.set("source_id", SOURCE_ID);
  origin.searchParams.set("secret", SOURCE_SECRET);

  const res = await fetch(origin.toString());
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
});

export default electricRouter;
