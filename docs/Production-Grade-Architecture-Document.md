## 1. Document Purpose

این سند معماری رسمی سیستم است و باید مبنای اجرا، review، onboarding و delivery تیم مهندسی قرار گیرد.

---

## 2. Architecture Goals

معماری باید این اهداف را برآورده کند:
- low operational complexity
- secure merchant authentication
- reliable product and media management
- clean modular codebase
- predictable PostgreSQL persistence
- easy deployment on VPS
- minimal external dependency surface
- safe incremental evolution without rewrite

---

## 3. Architecture Principles

### 3.1 Modular Monolith First
سیستم باید به‌صورت `modular monolith` طراحی شود.  
استفاده از microservices در این مرحله ممنوع است مگر با ADR مصوب.

### 3.2 Business Logic Isolation
business logic نباید به ORM، framework details یا storage SDK وابسته باشد.

### 3.3 Explicit Boundaries
هر module باید:
- مسئولیت مشخص
- API داخلی مشخص
- data ownership مشخص
- dependency rule مشخص

داشته باشد.

### 3.4 Reliability Over Feature Breadth
در هر trade-off، reliability نسبت به feature breadth اولویت دارد.

### 3.5 Backward-Compatible Change Preference
تا حد ممکن تغییرات باید backward-compatible rollout داشته باشند.

### 3.6 Minimal Dependency Policy
هر dependency جدید باید از نظر:
- operational cost
- security risk
- maintenance burden
- vendor lock-in
ارزیابی شود.

---

## 4. System Context

### External Actors
- `Merchant`
- `Admin/Operator`
- `SMS Provider`
- `Object Storage`
- `PostgreSQL`
- `Monitoring/Logging Stack`

### Core Use Cases
- request OTP
- verify OTP
- create/update merchant profile
- create/update/delete product
- upload product media
- publish/unpublish product
- view storefront data
- revoke session/logout

---

## 5. High-Level Architecture

```text
Client Apps
   |
   v
API Layer (NestJS Controllers)
   |
   v
Application Layer (Use Cases / Services)
   |
   +--> Domain Logic
   |
   +--> Repository Interfaces
   |
   +--> Infrastructure Ports
            |
            +--> PostgreSQL via Drizzle
            +--> Object Storage Adapter
            +--> SMS Provider Adapter
            +--> Logging / Metrics / Audit
```

---

## 6. Architectural Style

- `NestJS`
- `TypeScript`
- `PostgreSQL`
- `Drizzle ORM`
- `Repository Pattern`
- `Service/Application Layer`
- `Adapter-based infrastructure integration`
- `Dockerized deployment`
- `Single deployable backend service`

---

## 7. Module Decomposition

## 7.1 Modules

### Auth Module
Responsibilities:
- OTP request
- OTP verification
- session issuance
- session revocation
- auth audit events
- rate limit hooks

Owned Data:
- otp_challenges
- auth_attempts
- sessions

Public Internal API:
- `requestOtp()`
- `verifyOtp()`
- `createSession()`
- `revokeSession()`
- `validateSession()`

---

### Merchant Module
Responsibilities:
- merchant profile management
- merchant settings
- storefront identity data

Owned Data:
- merchants
- merchant_settings

Public Internal API:
- `createMerchant()`
- `updateMerchantProfile()`
- `getMerchantById()`

---

### Product Module
Responsibilities:
- product CRUD
- publish/unpublish
- product state validation
- product listing/query

Owned Data:
- products
- product_status_history

Public Internal API:
- `createProduct()`
- `updateProduct()`
- `publishProduct()`
- `unpublishProduct()`
- `listProducts()`

---

### Media Module
Responsibilities:
- upload intent creation
- upload completion registration
- media validation
- media attachment to products
- media cleanup/reconciliation

Owned Data:
- media_objects
- media_upload_sessions

Public Internal API:
- `createUploadIntent()`
- `completeUpload()`
- `attachMediaToProduct()`
- `deleteMedia()`

---

### Storefront Module
Responsibilities:
- public storefront queries
- published product exposure
- storefront presentation data retrieval

Owned Data:
- no primary write ownership except read models if needed

Public Internal API:
- `getStorefront()`
- `listPublishedProducts()`
- `getPublishedProduct()`

---

### Audit Module
Responsibilities:
- audit event writing
- retrieval for operators
- sensitive action tracking

Owned Data:
- audit_events

Public Internal API:
- `recordAuditEvent()`

---

### Health Module
Responsibilities:
- liveness
- readiness
- dependency checks

---

## 8. Dependency Rules

### Allowed
- Controllers -> Application Services
- Application Services -> Domain/Repositories/Ports
- Repository Implementations -> Drizzle/DB
- Infrastructure Adapters -> external systems

### Forbidden
- Controllers -> Repository directly
- Domain logic -> ORM-specific objects
- Cross-module DB table access without owner API
- Shared util package becoming hidden dependency dump
- Circular module dependencies

---

## 9. Data Ownership Rules

هر table باید owner module مشخص داشته باشد.  
هیچ module دیگری حق write مستقیم به tableهای module دیگر را ندارد.

### Rule
- cross-module writes only via service/API contract
- cross-module reads ترجیحاً via internal service; direct read فقط با approval معماری

---

## 10. Request Lifecycle

```text
HTTP Request
 -> Controller
 -> DTO validation
 -> Auth guard / session validation
 -> Application Service
 -> Domain validation
 -> Repository operations / external adapters
 -> Audit/log/metrics
 -> Response mapping
 -> HTTP Response
```

---

## 11. Authentication Architecture

## 11.1 OTP Flow

### Request OTP
Input:
- phone number

Process:
1. normalize phone
2. check rate limits
3. create otp challenge
4. generate code
5. store hashed OTP only
6. send via SMS provider
7. log auth event

### Verify OTP
Input:
- phone
- code
- challenge id or request context

Process:
1. load active challenge
2. verify expiration
3. verify attempt count
4. compare hashed code
5. mark challenge consumed
6. create/reuse merchant
7. create session
8. rotate session token
9. write audit event

## 11.2 OTP Policy
- expiration: `2-5 minutes`
- max attempts per challenge: `5`
- resend cooldown: `60 seconds`
- per phone rolling limit: required
- per IP rolling limit: required
- one-time use only
- no plaintext OTP storage
- generic failure response

## 11.3 Session Design
- cookie-based session preferred for web clients
- `HttpOnly`
- `Secure`
- `SameSite=Lax` or `Strict` based on client model
- server-side session record required
- session revocation supported
- session rotation on successful login
- inactivity timeout + absolute timeout required

---

## 12. Product Domain Design

## 12.1 Product States
Recommended states:
- `draft`
- `published`
- `archived`

### Rules
- only `draft` can be freely edited
- `published` requires minimum validation
- `archived` is not publicly visible

## 12.2 Publish Preconditions
Minimum requirements:
- title present
- price/status policy satisfied
- at least one valid media if product type requires
- merchant ownership verified
- product not soft-deleted

---

## 13. Media Architecture

## 13.1 Upload Strategy
Preferred approach:
- client requests upload intent
- server creates upload session
- server returns signed upload target
- client uploads directly to storage
- client calls complete endpoint
- server validates object metadata
- media becomes attachable

## 13.2 Media Object States
- `pending_upload`
- `uploaded`
- `validated`
- `attached`
- `failed`
- `deleted`

## 13.3 Media Rules
- enforce MIME allowlist
- enforce max size
- deterministic object keys
- merchant ownership embedded in path/key policy
- orphan cleanup job required
- signed URL TTL short-lived

## 13.4 Failure Handling
- if storage unavailable -> upload intent creation may fail gracefully
- if upload completed but finalize failed -> reconciliation job required
- deleting DB record must not silently leave file orphan without explicit cleanup strategy

---

## 14. Persistence Architecture

## 14.1 Database
- `PostgreSQL` as system of record
- all writes transactional where required
- schema managed through explicit migrations
- one authoritative schema definition

## 14.2 Repository Pattern
هر domain aggregate باید repository contract داشته باشد.

Example:
```ts
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  save(product: Product): Promise<void>;
  listByMerchant(merchantId: string, query: ProductListQuery): Promise<Product[]>;
}
```

## 14.3 Transaction Policy
از transaction فقط در این حالت‌ها استفاده شود:
- multi-table invariant preservation
- auth verification + session creation
- product publish state transition with history write
- media attach workflows where consistency matters

### Forbidden
- long-running transaction
- transaction spanning external service calls unless unavoidable
- business logic hidden inside repository transaction callback

---

## 15. External Integration Architecture

## 15.1 SMS Provider Adapter
Responsibilities:
- send OTP
- normalize provider response
- map provider error taxonomy
- emit metrics

Rules:
- adapter interface required
- no provider SDK leakage to application layer
- timeout required
- retry policy conservative
- circuit breaker recommended

## 15.2 Object Storage Adapter
Responsibilities:
- signed upload generation
- object metadata read
- delete object
- existence check if required

Rules:
- provider-neutral interface
- support `MinIO` and S3-compatible storage
- local file storage only for controlled environments

---

## 16. Error Handling Architecture

## 16.1 Error Categories
- `validation_error`
- `authentication_error`
- `authorization_error`
- `not_found`
- `conflict`
- `rate_limited`
- `dependency_failure`
- `internal_error`

## 16.2 Response Envelope
```json
{
  "error": {
    "code": "PRODUCT_INVALID_STATE",
    "type": "conflict",
    "message": "Product cannot be published in its current state",
    "correlationId": "req_123"
  }
}
```

## 16.3 Rules
- stable machine-readable `code`
- no internal stack trace in response
- `correlationId` always returned
- validation errors must include field-level details where safe
- dependency failures should be distinguishable from business failures

---

## 17. Logging, Metrics, Audit

## 17.1 Logging
All logs must be structured JSON.

Required fields:
- timestamp
- level
- service
- environment
- correlationId
- route
- actorId if available
- module
- event
- errorCode if applicable

## 17.2 Metrics
Minimum metrics:
- request count/latency/error rate
- OTP request success/failure/rate limit
- OTP verification success/failure
- session creation/revocation
- DB query latency
- storage operation success/failure
- SMS provider success/failure
- product publish success/failure

## 17.3 Audit Events
Required audit events:
- OTP verified
- login success/failure
- session revoked
- merchant profile changed
- product published/unpublished
- product deleted
- media attached/deleted
- sensitive config changed

---

## 18. Health and Readiness

### Liveness
- process alive
- event loop responsive

### Readiness
- DB connectivity
- storage reachability check if lightweight and safe
- config validity loaded
- optional degraded readiness semantics if SMS unavailable but non-auth routes still work

Endpoints:
- `GET /health/live`
- `GET /health/ready`

---

## 19. Security Baseline

### Secrets
- all secrets via environment or secret manager
- no secrets in repository
- rotation procedure required

### Input Validation
- all request DTOs validated
- whitelist mode enabled
- payload size limits enforced

### Headers / Transport
- HTTPS mandatory in production
- secure cookie flags mandatory
- CORS explicit allowlist only
- compression with care for authenticated responses

### Abuse Prevention
- auth rate limiting
- IP-based throttling
- suspicious behavior logging
- optional temporary challenge blocking

### Data Protection
- hashed OTP
- no sensitive logs
- PII access minimization
- phone masking in logs where possible

---

## 20. Deployment Architecture

## 20.1 Deployment Model
Recommended:
- single backend container
- PostgreSQL container/service
- MinIO or external S3-compatible storage
- reverse proxy (`nginx` or `caddy`)
- optional monitoring stack

## 20.2 Environment Tiers
- `local`
- `staging`
- `production`

Rules:
- staging must be deployment-parity as much as possible
- production-only config paths must be minimized

## 20.3 Runtime Requirements
- stateless API instances except session persistence in DB
- horizontal scale possible later behind reverse proxy
- local disk not used as durable source of truth in production unless explicitly approved

---

## 21. Database Change Management

### Rules
- every schema change via migration
- forward-only migrations preferred
- destructive change requires multi-step rollout
- rollback plan required before execution
- migrations must be tested on staging snapshot or representative dataset

### Safe Pattern
1. add nullable/new column
2. deploy code compatible with both schemas
3. backfill
4. switch reads/writes
5. remove old schema in later release

---

## 22. Testing Strategy

## 22.1 Unit Tests
For:
- domain rules
- service decision logic
- state transitions
- policy checks

## 22.2 Integration Tests
For:
- repository implementations
- DB transactions
- migration verification
- storage adapter behavior
- SMS adapter behavior with mocks/fakes

## 22.3 API Tests
For:
- auth flows
- product CRUD
- media finalize flow
- publish/unpublish
- error contracts

## 22.4 Smoke Tests
After deployment:
- health ready
- auth request path
- DB write/read sanity
- public storefront read
- storage signed upload path sanity

---

## 23. Operational Runbooks

Must exist before production:
- deploy runbook
- rollback runbook
- DB migration runbook
- backup runbook
- restore runbook
- SMS outage runbook
- storage outage runbook
- auth abuse incident runbook

---

## 24. Folder Structure Recommendation

```text
src/
  modules/
    auth/
      application/
      domain/
      infrastructure/
      presentation/
      auth.module.ts
    merchant/
    product/
    media/
    storefront/
    audit/
    health/
  common/
    errors/
    logging/
    config/
    security/
    types/
  db/
    schema/
    migrations/
    repositories/
    db.module.ts
    db.service.ts
  main.ts
```

### Rules
- `presentation` فقط HTTP concerns
- `application` فقط use case orchestration
- `domain` فقط business rules/models
- `infrastructure` فقط adapters/repository implementations

---

## 25. Engineering Roles and Ownership

## Tech Lead
- architecture approval
- dependency governance
- final approval for DB and security-sensitive changes

## Backend Engineers
- module implementation
- tests
- repository and service compliance

## Platform/DevOps
- containerization
- CI/CD
- observability stack
- backup/restore automation
- environment hardening

## Security Owner
- auth and session review
- threat review for sensitive endpoints
- secret and abuse-control policy review

## QA
- contract verification
- regression suites
- release signoff inputs

## Product Manager
- scope control
- acceptance criteria
- non-goal enforcement

---

## 26. Non-Goals

This architecture explicitly does not target:
- microservices
- event-driven distributed architecture
- marketplace workflows
- advanced inventory/ERP
- complex promotion engine
- payment orchestration platform
- multi-tenant custom plugin platform

---

## 27. Architecture Decision Governance

هر تصمیم مهم باید ADR داشته باشد، مخصوصاً برای:
- new external dependency
- schema redesign
- security model change
- storage strategy change
- deployment model change
- public API breaking changes

ADR template:
- context
- decision
- alternatives considered
- consequences
- rollback implications

---

## 28. Production Readiness Checklist

- module boundaries documented
- auth/session policy implemented
- rate limiting enabled
- structured logging enabled
- correlation id enabled
- audit events enabled
- health endpoints available
- backup/restore tested
- migrations tested
- rollback plan documented
- smoke tests automated
- storage and SMS degradation behavior verified
- security review completed

---

## 29. Final Architecture Decision

برای این محصول، معماری recommended و approved به‌صورت زیر است:

- `NestJS modular monolith`
- `PostgreSQL` as source of truth
- `Drizzle ORM`
- `repository-driven persistence`
- `OTP + secure session management`
- `direct-to-storage media upload`
- `VPS-friendly Docker deployment`
- `minimal external dependency policy`
- `strong operational discipline before feature expansion`

این معماری برای MVP پایدار و رشد تدریجی، بهترین نسبت بین:
- simplicity
- reliability
- cost
- maintainability
- deployability

را فراهم می‌کند.

---

