# 📊 SelfTracker

> **Your comprehensive, local-first personal tracking assistant.**
> Track your workouts, habits, expenses, and more with seamless synchronization across Mobile, Desktop, and Web.

---

## 📖 Overview

**SelfTracker** is a robust, cross-platform application designed to help users monitor various aspects of their daily lives. Built with a **Local-First** architecture, it ensures that your data is always accessible, even offline, and syncs seamlessly when you're back online.

Whether you're lifting weights, tracking your budget, or building new habits, SelfTracker provides a unified experience across all your devices.

## ✨ Key Features

-   **📱 Cross-Platform Support**: Native experiences for **Android**, **iOS**, and **Desktop** (macOS, Linux, Windows).
-   **⚡ Local-First Architecture**: Powered by **ElectricSQL** and **TanStack DB**, ensuring instant UI interactions and robust offline capability.
-   **🔐 Secure Authentication**: Integrated with **Better Auth** for secure and session management.
-   **💪 Weights & Workouts**: comprehensive workout logging, custom routines, and progress visualization.
-   **📅 Tasks Tracking**: Daily tasks monitoring adding editing removing
-   **🍎 AI Nutrition Tracking**: Snap a photo of your meal and let **Groq AI (Llama 3.2 Vision)** automatically identify foods. Includes smart **Date Context** (log for yesterday seamlessly) and robust offline support.
-   **📅 Habit Tracking**: Daily habit monitoring with streak analytics.
-   **⚡ Optimistic Updates**: Instant UI responses with background API sync for seamless UX across all features.
-   **💰 Expense Manager**: Track your spending and categorize expenses.
-   **📈 Data Visualization**: Interactive charts and statistics for all your tracked metrics.
-   **🔄 Background Sync**: Seamless data synchronization between local device storage (SQLite/MMKV) and the central Postgres database.

---

## 🛠️ Technology Stack

SelfTracker is a monorepo organized into three main workspaces:

### 🔙 Backend (`/backend`)
A high-performance API server managing authentication, data synchronization, and business logic.
-   **Runtime**: [Bun](https://bun.sh)
-   **Framework**: [Hono](https://hono.dev)
-   **Database**: PostgreSQL
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team)
-   **Sync Engine**: [ElectricSQL](https://electric-sql.com)
-   **Authentication**: [Better Auth](https://www.better-auth.com)
-   **AI Vision**: [Groq Cloud](https://groq.com) with Llama 3.2 Vision

### 🖥️ Desktop (`/desktop`)
A blazing fast, native-feeling desktop application.
-   **Core**: [Tauri v2](https://tauri.app)
-   **Frontend**: React + Vite
-   **State/Data**: TanStack Query & TanStack Router
-   **Styling**: [TailwindCSS v4](https://tailwindcss.com)
-   **Language**: TypeScript

### 📱 Mobile (`/mobile`)
A fluid, native mobile experience.
-   **Framework**: [Expo](https://expo.dev) (React Native)
-   **Router**: Expo Router
-   **Styling**: NativeWind (TailwindCSS for Native)
-   **Local DB**: SQLite + MMKV
-   **Language**: TypeScript

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have the following installed on your machine:
-   **[Bun](https://bun.sh)** (Required for package management and backend runtime)
-   **Node.js** (LTS version recommended for Expo tools)
-   **PostgreSQL** (Database)
-   **Rust** (Required for building the Desktop app)
-   **Android Studio / Xcode** (For Mobile development)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/selftracker.git
cd selftracker
```

### 2️⃣ Backend Setup

The backend serves as the source of truth and manages authentication.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Configure Environment Variables:
    Create a `.env` file in `backend/` and configure your database URL and secrets.
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/selftracker"
    BETTER_AUTH_SECRET="your_secret_key"
    BETTER_AUTH_URL="http://localhost:8000"
    ```
4.  Run Database Migrations:
    ```bash
    bun run db:migrate
    ```
5.  Start the Server:
    ```bash
    bun run dev
    ```
    *The server will start on `http://localhost:8000`*

### 3️⃣ Desktop Setup

1.  Navigate to the desktop directory:
    ```bash
    cd ../desktop
    ```
2.  Install dependencies:
    ```bash
    bun install
    ```
3.  Start the Development App:
    ```bash
    bun run tauri dev
    ```

### 4️⃣ Mobile Setup

1.  Navigate to the mobile directory:
    ```bash
    cd ../mobile
    ```
2.  Install dependencies:
    ```bash
    bun install
    # or if you encounter issues with native modules:
    npm install
    ```
3.  Start the Expo Development Server:
    ```bash
    npx expo start
    ```
    *Scan the QR code with your Expo Go app or press `a` for Android Emulator / `i` for iOS Simulator.*

---

## 🏗️ Architecture & Sync

**SelfTracker** utilizes a sophisticated synchronization strategy to ensure data consistency without sacrificing user experience.

-   **Reads**: The application reads directly from the local database (SQLite on Mobile/Desktop) using **drizzle** and **electric-sql/client**, providing 0-latency data access.
-   **Writes**: Writes follow a **Write-Through** pattern: optimistic updates to the local store + immediate background API calls to ensure data persistence.
-   **Optimized Sync**: Uses a **Partial Sync** strategy (last 30 days for heavy tables) to ensure sub-second startup times vs downloading full history.
-   **Conflict Resolution**: Handled automatically by the sync engine (Last-Write-Wins or custom logic where defined).

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
