/// <reference types="vite/client" />

interface ImportMeta {
  readonly hot: import("vite").ViteDevServer["hot"]
}
