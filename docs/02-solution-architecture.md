# Solution Architecture

## Purpose

این سند نمای کلان راه‌حل را تعریف می‌کند و مشخص می‌کند سیستم از چه اجزا و با چه اصولی ساخته می‌شود.

---

## Architectural Style

معماری کلی سیستم:

- `Modular Monolith`
- `API-first`
- `Stateless backend`
- `Direct-to-storage media upload`
- `Progressive scalability`

---

## High-Level Components

### Frontend Web App
مسئول:
- merchant dashboard
- onboarding
- product management UI
- storefront public pages

### Backend API
مسئول:
- auth
- merchant management
- product management
- media workflow
- public storefront data
- audit/logging hooks

### PostgreSQL
مسئول:
- system of record
- transactional consistency
- sessions
- merchant/product/media metadata

### Object Storage
مسئول:
- نگهداری فایل‌های media
- تصاویر محصول
- signed upload/download flows

### SMS Provider Adapter
مسئول:
- ارسال OTP
- abstraction در برابر providerهای مختلف

### Reverse Proxy
مسئول:
- TLS termination
- routing
- compression
- basic security headers

---

## High-Level Topology

User Browser / Mobile Browser
|
v
Reverse Proxy (Caddy/Nginx)
|
   +----+----+
   |         |
   v         v
Frontend   Backend API
|
+-------+--------+
|                |
v                v
   PostgreSQL         Object Storage
\
\--> SMS Provider

---

## Key Principles

### 1. Modular Monolith First
سیستم در ابتدا monolith است، اما با boundaryهای واضح.

### 2. Backend Enforces Business Rules
همه ruleهای اصلی باید در backend enforce شوند.

### 3. Frontend is a Consumer
frontend نباید source of truth باشد.

### 4. Direct Upload for Media
برای کاهش load روی backend، upload فایل مستقیم به object storage انجام می‌شود.

### 5. Low-Ops Deployment
همه اجزا باید روی VPS قابل اجرا و قابل نگهداری باشند.

### 6. Replaceable Integrations
SMS provider و storage باید پشت adapter قرار بگیرند.

---

## Deployment Model

مدل پیشنهادی:

- 1 frontend service
- 1 backend service
- 1 PostgreSQL instance
- 1 MinIO instance
- 1 reverse proxy

---

## Primary Data Flows

### Authentication Flow
1. user requests OTP
2. backend creates challenge
3. SMS provider sends code
4. user verifies OTP
5. backend creates session

### Product Creation Flow
1. merchant submits product data
2. backend validates ownership and payload
3. backend writes product in `draft` state

### Media Upload Flow
1. client requests upload intent
2. backend returns signed URL
3. client uploads directly to MinIO
4. client calls complete endpoint
5. backend validates and attaches media

### Public Storefront Flow
1. visitor opens storefront URL
2. frontend fetches published storefront data
3. public pages are rendered with SEO metadata

---

## Reliability Strategy

- stateless API
- database as source of truth
- storage decoupled via signed URLs
- explicit state machine for product/media
- health checks
- structured logs
- backup/restore process

---

## Scalability Strategy

### Phase 1
- single VPS
- vertical scaling
- optimize DB queries
- optimize media delivery

### Phase 2
- separate frontend/backend containers
- CDN optional
- DB tuning
- read-heavy optimization

### Phase 3
- only if justified by load:
  - dedicated storage node
  - separate DB machine
  - controlled horizontal scaling

---

## Non-Goals

- distributed microservices
- event bus complexity
- real-time systems
- multi-region deployment
- enterprise workflow engine


---
