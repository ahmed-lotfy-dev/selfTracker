export const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://192.168.1.5:8000"
    : "https://selftracker.ahmedlotfy.site"
