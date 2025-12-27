export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD
    ? "https://selftracker.ahmedlotfy.site"
    : "http://localhost:8000");
    
export const backendUrl = API_BASE_URL;

/**
 * Helper to construct full API URLs.
 * In development (if VITE_BACKEND_URL is not set), this returns a relative path
 * starting with /api, which triggers the Vite proxy to localhost:8000.
 * In production (or if VITE_BACKEND_URL is set), it prepends the full URL.
 */
export function getApiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
