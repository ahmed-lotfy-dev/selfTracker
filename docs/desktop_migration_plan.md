# Desktop Migration & Logic Sharing Strategy

This document outlines the approach for building the desktop application using Tauri while sharing the core data logic (TanStack DB, ElectricSQL, and Schemas) from the mobile app.

## The Objective
Replicate the "Offline-First" capability and data synchronization in the Desktop app (Tauri) using the same logic developed for Mobile, while maintaining separate UI components tailored for each platform.

## Architecture Proposal: Bun Monorepo

We will use **Bun Workspaces** to transform the current project structure into a monorepo. This allows us to share code without duplication.

### Proposed Structure
```text
/selfTracker
├── packages/
│   ├── shared/             <-- NEW: Core logic
│   │   ├── src/
│   │   │   ├── db/          <-- Schemas & Collection logic
│   │   │   ├── types/       <-- Global TypeScript types
│   │   │   └── api/         <-- Axios instance & API wrappers
│   │   └── package.json
├── apps/
│   ├── mobile/             <-- Existing mobile app
│   ├── desktop/            <-- NEW/Refactored Tauri app
│   └── backend/            <-- Existing backend
├── package.json            <-- Root monorepo config
└── bun.lock
```

## Feasibility & Sharing Logic

### Is it doable?
**Yes, absolutely.** Both React Native and Tauri (via Webview) run JavaScript. Since we are using **TanStack DB** and **ElectricSQL**, which are designed to work in standard JavaScript environments (Browser/Node/Native), the same initialization logic can be shared.

### Strategy for Sharing
1.  **Extract Schemas**: Move `mobile/src/db/schema.ts` and `mobile/src/types/*` to `packages/shared`.
2.  **Generic Collections Provider**: Refactor the logic inside `CollectionsProvider.tsx` into a shared library. The provider itself will remain in each app (since it's a React component), but the core configuration logic will be imported from `shared`.
3.  **API Layer**: Move `axiosInstance` and base API configurations to `shared`.

---

## Monorepo Pros & Cons

| Feature | Pros | Cons |
| :--- | :--- | :--- |
| **Logic Sync** | Changes to database schema automatically apply to both apps. | Initial setup complexity (managing workspaces). |
| **Type Safety** | Shared types ensure API consistency across the whole stack. | Tooling conflicts (Metro vs Vite) require careful config. |
| **Development** | Single `bun install` for all projects. | Larger `node_modules` at the root (shared dependencies). |
| **Atomic Commits** | Feature implementation across apps in a single commit. | Build pipelines need to be workspace-aware. |

---

## Technical Considerations for Tauri
- **ElectricSQL**: Works natively in the Tauri webview just like a browser.
- **TanStack DB**: Compatible with the local storage/SQLite options available in Tauri.
- **UI Independence**: We will use different component libraries for Desktop (e.g., Shadcn/UI for React) to ensure the app feels like a "Desktop app" rather than a "blown-up mobile app."

## Next Steps
1.  **Initialize Monorepo**: Create the root `package.json` with `workspaces` field.
2.  **Create shared package**: Move types and schemas into `packages/shared`.
3.  **Update Mobile**: Change imports in the mobile app to point to `@selftracker/shared`.
4.  **Bootstrap Desktop**: Initialize the Tauri project using Vite + React and link the shared package.

> [!IMPORTANT]
> To share logic properly, avoid using React Native specific modules in the `shared` package. Stick to standard JS/TS and libraries that work in both environments (like Zod, Axios, and TanStack).
