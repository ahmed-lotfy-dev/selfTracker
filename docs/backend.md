# Backend Documentation

This document provides a comprehensive overview of the `selfTracker` backend API, covering its architecture, technologies, API endpoints, and deployment.

## Table of Contents

- [Purpose](#purpose)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Expenses](#expenses)
  - [Tasks](#tasks)
  - [Weight Logs](#weight-logs)
  - [Workouts](#workouts)
  - [Workout Logs](#workout-logs)
  - [Image Uploads](#image-uploads)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Local Development](#local-development)

## Purpose

The `selfTracker` backend serves as the central data and logic hub for the entire platform. It exposes a RESTful API that is consumed by both the mobile and web client applications. Its primary responsibilities include:

-   **User Management**: Handling user registration, authentication, and profile management.
-   **Data Storage**: Persisting all tracking data (expenses, tasks, weight, workouts) in a PostgreSQL database.
-   **Business Logic**: Implementing the core logic for managing and processing tracking data.
-   **Security**: Ensuring data integrity and protecting against common web vulnerabilities through authentication, authorization, and rate limiting.
-   **External Integrations**: Managing interactions with third-party services like Cloudinary for image storage and Resend for email.

## Architecture

The backend is built using the Hono web framework, running on the Bun runtime. It follows a layered architecture:

-   **Routes**: Define the API endpoints and handle incoming HTTP requests, delegating to services for business logic.
-   **Services**: Contain the core business logic for each feature (e.g., `expensesService`, `tasksService`). They interact with the database and other utilities.
-   **Database (Drizzle ORM)**: Manages interactions with the PostgreSQL database, providing a type-safe and efficient way to query and manipulate data.
-   **Authentication (`better-auth`)**: A dedicated module for handling user authentication, session management, and JWT token generation.
-   **Utilities (`lib/`)**: Contains shared utility functions for email, Redis caching, Arcjet security, and general helpers.

## Technologies Used

-   **Runtime**: [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime.
-   **Web Framework**: [Hono](https://hono.dev/) - A small, simple, and fast web framework for the Edge.
-   **Database**: [PostgreSQL](https://www.postgresql.org/) - A powerful, open-source relational database.
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - A modern TypeScript ORM for SQL databases.
-   **Caching/Session**: [Redis](https://redis.io/) - An open-source, in-memory data structure store.
-   **Authentication**:
    -   [`better-auth`](https://github.com/better-auth/better-auth): A flexible authentication library.
    -   `jsonwebtoken`: For JSON Web Token (JWT) generation and verification.
    -   `bcryptjs`: For secure password hashing.
-   **Image Storage**: [Cloudinary](https://cloudinary.com/) - Cloud-based image and video management.
-   **Email Services**: [Resend](https://resend.com/) - A developer-friendly email API.
-   **Security**: [Arcjet](https://arcjet.com/) - API security, rate limiting, and bot protection.
-   **Environment Variables**: [Dotenv](https://github.com/motdotla/dotenv) - Loads environment variables from a `.env` file.
-   **Date Utilities**: [date-fns](https://date-fns.org/) - Modern JavaScript date utility library.

## API Endpoints

All API endpoints are prefixed with `/api`. Authentication is handled via `better-auth` and JWTs.

### Authentication

-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Authenticate user and issue JWT.
-   `GET /api/auth/session`: Get current user session details.
-   `POST /api/auth/logout`: Invalidate user session.
-   `POST /api/auth/verify-email`: Verify user email.
-   `POST /api/auth/forgot-password`: Initiate password reset.
-   `POST /api/auth/reset-password`: Reset user password.

### Users

-   `GET /api/users/me`: Get current user's profile.
-   `PATCH /api/users/me`: Update current user's profile.
-   `GET /api/users/:id`: Get user by ID.

### Expenses

-   `GET /api/expenses`: Get all expenses for the authenticated user.
-   `POST /api/expenses`: Create a new expense.
-   `GET /api/expenses/:id`: Get a specific expense by ID.
-   `PATCH /api/expenses/:id`: Update an existing expense.
-   `DELETE /api/expenses/:id`: Delete an expense.

### Tasks

-   `GET /api/tasks`: Get all tasks for the authenticated user.
-   `POST /api/tasks`: Create a new task.
-   `GET /api/tasks/:id`: Get a specific task by ID.
-   `PATCH /api/tasks/:id`: Update an existing task.
-   `DELETE /api/tasks/:id`: Delete a task.

### Weight Logs

-   `GET /api/weightLogs`: Get all weight logs for the authenticated user.
-   `POST /api/weightLogs`: Create a new weight log.
-   `GET /api/weightLogs/:id`: Get a specific weight log by ID.
-   `PATCH /api/weightLogs/:id`: Update an existing weight log.
-   `DELETE /api/weightLogs/:id`: Delete a weight log.

### Workouts

-   `GET /api/workouts`: Get all workouts for the authenticated user.
-   `POST /api/workouts`: Create a new workout.
-   `GET /api/workouts/:id`: Get a specific workout by ID.
-   `PATCH /api/workouts/:id`: Update an existing workout.
-   `DELETE /api/workouts/:id`: Delete a workout.

### Workout Logs

-   `GET /api/workoutLogs`: Get all workout logs for the authenticated user.
-   `POST /api/workoutLogs`: Create a new workout log.
-   `GET /api/workoutLogs/:id`: Get a specific workout log by ID.
-   `PATCH /api/workoutLogs/:id`: Update an existing workout log.
-   `DELETE /api/workoutLogs/:id`: Delete a workout log.

### Image Uploads

-   `POST /api/image/upload`: Upload an image to Cloudinary.

## Database Schema

The database schema is managed using Drizzle ORM. Key tables include:

-   **`users`**: Stores user authentication details and profile information.
-   **`sessions`**: Manages user sessions.
-   **`expenses`**: Stores expense records (amount, category, date, description).
-   **`tasks`**: Stores task details (title, description, due date, status).
-   **`weightLogs`**: Stores weight measurements (weight, date).
-   **`workouts`**: Stores workout definitions (name, description).
-   **`exercises`**: Stores exercise definitions (name, description).
-   **`workoutExercises`**: Links exercises to workouts.
-   **`workoutLogs`**: Stores records of completed workouts.
-   **`userGoals`**: Stores user-defined goals.

For detailed schema definitions, refer to `backend/src/db/schema/`.

## Deployment

The backend can be deployed to any environment that supports Bun and PostgreSQL.
Key considerations for deployment:

-   **Environment Variables**: Ensure all necessary environment variables (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `RESEND_API_KEY`, `ARCJET_KEY`, etc.) are securely configured in the production environment.
-   **Database Migrations**: Apply database migrations (`bun run db:migrate`) during deployment.
-   **Process Management**: Use a process manager like PM2 or integrate with a platform's built-in process management (e.g., Docker, Kubernetes) to keep the Bun server running.
-   **Scalability**: Consider load balancing and database scaling for high-traffic applications.

## Local Development

Refer to the main `README.md` for detailed instructions on setting up the backend for local development.
