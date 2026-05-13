# 📊 SelfTracker

> **The Ultimate Local-First Personal Tracking Ecosystem.**
> Seamlessly monitor your workouts, nutrition, habits, and finances across **Mobile**, **Desktop**, and **Web** with zero-latency synchronization.

---

## 🚀 Vision & Core Philosophy

**SelfTracker** is built on a **Local-First** bedrock. Your data lives where you use it—on your device. It's always fast, always available offline, and syncs instantly when you're connected. No more spinners, no more "Unauthorized" errors on startup, and no more vendor lock-in.

---

## ✨ Features "Pro Max"

### 🛡️ Advanced Sync Engine
- **Self-Hosted ElectricSQL**: No cloud quotas, no limits. Full control over your data sync.
- **Real-Time Hydration**: Sophisticated sync-tracking system (20s initial catch-up) ensures consistent data views.
- **Partial Sync Logic**: Smart filtering (last 500 days) keeps local storage slim and startup times under 200ms.

### 🍎 AI-Powered Nutrition
- **Groq AI Vision**: Identify foods from photos using **Llama 3.2 Vision**.
- **Context-Aware Logging**: Retroactive logging for yesterday or today with automatic nutritional macro-calculations.

### 🏋️ Pro Workout Analytics
- **Dynamic Charting**: Heatmaps and streak analytics for your fitness journey.
- **Pro Design**: Premium "Glassmorphism" UI with dark mode and vibrant color palettes.

### 💰 Finance & Habits
- **Action Buttons**: One-tap quick actions for common entries.
- **Streak Protection**: Habit tracking with visual progress and reminders.

---

## 🛠️ The Tech Ecosystem

### 🔙 The Backbone (`/backend`)
- **Runtime**: [Bun](https://bun.sh) (Speed first)
- **Engine**: [Hono](https://hono.dev) with Drizzle ORM
- **Security**: [Better Auth](https://www.better-auth.com) (JWT & Sessions)
- **Sync**: Self-hosted ElectricSQL instance on Dokploy

### 📱 The Companion (`/mobile`)
- **Framework**: [Expo 55](https://expo.dev) 
- **Styling**: [TailwindCSS (NativeWind)](https://nativewind.dev)
- **State**: Zustand + MMKV (Persisted)
- **Local DB**: SQLite (Local-First Sync)

### 🖥️ The Control Center (`/desktop`)
- **Core**: [Tauri v2](https://tauri.app) (Rust-powered speed)
- **Frontend**: React + TailwindCSS v4
- **Router**: TanStack Router

---

## 🏁 Quick Start

### 1️⃣ Clone & Dependencies
```bash
git clone https://github.com/ahmed-lotfy-dev/selfTracker.git
cd selfTracker
bun install
```

### 2️⃣ Backend (Hono)
```bash
cd backend
# Setup .env (see .env.example)
bun run dev
```

### 3️⃣ Mobile (Expo)
```bash
cd mobile
# Ensure backend is running
bun run android # or ios / start
```

### 4️⃣ Desktop (Tauri)
```bash
cd desktop
bun run tauri dev
```

---

## 🐳 Self-Hosting (The Power of ElectricSQL)

SelfTracker supports full self-hosting. We've published an official **Dokploy Template** to make deployment a breeze.

1. Install **Dokploy** on your VPS.
2. Select the **ElectricSQL** template.
3. Update your `.env` to point to your new private sync engine.
4. **Result**: 0 dependencies on third-party cloud quotas.

---

## 🤝 Contributing & Community

Join us in building the most robust open-source tracking app! Follow the [Contributing Guide](CONTRIBUTING.md) to get started with features or bug fixes.

---

## 📄 License
MIT License. High Performance. High Privacy.

---

*Crafted with ❤️ by [ahmed-lotfy-dev](https://github.com/ahmed-lotfy-dev)*
