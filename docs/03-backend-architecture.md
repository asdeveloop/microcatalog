# Backend Architecture

## Purpose

این سند معماری backend را تعریف می‌کند.

---

## Technology Stack

- `NestJS`
- `TypeScript`
- `PostgreSQL`
- `Drizzle ORM`
- `Zod` یا `class-validator` برای validation boundary
- `MinIO SDK` via adapter
- `SMS provider adapter`
- `Docker`

---

## Backend Design Principles

- modular monolith
- business logic isolated from framework
- repository pattern
- explicit DTO boundaries
- no ORM leakage into domain logic
- consistent error model
- secure-by-default APIs

---

## Modules

### Auth Module
Responsibilities:
- request OTP
- verify OTP
- create session
- revoke session
- auth rate limiting hooks
- auth audit events

### Merchant Module
Responsibilities:
- merchant creation
- merchant profile update
- storefront identity settings

### Product Module
Responsibilities:
- create/update/delete product
- state transitions
- publish/unpublish
- product listing

### Media Module
Responsibilities:
- upload intent
- upload complete
- validation
- media attachment
- cleanup

### Storefront Module
Responsibilities:
- public product read
- storefront read
- SEO-facing public data

### Audit Module
Responsibilities:
- audit event write
- sensitive action tracking

### Health Module
Responsibilities:
- liveness
- readiness
- dependency checks

---

## Recommended Folder Structure

src/
  modules/
auth/
application/
domain/
infrastructure/
presentation/
auth.module.ts
merchant/
application/
domain/
infrastructure/
presentation/
merchant.module.ts
product/
media/
storefront/
audit/
health/
  common/
config/
errors/
logging/
security/
types/
utils/
  db/
schema/
migrations/
repositories/
db.module.ts
  main.ts

---

## Layering Rules

### presentation
- controllers
- request/response DTOs
- guards
- interceptors

### application
- use cases
- orchestration
- transaction coordination

### domain
- business rules
- entities
- value objects
- policies

### infrastructure
- repository implementations
- SMS adapter
- storage adapter
- DB mapping

---

## Dependency Rules

### Allowed
- presentation -> application
- application -> domain
- application -> repository interfaces
- infrastructure -> repository interfaces
- infrastructure -> DB/external SDKs

### Forbidden
- presentation -> infrastructure directly
- domain -> NestJS decorators
- domain -> Drizzle types
- cross-module writes without owner service
- circular module dependency

---

## Session Strategy

پیشنهاد اصلی:
- session server-side record in DB
- secure cookie token for web client
- token rotation on login
- revoke support
- inactivity timeout
- absolute timeout

---

## OTP Security Rules

- hash OTP before persistence
- do not log OTP
- challenge expiration required
- max attempts required
- resend cooldown required
- generic error response
- rate limit per phone and IP

---

## Product State Machine

States:
- `draft`
- `published`
- `archived`

Rules:
- create => `draft`
- only valid draft can become `published`
- archived product is hidden from storefront
- published product changes may require validation

---

## Media State Machine

States:
- `pending_upload`
- `uploaded`
- `validated`
- `attached`
- `failed`
- `deleted`

Rules:
- only validated media can be attached
- orphaned uploads must be cleaned
- deleted media must not be publicly exposed

---

## Error Handling Strategy

تمام خطاها باید ساختار یکسان داشته باشند:

```json
{
  "error": {
"code": "RATE_LIMIT_EXCEEDED",
"type": "rate_limited",
"message": "Too many requests",
"correlationId": "req_abc123"
  }
}

```
---

## Health Endpoints

- `GET /health/live`
- `GET /health/ready`

---

## Background Jobs

حداقل jobهای لازم:

- cleanup orphan uploads
- expire OTP challenges
- purge expired sessions
- optional audit retention tasks

---

## Backend Non-Functional Requirements

- p95 API latency قابل‌قبول در load نرمال
- predictable memory usage
- graceful shutdown
- request timeout policy
- structured logs
- safe DB migrations


---
