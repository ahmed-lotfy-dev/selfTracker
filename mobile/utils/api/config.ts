export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://selftracker.ahmedlotfy.dev"
