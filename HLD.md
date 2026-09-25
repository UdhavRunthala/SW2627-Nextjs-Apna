# High-Level Design (HLD)

# Apna.co Job Application Tracker

## 1. Overview

The Apna.co Job Application Tracker is a web-based job application management system designed to make the application process more transparent for candidates and more efficient for recruiters.

The system has two main users:

* **Candidate** — submits a job application and tracks its current status.
* **Employer/Recruiter** — views submitted applications and updates their statuses individually or in batches.

The application is built using **Next.js with the App Router**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, and **Prisma ORM**.

The system follows a client → API → ORM → database architecture.

---

## 2. Goals

The main goals of the system are:

1. Allow candidates to submit job applications quickly.
2. Store application information persistently in a PostgreSQL database.
3. Give every new application a default `PENDING` status.
4. Allow recruiters to view applications in a centralized pipeline.
5. Allow recruiters to select one or multiple applications.
6. Support batch status updates.
7. Allow candidates to monitor application status without manually refreshing the page.
8. Maintain a clean and type-safe application architecture.

---

## 3. System Architecture

The system is divided into four major layers:

```text
+-----------------------------+
|       User Interface        |
|-----------------------------|
| Candidate Page              |
| Employer Dashboard          |
+--------------+--------------+
               |
               v
+-----------------------------+
|       Next.js API Layer     |
|-----------------------------|
| GET Applications            |
| POST Application            |
| PATCH Batch Status          |
+--------------+--------------+
               |
               v
+-----------------------------+
|        Prisma ORM           |
|-----------------------------|
| Database Queries            |
| Create / Read / Update      |
| Type-safe database access   |
+--------------+--------------+
               |
               v
+-----------------------------+
|        PostgreSQL           |
|-----------------------------|
| Application Records         |
| Status Information          |
+-----------------------------+
```

---

## 4. Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide Icons

Next.js App Router is used for page routing and application structure.

### Backend

The backend is implemented using Next.js Route Handlers.

The API layer provides endpoints for:

* Fetching applications
* Creating applications
* Updating multiple application statuses

### Database

* PostgreSQL

PostgreSQL provides persistent storage for application records.

### ORM

* Prisma ORM

Prisma provides a type-safe abstraction between the application and PostgreSQL database.

---

## 5. Major Components

### 5.1 Candidate Interface

The candidate interface is available at:

```text
/
```

Responsibilities:

* Display the application submission interface.
* Accept candidate/application information.
* Submit the application to the backend.
* Display submission feedback.
* Track the application's current status.

A newly created application receives the default status:

```text
PENDING
```

---

### 5.2 Employer Interface

The employer interface is available at:

```text
/employer
```

Responsibilities:

* Display the application pipeline.
* Show candidate applications in a table.
* Allow individual application selection.
* Allow selecting multiple applications.
* Provide a select-all option.
* Provide batch status actions.

Supported status updates include:

```text
VIEWED
APPROVED
REJECTED
```

---

### 5.3 Application API

The application API is located under:

```text
/app/api/applications/
```

The main route handles:

```text
GET
POST
```

The batch-update route handles:

```text
PATCH
```

The API layer acts as the communication layer between the frontend and Prisma/database.

---

### 5.4 Prisma Layer

The Prisma client is initialized through:

```text
/lib/prisma.ts
```

A Prisma client singleton is used to avoid creating unnecessary database client instances during application execution.

Prisma provides methods such as:

```text
findMany()
create()
updateMany()
```

for database operations.

---

### 5.5 Database Layer

The database schema is defined in:

```text
/prisma/schema.prisma
```

PostgreSQL stores the application data persistently.

Application status values are represented using predefined status values/enums rather than arbitrary strings.

---

## 6. Data Flow

### 6.1 Candidate Application Submission

```text
Candidate
   |
   | Fill application form
   v
Candidate UI
   |
   | POST /api/applications
   v
Next.js Route Handler
   |
   | Validate/process request
   v
Prisma ORM
   |
   | create()
   v
PostgreSQL
   |
   | Application stored
   v
Prisma
   |
   v
API Response
   |
   v
Candidate UI
```

The newly created application is assigned:

```text
PENDING
```

as its initial status.

---

## 7. Employer Status Update Flow

```text
Employer
   |
   | Select applications
   v
Employer Dashboard
   |
   | PATCH /api/applications/batch-update
   v
Next.js Route Handler
   |
   | updateMany()
   v
Prisma ORM
   |
   v
PostgreSQL
   |
   | Status updated
   v
API Response
   |
   v
Employer Dashboard
```

The batch update allows multiple application records to be updated through a single request.

---

## 8. Application Status Lifecycle

The application uses status values to represent the progress of an application.

A typical lifecycle is:

```text
PENDING
   |
   v
VIEWED
   |
   +----------+
   |          |
   v          v
APPROVED   REJECTED
```

The status represents the current state of an application.

### Status meanings

| Status   | Meaning                                                      |
| -------- | ------------------------------------------------------------ |
| PENDING  | Application has been submitted but has not yet been reviewed |
| VIEWED   | Recruiter has viewed the application                         |
| APPROVED | Application has been approved                                |
| REJECTED | Application has been rejected                                |

---

## 9. API Architecture

### GET Applications

```text
GET /api/applications
```

Purpose:

* Retrieve application records.
* Used by the application management interface.

High-level flow:

```text
Client
  -> Route Handler
  -> Prisma findMany()
  -> PostgreSQL
  -> Response
```

---

### POST Application

```text
POST /api/applications
```

Purpose:

* Create a new application.

High-level flow:

```text
Client
  -> Route Handler
  -> Prisma create()
  -> PostgreSQL
  -> Created Application
  -> Response
```

New applications receive the default `PENDING` status.

---

### PATCH Batch Update

```text
PATCH /api/applications/batch-update
```

Purpose:

* Update the status of multiple selected applications.

High-level flow:

```text
Employer UI
  -> Selected Application IDs
  -> New Status
  -> Route Handler
  -> Prisma updateMany()
  -> PostgreSQL
  -> Response
```

---

## 10. Database Architecture

The database is PostgreSQL and is accessed through Prisma.

Conceptually:

```text
+----------------------+
|     Application      |
+----------------------+
| Application ID       |
| Candidate Data       |
| Job/Application Data |
| Status               |
| Other Stored Fields  |
+----------------------+
```

The exact database fields and constraints are defined in:

```text
prisma/schema.prisma
```

Prisma converts application-level operations into database queries.

---

## 11. Security and Data Integrity

The architecture provides several mechanisms for maintaining data integrity:

### Type Safety

TypeScript provides compile-time type checking for application code.

### Prisma

Prisma provides structured and type-safe database access.

### Status Enumeration

Application statuses are restricted to predefined values rather than arbitrary text.

### Environment Variables

Database configuration is stored through environment variables such as:

```text
DATABASE_URL
```

Sensitive database credentials should not be committed directly into source control.

---

## 12. Scalability

The architecture can be extended as the application grows.

Possible future additions include:

* Authentication
* Role-based access control
* Candidate profiles
* Employer accounts
* Job listing management
* Search and filtering
* Pagination
* Email notifications
* Real-time WebSocket/SSE updates
* Application history
* Audit logs
* Analytics dashboard

The separation between UI, API, ORM, and database makes these additions easier to implement.

---

## 13. Deployment Architecture

A production deployment can follow this structure:

```text
             Internet
                |
                v
        +---------------+
        |    Vercel     |
        |   Next.js App |
        +-------+-------+
                |
                | Prisma
                v
        +---------------+
        |  PostgreSQL   |
        |    Database   |
        +---------------+
```

The Next.js application hosts both the frontend and API route handlers, while PostgreSQL provides persistent storage.

---

## 14. Project Structure

```text
SW2627-Nextjs-Apna/
│
├── apna/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── applications/
│   │   │       ├── route.ts
│   │   │       └── batch-update/
│   │   │           └── route.ts
│   │   │
│   │   ├── employer/
│   │   │   └── page.tsx
│   │   │
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   └── .env
│
├── PRD.md
├── README.md
├── package.json
└── package-lock.json
```

---

## 15. Summary

The Apna Job Application Tracker uses a layered web architecture.

The **Next.js frontend** provides candidate and employer interfaces. The **Next.js API Route Handlers** process application requests. **Prisma ORM** provides type-safe database operations, while **PostgreSQL** stores application data persistently.

The architecture supports the core workflow:

```text
Candidate submits application
            ↓
Application stored as PENDING
            ↓
Employer views application
            ↓
Employer updates status
            ↓
Database stores new status
            ↓
Candidate sees updated status
```

This architecture provides a clear separation of concerns and gives the project a foundation for adding authentication, notifications, application history, and other features in the future.
