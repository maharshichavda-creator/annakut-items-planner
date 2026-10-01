# Annakut Items Planner

A full-stack application to manage the Annakut Mahotsav item catalog, haribhakt (devotee) directory,
and yearly item allocations — built with **Angular**, **Spring Boot**, and **PostgreSQL**.

## Features

- **Items** — master catalog of festival dishes (add / edit / delete), seeded from the original
  `Annakut-items-planner.xlsx` (~640 items across square-bowl and round-bowl categories).
- **Haribhakts** — devotee directory (add / edit / delete).
- **Allocations** — allocate a batch of items to a haribhakt for the active festival year, track each
  batch through `Pending → Allocated → Collected`, and filter by haribhakt/status.
- **Festival Years** — create a new festival year each year and activate it; past years' allocation
  history is preserved and viewable read-only.
- **Users** — role-based accounts: `ADMIN` (full access) and `VOLUNTEER` (haribhakts + allocations only).

## Tech stack

| Layer     | Technology                                              |
|-----------|----------------------------------------------------------|
| Frontend  | Angular 22 (standalone components) + Angular Material    |
| Backend   | Spring Boot 3.3, Spring Security (JWT), Spring Data JPA   |
| Database  | PostgreSQL, dedicated `annakut` schema, Flyway migrations |

## Project structure

```
backend/   Spring Boot REST API (Maven)
frontend/  Angular SPA
```

## Getting started

### Prerequisites

- Java 21+
- Node.js 20+ and npm
- PostgreSQL (a database named `annakut_planner`; the app creates its own `annakut` schema)

### 1. Database

Create a database and set connection details via environment variables (defaults shown):

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=annakut_planner
DB_USER=postgres
DB_PASSWORD=postgres
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

On first run, Flyway creates the `annakut` schema, tables, a default admin user, the 2026 festival
year, and the full item catalog.

**Default admin login:** `admin` / `Admin@123` — change this after first login.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:4200`. The API base URL is configured in
`frontend/src/app/core/api-base.ts` (defaults to `http://localhost:8080/api`).

## Database schema

See [backend/src/main/resources/db/migration](backend/src/main/resources/db/migration) for the full
Flyway migration history (schema + seed data).
