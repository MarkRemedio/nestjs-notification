# Notification Service

A NestJS-based notification service for creating, tracking, and sending notifications through a strategy-based delivery layer. The API persists notifications in PostgreSQL and exposes Swagger documentation for local exploration.

## Setup and Run

### Prerequisites
- Node.js 20+
- pnpm
- Docker Desktop (for PostgreSQL)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Start the database
```bash
docker compose up -d postgres
```

This starts a PostgreSQL instance on port 5432 with the following defaults:
- Username: notification_user
- Password: notification_password
- Database: notification_db

### 3. Run database migrations
```bash
pnpm run migration:run
```

### 4. Start the application
```bash
pnpm run start:dev
```

The service runs by default on:
- http://localhost:3000

### Optional environment variables
If you need to override the default database connection, set these before running the app or migrations both in docker-compose and .env file:
- DATABASE_HOST
- DATABASE_PORT
- DATABASE_USERNAME
- DATABASE_PASSWORD
- DATABASE_NAME
- PORT

## Test Instructions

Run the unit test suite:
```bash
pnpm test
```

Generate a coverage report:
```bash
pnpm run test:cov
```

Run end-to-end tests:
```bash
pnpm run test:e2e
```

## Assumptions
- PostgreSQL is available and reachable from the application.
- Notification providers such as email, SMS, and push are abstracted behind strategies and are currently simulated rather than connected to real third-party services.
- The API is intended for a single-service environment and does not include authentication and authorization.

## Design Decisions
- NestJS was chosen for a modular, dependency-injected architecture.
- TypeORM was used for persistence and migrations in PostgreSQL.
- A factory pattern was implemented to separate provider-specific delivery logic for email, SMS, and push notifications.
- DTO validation and Swagger documentation are enabled through NestJS pipes and decorators.
- Global exception handling is applied to provide consistent API error responses.

## Trade-offs and Limitations
- Delivery is currently simulated inside the provider strategies, so the service does not integrate with real message providers out of the box.
- Sending is performed inline during the request lifecycle rather than via a background worker or queue. No bullMQ/cron for now
- There is no seed data included; the database begins empty and populated through the API POST Notification.
- The current implementation focuses on core CRUD and send/cancel flows rather than advanced retry and queuing features.

## Database Schema, Migrations, and Seed Data

### Schema
The application uses a single table named notifications with the following fields:
- id: UUID primary key
- recipient: string
- type: enum (`EMAIL`, `SMS`, `PUSH`)
- message: string
- subject: optional string
- status: enum (`PENDING`, `DELIVERED`, `FAILED`, `CANCELLED`)
- scheduledAt: optional timestamp
- sentAt: optional timestamp
- createdAt: timestamp
- updatedAt: timestamp

### Migrations
Migrations are stored in the src/database/migrations folder:
- 1785441886003-CreateNotificationsTable.ts
- 1785442000001-UpdateNotificationsStatusEnum.ts

Run them with:
```bash
pnpm run migration:run
```

### Seed Data
No seed data is currently provided. Create notifications by sending a POST request to the API.

## API Documentation

Swagger UI is available at:
- http://localhost:3000/api

### Available endpoints
- POST /notification - Create a notification
- POST /notification/send/:id - Send a stored notification
- GET /notification - List notifications with pagination
- GET /notification/:id - Get a notification by ID
- GET /notification/status/:status - Filter notifications by status
- GET /notification/type/:type - Filter notifications by type
- PATCH /notification/cancel/:id - Cancel a pending notification


## Automated API Test

### Prerequisites
- Postman

### Steps
- Import the collection found in `postman` folder
- Run the collection