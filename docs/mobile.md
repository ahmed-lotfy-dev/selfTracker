# Mobile Application Documentation

This document provides a comprehensive overview of the `selfTracker` mobile application, covering its purpose, architecture, technologies, key features, and deployment.

## Table of Contents

- [Purpose](#purpose)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Local Development](#local-development)

## Purpose

The `selfTracker` mobile application provides a native-like, intuitive interface for users to interact with the `selfTracker` platform on iOS and Android devices. It allows users to:

-   **Track Expenses**: Easily add, view, and manage daily expenses.
-   **Manage Tasks**: Create, update, and complete tasks on the go.
-   **Log Weight**: Record weight measurements and visualize progress with charts.
-   **Track Workouts**: Log workout sessions, exercises, and monitor fitness progress.
-   **User Profile**: Manage personal information and upload profile pictures.
-   **Receive Notifications**: Get timely reminders and updates.

## Architecture

The mobile application is built using Expo and React Native, leveraging the Expo Router for file-system based navigation. It follows a component-based architecture with clear separation of concerns:

-   **Expo Router**: Handles routing and navigation within the application, creating a structured and intuitive user flow.
-   **Components**: Reusable UI elements (e.g., buttons, cards, forms) are organized for modularity and maintainability.
-   **Hooks**: Custom React hooks encapsulate reusable logic for data fetching, state management, and side effects.
-   **State Management (Zustand)**: Global application state is managed using Zustand, providing a lightweight and flexible solution.
-   **Data Fetching (Tanstack Query)**: Handles data fetching, caching, synchronization, and error handling with the backend API.
-   **Authentication (`@better-auth/expo`)**: Integrates with the backend's authentication system for secure user access.
-   **Notifications**: Manages push notifications for user engagement and reminders.

## Technologies Used

-   **Framework**: [Expo](https://expo.dev/) & [React Native](https://reactnative.dev/) - For building universal native applications.
-   **Navigation**: [Expo Router](https://expo.github.io/router/) - File-system based router for Expo and React Native.
-   **Styling**: [NativeWind](https://www.nativewind.dev/) & [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for styling.
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - A small, fast, and scalable bearbones state-management solution.
-   **Data Fetching**: [Tanstack Query](https://tanstack.com/query/latest) - Powerful asynchronous state management for React.
-   **Authentication**: [`@better-auth/expo`](https://github.com/better-auth/better-auth) - Expo-specific integration for `better-auth`.
-   **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client.
-   **Charts**: [`react-native-chart-kit`](https://github.com/indiespirit/react-native-chart-kit) - Charts for React Native.
-   **Notifications**: [`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) - Handle push notifications.
-   **Image Handling**:
    -   [`expo-image-picker`](https://docs.expo.dev/versions/latest/sdk/imagepicker/) - Access device's image library or camera.
    -   [`expo-image-manipulator`](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) - Manipulate images.
-   **Secure Storage**: [`expo-secure-store`](https://docs.expo.dev/versions/latest/sdk/securestore/) - Securely store key-value pairs.
-   **Date Utilities**: [date-fns](https://date-fns.org/) - Modern JavaScript date utility library.
-   **UI Primitives**: `@rn-primitives/*` - Unstyled, accessible UI components.
-   **Vector Icons**: `@expo/vector-icons` - Popular icon sets for React Native.

## Key Features

-   **Intuitive User Interface**: Designed for ease of use and a smooth mobile experience.
-   **Offline Support**: Leverages Tanstack Query's caching capabilities for a better offline experience.
-   **Push Notifications**: Configured to receive and display notifications for important events.
-   **Image Uploads**: Users can upload profile pictures or other relevant images.
-   **Data Visualization**: Charts for weight progress and other metrics.
-   **Authentication Flows**: Seamless sign-up, sign-in, and password recovery.

## Project Structure

```
mobile/
├── src/
│   ├── app/            # Expo Router application pages and layouts (e.g., (auth), (home))
│   ├── assets/         # Static assets (fonts, images, icons)
│   ├── components/     # Reusable UI components, categorized by feature or type (e.g., Buttons, Home, Task)
│   ├── constants/      # Application-wide constants (e.g., Colors)
│   ├── hooks/          # Custom React hooks for reusable logic (e.g., useAuth, useAdd)
│   ├── lib/            # Utility functions and external service integrations (e.g., auth-client, notifications, storage)
│   ├── store/          # Zustand stores for global state management (e.g., useAuthStore, useWeightStore)
│   └── types/          # TypeScript type definitions for data models
├── global.css          # Global Tailwind CSS styles
├── app.json            # Expo configuration file
├── babel.config.js     # Babel configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── ...
```

## Deployment

The `selfTracker` mobile application is built with Expo, allowing for easy deployment to both iOS and Android app stores.

-   **Expo EAS Build**: Use Expo Application Services (EAS) to build standalone app binaries.
-   **Environment Variables**: Configure `EXPO_PUBLIC_API_URL` in your EAS build profiles to point to your production backend API.
-   **App Store Submission**: Follow the guidelines for submitting to Apple App Store and Google Play Store.
-   **Over-the-Air (OTA) Updates**: Expo allows for instant updates to your app's JavaScript code without requiring a new app store submission.

## Local Development

Refer to the main `README.md` for detailed instructions on setting up the mobile application for local development.
