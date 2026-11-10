# CampusFix - Campus Issue Tracker

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SkAfreen-116/campusfix)

**CampusFix** is a streamlined campus problem and maintenance tracking web application. Students, staff, and faculty can report facility issues across campus without needing an account, filter and search through submitted problems, follow the lifecycle of an issue along a validated state machine, and view real-time summary metrics.

---

## 1. Architecture Overview

CampusFix is built with a decoupled client-server architecture:

```
[ React 18 + Vite Frontend ]
           |
       HTTP/JSON
           |
           v
[ Spring Boot 3 API ]
   ├── Controller Layer   (REST endpoints, Bean Validation, DTO Records)
   ├── Service Layer      (Strict State Machine: OPEN -> IN_PROGRESS -> RESOLVED -> OPEN)
   └── Repository Layer   (Spring Data JPA + Pagination & Dynamic Search)
           |
           v
[ MySQL 8 Database ]     (Schema managed via Flyway Migration V1)
```

- **Clean Layered Boundaries**: Controllers communicate strictly through record DTOs (`IssueRequest`, `IssueResponse`, `StatusChange`, `CategoryResponse`). Database entities are never exposed across the API boundary.
- **Enforced Status Lifecycle**: Status changes are governed in **one place only** (`IssueService.validateStatusTransition`).
  - Allowed transitions: `OPEN -> IN_PROGRESS`, `IN_PROGRESS -> RESOLVED`, `RESOLVED -> OPEN` (reopen).
  - Any illegal attempt throws an `IllegalTransitionException` yielding HTTP 409 Conflict.
- **Database Migrations**: Flyway migration `V1__init.sql` seeds default categories (`Hostel`, `Laboratory`, `Classroom`, `Network`, `Other`), defines tables, foreign keys, and indexes on `(status, created_at)`.
- **Responsive UI**: Built with plain CSS Grid (no bloated UI frameworks), fully responsive down to smartphone screens, and accessible with semantic HTML and ARIA alerts.

---

## 2. Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3.5, Maven, Spring Web, Spring Data JPA, Hibernate, Bean Validation, Flyway, MySQL Connector/J, Actuator |
| **Frontend** | React 18, Vite, React Router 6, Axios, Plain CSS (CSS Grid + Flexbox) |
| **Database** | MySQL 8.0 (Production / Docker), H2 In-Memory (Test Suite) |
| **Testing** | JUnit 5, Mockito, Spring MockMvc (`@WebMvcTest`), `@DataJpaTest` with H2, Vitest, React Testing Library |
| **DevOps / CI** | Docker, Docker Compose, GitHub Actions |

---

## 3. Environment Variables

All sensitive values and environment-specific endpoints are loaded from environment variables. A template is provided in `.env.example`:

| Variable | Default Value | Description |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/campusfix?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` | JDBC URL for MySQL database |
| `DB_USER` | `campusfix` | MySQL database username |
| `DB_PASSWORD` | `campusfix_secret` | MySQL database password |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `VITE_API_URL` | `http://localhost:8080` | Base URL used by the React Axios client |

---

## 4. How to Run Locally

### Option A: Running with Docker Compose (Recommended)

1. Build the Spring Boot JAR first:
   ```bash
   cd backend
   mvn clean package -DskipTests
   cd ..
   ```

2. Start MySQL and the API service:
   ```bash
   docker compose up -d
   ```
   *The MySQL container initializes a persistent volume with healthcheck verification before the Spring Boot container starts.*

3. Start the React frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option B: Running Standalone Without Docker

1. Ensure MySQL 8 is running locally with database `campusfix`:
   ```sql
   CREATE DATABASE campusfix;
   CREATE USER 'campusfix'@'%' IDENTIFIED BY 'campusfix_secret';
   GRANT ALL PRIVILEGES ON campusfix.* TO 'campusfix'@'%';
   FLUSH PRIVILEGES;
   ```

2. Start the Backend API:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *Flyway will automatically execute `V1__init.sql` to create and seed the database tables.*

3. Start the React Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access the web application at [http://localhost:5173](http://localhost:5173).

---

## 5. How to Run Tests

### Backend Tests (JUnit 5 + Mockito + WebMvcTest + DataJpaTest)

Run the full backend test suite:
```bash
cd backend
mvn verify
```
This runs:
- **Unit Tests (`IssueServiceTest`)**: Mockito tests verifying every legal status move succeeds, illegal transitions throw 409, and missing IDs throw 404.
- **Web Layer Tests (`IssueControllerTest`)**: Spring `@WebMvcTest` verifying HTTP 400 validation error formatting, 404 handler, 409 conflict handling, 201 Created location header, and 204 No Content.
- **Repository Tests (`IssueRepositoryTest`)**: `@DataJpaTest` with in-memory H2 verifying status filters, case-insensitive title search, and pagination.

### Frontend Tests (Vitest + React Testing Library)

Run the frontend test suite:
```bash
cd frontend
npm test
```
This runs:
- Empty state test when no issues exist.
- Form field error test verifying API HTTP 400 error responses are rendered next to input fields.

---

## 6. REST API Reference

All requests and responses use JSON. Error responses strictly follow:
```json
{
  "status": 400,
  "message": "Validation failed for request",
  "fields": {
    "title": "Title must be between 5 and 120 characters"
  }
}
```

| Method | Endpoint | Description | Request Body | Response Codes |
|---|---|---|---|---|
| `GET` | `/api/issues?status=&q=&page=0&size=10` | Paged list (sort by `createdAt` desc) | None | `200 OK` |
| `GET` | `/api/issues/{id}` | Get single issue details | None | `200 OK`, `404 Not Found` |
| `POST` | `/api/issues` | Report a new issue | `IssueRequest` JSON | `201 Created` (`Location` header), `400 Bad Request` |
| `PUT` | `/api/issues/{id}` | Edit title, desc, category, priority | `IssueRequest` JSON | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `PATCH`| `/api/issues/{id}/status` | Transition status along validated path | `{"status": "IN_PROGRESS"}` | `200 OK`, `409 Conflict`, `404 Not Found` |
| `DELETE`| `/api/issues/{id}` | Delete an issue | None | `204 No Content`, `404 Not Found` |
| `GET` | `/api/issues/summary` | Issues count by status | None | `200 OK` (`{"OPEN":n,"IN_PROGRESS":n,"RESOLVED":n}`) |
| `GET` | `/api/categories` | List all campus categories | None | `200 OK` |
| `GET` | `/actuator/health` | Spring Boot Actuator health check | None | `200 OK` |

---

## 7. Deployment Guide

### Recommended Free-Tier Architecture

1. **Frontend**: Static Hosting on **Vercel** or **Netlify** (Free tier with unlimited deploys, fast CDN, zero idle delay).
2. **Backend API**: Docker Container on **Render** (Free Web Service tier, supports Docker container deployment, 512 MB RAM).
3. **Database**: Managed MySQL on **Aiven** (Free dedicated MySQL 8 instance with 1 GB storage) or **TiDB Cloud** (Free MySQL-compatible serverless tier).
