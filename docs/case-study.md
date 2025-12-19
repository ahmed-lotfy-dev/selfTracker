# Case Study: SelfTracker
**A Performance-First Personal Growth Companion**

> **Role:** Full-Stack Mobile Developer
> **Tech Stack:** React Native (Expo), Hono (Bun), Drizzle ORM, PostgreSQL, NativeWind
> **Platform:** iOS & Android

---

## The Challenge
I needed a single, unified place to track my personal growth metrics—weight, workout logs, and daily productivity tasks. Existing apps were either too bloated, fragmented, or locked behind subscriptions. My goal was to build a **minimalist, high-performance mobile app** that I would actually enjoy using every day, while using the opportunity to bridge my web development skills (React, Next.js) into the native mobile world using **React Native**.

## 1. Technical Architecture
I chose a modern, performance-centric stack to ensure the app feels instant and snappy, leveraging my existing TypeScript knowledge.
*   **Mobile First:** Built with **Expo** and **React Native**, ensuring a native feel with the ease of React, utilizing **Expo Router** for intuitive file-based navigation.
*   **Blazing Fast Backend:** I moved away from standard Node.js to the **Bun** runtime with **Hono**, improving API response times significantly and simplifying the development toolchain.
*   **Type Safety:** End-to-end type safety using **TypeScript** and **Drizzle ORM** ensures that backend schema changes are instantly caught on the mobile client, reducing runtime crashes and debugging time.

## 2. Solving Real Problems

### ⚡ Handling Large Datasets on Mobile
Tracking workouts and weight over years creates massive lists of data that can lag a standard mobile UI.
*   **The Issue:** Standard React Native `FlatList` performance can degrade with complex items and long histories, causing scroll stutter.
*   **The Solution:** I implemented **FlashList** (by Shopify) to recycle views efficiently, maintaining 60 FPS scrolling even with thousands of log entries. Coupled with **TanStack Query**, data is cached efficiently to minimize network requests.

### 🔄 Offline-First Reliability
A workout tracker needs to work in the gym, where signal is often weak or non-existent.
*   **The Strategy:** I architected the app to be **Offline-First**.
*   **Implementation:** Using `AsyncStorage` and a persistent query client, all logs and data are saved locally first. The app optimistically updates the UI, so the user creates a log instantly, while the background sync handles the API calls when connectivity is restored.

## 3. Key Features
*   **Visual Analytics:** Interactive charts built with `react-native-chart-kit` to visualize weight trends and workout volume over time, helping track progress at a glance.
*   **Unified Auth:** Seamless authentication using **Better Auth**, providing a secure and simple login experience across mobile and potential future web interfaces.
*   **Native Aesthetics:** Custom UI using **NativeWind** (Tailwind CSS for Native) to create a beautiful, dark-mode focused interface that respects safe areas and platform specifics without fighting the styling engine.
*   **Integrated Productivity:** A dedicated tasks section integrated alongside physical health metrics, providing a holistic view of self-improvement in one app.

## 4. What I Learned
Expanding from web to mobile brought unique challenges and learning opportunities.
*   **Native UI/UX:** Adapting web design mentalities to mobile constraints (Safe Areas, Touch Targets, Navigation stacks) required a shift in thinking.
*   **Bun & Hono:** Working with the unified Bun runtime proved that backend JavaScript can be incredibly fast and lightweight.
*   **React Native Ecosystem:** Mastering tools like Expo Router made the transition from Next.js natural, showing how powerful the current React Native ecosystem has become.

---
*This project represents my journey into high-performance mobile development, combining the best of web developer ergonomics with native performance.*
