# Low-Level Design (LLD)

# Apna.co Job Application Tracker

## 1. Overview

This document describes the low-level implementation design of the Apna.co Job Application Tracker.

The application is implemented using:

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* Lucide Icons
* PostgreSQL
* Prisma ORM

The main implementation areas are:

```text
Candidate UI
Employer UI
API Route Handlers
Prisma Client
PostgreSQL Database
```

---

# 2. Directory Structure

```text
apna/
│
├── app/
│   │
│   ├── api/
│   │   └── applications/
│   │       ├── route.ts
│   │       │
│   │       └── batch-update/
│   │           └── route.ts
│   │
│   ├── employer/
│   │   └── page.tsx
│   │
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── lib/
│   └── prisma.ts
│
├── prisma/
│   └── schema.prisma
│
└── .env
```

---

# 3. Module Design

## 3.1 Root Layout

File:

```text
app/layout.tsx
```

Responsibility:

* Provides the root layout for the Next.js application.
* Acts as the common layout surrounding application pages.
* Loads global application styling and shared configuration.

---

# 4. Candidate Module

File:

```text
app/page.tsx
```

## Responsibilities

The candidate page is responsible for:

1. Displaying the application interface.
2. Accepting application information.
3. Sending application data to the API.
4. Displaying submission feedback.
5. Tracking application status.

## Basic Flow

```text
User enters application details
             |
             v
       Form submission
             |
             v
POST /api/applications
             |
             v
      Application created
             |
             v
     PENDING status
             |
             v
     UI displays result
```

---

# 5. Employer Module

File:

```text
app/employer/page.tsx
```

## Responsibilities

The employer page manages the recruiter application pipeline.

It provides:

* Application table
* Candidate/application information
* Selection checkboxes
* Select-all functionality
* Batch selection
* Status update actions

## Selection Flow

```text
Applications loaded
       |
       v
Display application table
       |
       v
Recruiter selects rows
       |
       +----> Individual selection
       |
       +----> Select all
       |
       v
Selected application IDs
       |
       v
Status action
       |
       v
PATCH batch-update API
```

---

# 6. Application API Module

Directory:

```text
app/api/applications/
```

The API module contains two main route handlers.

```text
route.ts
batch-update/route.ts
```

---

# 7. GET Application API

File:

```text
app/api/applications/route.ts
```

Method:

```http
GET
```

## Purpose

Retrieves application records from the database.

## Processing Flow

```text
GET Request
    |
    v
Route Handler
    |
    v
Prisma findMany()
    |
    v
PostgreSQL
    |
    v
Application records
    |
    v
JSON Response
```

## Database Operation

Conceptually:

```text
prisma.application.findMany()
```

The exact Prisma model name should match the model defined in:

```text
prisma/schema.prisma
```

---

# 8. POST Application API

File:

```text
app/api/applications/route.ts
```

Method:

```http
POST
```

## Purpose

Creates a new application record.

## Input

The request contains application data submitted from the candidate interface.

Conceptually:

```json
{
  "candidate": "...",
  "job": "...",
  "otherApplicationData": "..."
}
```

The exact fields are defined by the Prisma schema.

## Processing Flow

```text
Candidate Form
      |
      v
POST Request
      |
      v
Route Handler
      |
      v
Read Request Body
      |
      v
Prisma create()
      |
      v
PostgreSQL
      |
      v
Created Application
      |
      v
JSON Response
```

## Default Status

A newly submitted application receives:

```text
PENDING
```

---

# 9. Batch Update API

File:

```text
app/api/applications/batch-update/route.ts
```

Method:

```http
PATCH
```

## Purpose

Updates the status of multiple applications in a single request.

## Input

The request conceptually contains:

```json
{
  "applicationIds": [
    "id1",
    "id2",
    "id3"
  ],
  "status": "VIEWED"
}
```

The actual request structure should follow the implementation in the route handler.

## Processing Flow

```text
Employer selects applications
             |
             v
Collect application IDs
             |
             v
Select new status
             |
             v
PATCH request
             |
             v
Batch Update Route Handler
             |
             v
Prisma updateMany()
             |
             v
PostgreSQL
             |
             v
Updated records
             |
             v
API Response
```

---

# 10. Prisma Client

File:

```text
lib/prisma.ts
```

## Purpose

This file creates and exports the Prisma database client.

The rest of the application can use the exported client to interact with PostgreSQL.

Conceptually:

```text
Next.js Route Handler
        |
        v
Prisma Client
        |
        v
Prisma Query Engine
        |
        v
PostgreSQL
```

A Prisma client singleton is used so that the application does not unnecessarily create multiple Prisma client instances.

---

# 11. Database Schema

File:

```text
prisma/schema.prisma
```

The Prisma schema defines:

* Database connection
* Application models
* Fields
* Data types
* Relationships, if defined
* Enums
* Database mappings

The database used by the project is:

```text
PostgreSQL
```

---

# 12. Application Status

Application status is represented using predefined values.

The documented statuses are:

```text
PENDING
VIEWED
APPROVED
REJECTED
```

## Status Flow

```text
                +----------+
                | PENDING  |
                +----+-----+
                     |
                     v
                +----------+
                |  VIEWED  |
                +----+-----+
                     |
              +------+------+
              |             |
              v             v
       +----------+   +----------+
       | APPROVED |   | REJECTED |
       +----------+   +----------+
```

The status describes the current state of an application.

---

# 13. Database Operations

The project uses Prisma operations for database interaction.

## Find Applications

Used to retrieve application records.

```text
findMany()
```

Example conceptual operation:

```text
prisma.<ApplicationModel>.findMany()
```

---

## Create Application

Used when a candidate submits an application.

```text
create()
```

Example conceptual operation:

```text
prisma.<ApplicationModel>.create()
```

---

## Update Multiple Applications

Used by the employer batch action.

```text
updateMany()
```

Example conceptual operation:

```text
prisma.<ApplicationModel>.updateMany()
```

The exact model name should be taken from `schema.prisma`.

---

# 14. Frontend-to-Backend Interaction

## Candidate Submission

```text
+----------------+
| Candidate Page |
+-------+--------+
        |
        | POST
        v
+------------------------+
| /api/applications      |
+-----------+------------+
            |
            v
+------------------------+
| Prisma create()       |
+-----------+------------+
            |
            v
+------------------------+
| PostgreSQL             |
+------------------------+
```

---

## Employer Fetch

```text
+----------------+
| Employer Page  |
+-------+--------+
        |
        | GET
        v
+------------------------+
| /api/applications      |
+-----------+------------+
            |
            v
+------------------------+
| Prisma findMany()     |
+-----------+------------+
            |
            v
+------------------------+
| PostgreSQL             |
+------------------------+
```

---

## Employer Batch Update

```text
+----------------+
| Employer Page  |
+-------+--------+
        |
        | Select IDs
        | + Status
        v
+-----------------------------+
| /api/applications/          |
| batch-update                |
+--------------+--------------+
               |
               v
+-----------------------------+
| Prisma updateMany()        |
+--------------+--------------+
               |
               v
+-----------------------------+
| PostgreSQL                  |
+-----------------------------+
```

---

# 15. Error Handling

The API layer should handle failures at the request and database levels.

Typical failure cases include:

### Invalid Request

```text
Client
  |
  | Invalid data
  v
Route Handler
  |
  v
Validation Failure
  |
  v
Error Response
```

### Database Failure

```text
Route Handler
     |
     v
Prisma
     |
     v
Database Error
     |
     v
Error Handling
     |
     v
Error Response
```

The frontend should display an appropriate message instead of assuming that every API request succeeds.

---

# 16. Data Validation

Validation should occur before modifying the database.

Important checks include:

* Required application information exists.
* Application IDs are valid.
* A valid status is supplied for status updates.
* The selected application records exist.
* The request body is correctly formatted.

The status should only contain one of the supported values:

```text
PENDING
VIEWED
APPROVED
REJECTED
```

---

# 17. Batch Update Logic

The employer interface allows multiple applications to be updated simultaneously.

Conceptually:

```text
selectedIds = [A1, A2, A3]

newStatus = VIEWED

        ↓

Find records where ID is in:

[A1, A2, A3]

        ↓

Update their status:

VIEWED
```

This is implemented using Prisma's bulk update functionality:

```text
updateMany()
```

This avoids sending a separate update request for every selected application.

---

# 18. Client-Side State

The employer interface needs to maintain UI state for selected applications.

Conceptually:

```text
selectedApplications
        |
        +---- Application A
        +---- Application B
        +---- Application C
```

When the user selects an application:

```text
selectedApplications
        ↓
Add application ID
```

When the user deselects it:

```text
selectedApplications
        ↓
Remove application ID
```

When "Select All" is used:

```text
All visible application IDs
        ↓
selectedApplications
```

---

# 19. Batch Action Bar

The employer interface provides a contextual action area when applications are selected.

Conceptually:

```text
+--------------------------------------+
| 3 applications selected             |
|                                      |
| [ VIEWED ] [ APPROVED ] [ REJECTED ]|
+--------------------------------------+
```

The selected IDs and chosen status are sent to the batch-update endpoint.

---

# 20. Candidate Status Tracking

The candidate interface needs to obtain the current application status from the backend.

Conceptually:

```text
Candidate UI
    |
    v
Request application status
    |
    v
API
    |
    v
Prisma
    |
    v
PostgreSQL
    |
    v
Current Status
    |
    v
Candidate UI
```

This allows the candidate to see status changes without manually navigating to another page.

---

# 21. API Contract Summary

| Method | Endpoint                         | Purpose                              |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/api/applications`              | Retrieve applications                |
| POST   | `/api/applications`              | Create an application                |
| PATCH  | `/api/applications/batch-update` | Update multiple application statuses |

---

# 22. UI Routes

| Route       | Purpose                                 |
| ----------- | --------------------------------------- |
| `/`         | Candidate application interface         |
| `/employer` | Employer/recruiter application pipeline |

---

# 23. Module Dependency Diagram

```text
                  +----------------+
                  | Candidate UI  |
                  | app/page.tsx  |
                  +-------+--------+
                          |
                          v
                  +----------------+
                  | Application API|
                  +-------+--------+
                          |
                          v
                  +----------------+
                  | Prisma Client  |
                  | lib/prisma.ts  |
                  +-------+--------+
                          |
                          v
                  +----------------+
                  |  PostgreSQL    |
                  +----------------+


                  +----------------+
                  | Employer UI    |
                  | employer/      |
                  +-------+--------+
                          |
                          v
                  +----------------+
                  | Application API|
                  +-------+--------+
                          |
                          v
                  +----------------+
                  | Prisma Client  |
                  +-------+--------+
                          |
                          v
                  +----------------+
                  |  PostgreSQL    |
                  +----------------+
```

---

# 24. Request Lifecycle

A typical request follows this sequence:

```text
1. User performs an action
        ↓
2. React/Next.js UI handles the action
        ↓
3. HTTP request is sent to Route Handler
        ↓
4. Route Handler reads request data
        ↓
5. Request data is validated
        ↓
6. Prisma performs database operation
        ↓
7. PostgreSQL executes the operation
        ↓
8. Database result is returned to Prisma
        ↓
9. Route Handler creates API response
        ↓
10. Frontend updates the UI
```

---

# 25. Deployment-Level Components

For deployment, the system can be represented as:

```text
                  Users
                    |
                    v
              Internet
                    |
                    v
             +-------------+
             |   Vercel    |
             |             |
             | Next.js App |
             +------+------+
                    |
                    |
                 Prisma
                    |
                    v
             +-------------+
             | PostgreSQL  |
             |   Database  |
             +-------------+
```

Environment configuration contains the database connection information:

```text
DATABASE_URL
```

---

# 26. Non-Functional Considerations

## Performance

* Prisma provides efficient database abstraction.
* Batch updates reduce the number of database operations required for multiple selections.
* Next.js provides optimized application rendering and routing.

## Maintainability

The project separates:

```text
UI
API
Database Access
Database Schema
```

This makes individual parts easier to modify.

## Type Safety

TypeScript and Prisma provide compile-time assistance and reduce errors caused by inconsistent data structures.

## Scalability

The architecture can be extended with:

* Authentication
* Authorization
* Pagination
* Filtering
* Search
* Notifications
* Application history
* Audit logging
* Recruiter accounts
* Candidate accounts

---

# 27. Summary

The Low-Level Design consists of the following main modules:

```text
Candidate Page
     |
     v
Application API
     |
     v
Prisma Client
     |
     v
PostgreSQL


Employer Page
     |
     v
Application API
     |
     v
Prisma Client
     |
     v
PostgreSQL
```

The most important operations are:

```text
GET      -> Retrieve applications
POST     -> Create application
PATCH    -> Batch update application status
```

The project therefore implements a simple and structured application-management workflow where candidates submit applications and employers manage their statuses through a centralized pipeline.
