# SelfTracker: Desktop Client

## 1. Vision
SelfTracker Desktop is a native productivity assistant designed for seamless task management and focus sessions. It combines a rich, native desktop experience with the power of cloud synchronization, allowing users to access their data securely from any machine.

## 2. Core Features

### 2.1. User Management
- **Google Sign-In**: Users authenticate via Google accounts (OAuth 2.0).
- **Secure Sessions**: Client-side session management securely synced with the backend.

### 2.2. Task Management
- **Kanban Boards**: Organize tasks into "projects" with customizable columns (To Do, In Progress, Done).
- **Task Lifecycle**: Create, read, update, delete, and move tasks.
- **Project Management**: Manage multiple projects.
- **Data Persistence**: Synced to PostgreSQL via the customized Hono backend.

### 2.3. Pomodoro Timer
- **Focus Sessions**: Built-in timer for work/break intervals.
- **Customizable**: User-defined durations for focus, short break, and long break.
- **Persistence**: Timer state syncing (future scope).

### 2.4. Desktop Integration (Tauri)
- **System Tray**: Persistent icon for quick access and background operation.
- **Global Widget**: "Always on top" mode for visibility across workspaces.
- **Native Notifications**: Alert users when sessions end.
- **Mini-Timer**: Optional discreet popup window.

## 3. Architecture

### 3.1. Client (Desktop Application)
- **Framework**: Tauri v2 (Rust + Webview)
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Responsibilities**:
    - Native integration (Tray, Window management).
    - UI rendering (Kanban, Timer).
    - Auth flow (interacting with better-auth).

### 3.2. Server (Backend API)
- **Framework**: Hono (running on Bun)
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Authentication**: better-auth (wrapping Google OAuth)
- **Responsibilities**:
    - Existing: User management, user profiles.
    - **New**: Project/Task CRUD endpoints, Timer state endpoints.
