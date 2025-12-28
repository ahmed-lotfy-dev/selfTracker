import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.TAURI_DEV_HOST;

  return {
    base: "./",
    build: {
      outDir: "dist",
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent Vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
          protocol: "ws",
          host,
          port: 1421,
        }
        : undefined,
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL || "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        // 3. tell Vite to ignore watching `src - tauri`
        ignored: ["**/src-tauri/**"],
      },
    },
  };
});
