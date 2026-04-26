# Backend Module Specification

## 1. Purpose

This document defines the production-grade backend module specification for Micro-Catalog.

Goals:
- convert architecture into implementable backend boundaries
- define module responsibilities and ownership
- prevent business logic leakage across layers
- make implementation predictable for backend engineers
- support maintainability, testing, and incremental delivery

This document is implementation-oriented and should be used together with:
- `docs/03-backend-architecture.md`
- `docs/05-database-design.md`
- `docs/06-api-standards.md`
- `docs/15-api-contract.md`
- `docs/10-development-standards.md`

---

## 2. Architectural Style

Backend architecture is a **modular monolith** with explicit internal boundaries.

Rules:
- one deployable backend service
- modules are isolated by responsibility
- inter-module communication is in-process
- shared infrastructure is minimized
- each module owns its domain logic
- controllers must remain thin
- repositories must not contain business workflows
- no direct access from one module to another module’s persistence internals

Target qualities:
- low operational overhead
- fast delivery for MVP
- controlled complexity
- future extraction path if scale requires

---

## 3. Layering Model

Each backend module should follow this layering model:

1. `presentation`
2. `application`
3. `domain`
4. `infrastructure`

### 3.1 Presentation Layer

Contains:
- HTTP controllers
- request DTOs
- response mappers
- guards
- interceptors specific to transport concerns

Responsibilities:
- parse request
- validate input shape
- call application services
- map output to API contract
- never implement business workflows

### 3.2 Application Layer

Contains:
- use cases
- command/query handlers
- transaction orchestration
- cross-domain coordination
- authorization checks at use-case level
- policy invocation

Responsibilities:
- execute business scenarios
- coordinate repositories and domain services
- define transaction boundaries
- emit audit events where needed

### 3.3 Domain Layer

Contains:
- entities
- value objects
- domain services
- invariants
- domain-specific enums and policies

Responsibilities:
- hold business rules
- enforce state transitions
- remain independent from framework and transport

### 3.4 Infrastructure Layer

Contains:
- repository implementations
- ORM mapping
- database access
- external provider adapters
- cache adapters if introduced
- file storage clients
- SMS provider client

Responsibilities:
- integrate with external systems
- persist and retrieve data
- translate provider failures into controlled internal errors

---

## 4. Global Backend Rules

### 4.1 Dependency Direction

Allowed direction:

```text
presentation -> application -> domain
application -> infrastructure
infrastructure -> domain (types/interfaces only if needed)

Forbidden:
- domain depending on NestJS, ORM, HTTP, or provider SDK
- controllers depending directly on repositories
- repositories calling controllers
- one module importing another module’s internal repository implementation
```
---

### 4.2 Transaction Rules

Rules:
- transaction boundary belongs to application layer
- one use case should define one clear write transaction when needed
- avoid long-running transactions
- external network calls must not be performed inside DB transaction unless unavoidable
- publish-state changes must be atomic
- media persistence metadata update must be atomic per operation

---

### 4.3 Validation Rules

Validation has 3 levels:

1. transport validation  
   Example: required field, string shape, enum membership

2. application validation  
   Example: referenced category exists

3. domain validation  
   Example: product cannot be published without ready media

All 3 are required.
No single layer is sufficient alone.

---

### 4.4 Error Rules

Rules:
- internal exceptions must be mapped to standard application error types
- transport layer returns only standardized API error envelope
- provider/raw database errors must not leak to clients
- expected business failures should not be thrown as generic internal errors

Examples:
- invalid OTP -> business error
- duplicate slug -> conflict error
- unsupported media type -> validation/media error
- unexpected DB outage -> internal/dependency failure

---

### 4.5 Observability Rules

Each application use case must:
- emit structured logs for start/failure/success when important
- include `correlationId`
- avoid logging secrets or OTP values
- produce auditable records for security-sensitive admin actions

Audit-required actions:
- login success/failure patterns
- admin category create/update
- admin product create/update/publish/archive
- media delete
- role changes if introduced

---

## 5. Module List

Production MVP modules:

1. `auth`
2. `user`
3. `admin-user`
4. `category`
5. `product`
6. `media`
7. `health`
8. `audit`
9. `shared`

Notes:
- `shared` is not a dumping ground
- `audit` may start minimal but must exist conceptually
- `admin-user` may remain thin in MVP
- if storefront logic stays simple, public catalog endpoints may be served by `product` and `category` modules directly

---

## 6. Suggested Folder Structure

Example backend structure:

text
src/
  main.ts
  app.module.ts

  modules/
    auth/
      presentation/
        http/
          auth.controller.ts
          dto/
          response/
          guards/
      application/
        use-cases/
        services/
        policies/
      domain/
        entities/
        value-objects/
        services/
        errors/
        enums/
      infrastructure/
        repositories/
        providers/
        persistence/

    user/
      presentation/
      application/
      domain/
      infrastructure/

    admin-user/
      presentation/
      application/
      domain/
      infrastructure/

    category/
      presentation/
      application/
      domain/
      infrastructure/

    product/
      presentation/
      application/
      domain/
      infrastructure/

    media/
      presentation/
      application/
      domain/
      infrastructure/

    health/
      presentation/
      application/

    audit/
      application/
      domain/
      infrastructure/

  shared/
    kernel/
      types/
      constants/
      errors/
      result/
      pagination/
      ids/
    infrastructure/
      database/
      config/
      logging/
      security/
      validation/
      storage/
      sms/
      http/

Rules:
- shared code must be generic, reusable, and stable
- module-specific code must not be moved to shared prematurely
- DTOs must remain close to presentation layer
- repository interfaces belong to application or domain boundary, not deep inside shared unless truly generic

---

## 7. Shared Kernel Scope

Allowed in `shared/kernel`:
- base error types
- result types
- pagination primitives
- common ID types
- common utility abstractions with no business ownership
- cross-cutting enums only if truly global

Forbidden in `shared/kernel`:
- product-specific helpers
- auth-specific formatting logic
- module-specific constants
- “misc” utility collections without ownership

Rule:
If code has a clear domain owner, it belongs to that module.

---

## 8. Auth Module Specification

## 8.1 Responsibilities

Auth module owns:
- OTP request and verification flow
- session creation and invalidation
- login throttling coordination
- session lookup for authenticated requests
- auth guards integration
- normalization of mobile number for auth flow
- login-related audit events

Auth module does not own:
- user profile business beyond identity basics
- admin role management policy lifecycle
- product/category permissions semantics beyond authn/authz primitives

---

## 8.2 Public API Surface

Endpoints:
- `POST /api/v1/auth/otp/request`
- `POST /api/v1/auth/otp/verify`
- `GET /api/v1/auth/session`
- `POST /api/v1/auth/logout`

Primary use cases:
- `RequestOtpUseCase`
- `VerifyOtpUseCase`
- `GetCurrentSessionUseCase`
- `LogoutUseCase`

---

## 8.3 Domain Concepts

Entities / aggregates:
- `OtpChallenge`
- `Session`
- `AuthenticatedPrincipal` (read model / domain representation)
- `LoginAttempt` or rate-limit policy abstraction

Value objects:
- `MobileNumber`
- `OtpCode`
- `SessionId`

Rules:
- OTP must be short-lived
- OTP attempts must be bounded
- OTP must never be logged in plaintext
- session expiration must be explicit
- inactive/blocked users must not authenticate if that concept exists

---

## 8.4 Auth Dependencies

May depend on:
- user repository
- SMS provider adapter
- session repository/store
- audit module interface
- clock abstraction
- rate-limit abstraction

Must not depend on:
- product/category/media internals

---

## 8.5 Auth Error Cases

Expected business errors:
- invalid mobile format
- OTP resend too soon
- too many OTP requests
- invalid OTP
- expired OTP
- too many verification attempts
- session not found
- session expired

---

## 9. User Module Specification

## 9.1 Responsibilities

User module owns:
- user identity record
- user profile read endpoint for current authenticated principal
- user persistence basics
- role and active-state fields at entity level

User module does not own:
- OTP lifecycle
- session lifecycle
- admin-only user listing operations if separated into `admin-user`

---

## 9.2 Public API Surface

Endpoints:
- `GET /api/v1/me`

Use cases:
- `GetMyProfileUseCase`

---

## 9.3 Domain Concepts

Entity:
- `User`

Core fields:
- `id`
- `mobile`
- `role`
- `isActive`
- `createdAt`
- `lastLoginAt`

Rules:
- mobile must be unique
- role values must be controlled enum
- deactivated users must be denied authentication if policy enabled

---

## 10. Admin User Module Specification

## 10.1 Responsibilities

Admin user module owns:
- admin-visible user listing
- future admin role updates if introduced
- admin-side filters/search for user directory

MVP scope:
- read-only list endpoint is enough unless explicit role management is required

---

## 10.2 Public API Surface

Endpoints:
- `GET /api/v1/admin/users`

Use cases:
- `ListUsersForAdminUseCase`

Authorization:
- admin only

---

## 11. Category Module Specification

## 11.1 Responsibilities

Category module owns:
- category CRUD for admin
- category listing for public catalog
- category hierarchy validation
- category slug uniqueness
- category activation status
- category ordering

Does not own:
- product publish logic
- product search implementation details except category existence checks through interfaces

---

## 11.2 Public API Surface

Endpoints:
- `GET /api/v1/categories`
- `GET /api/v1/admin/categories`
- `POST /api/v1/admin/categories`
- `PATCH /api/v1/admin/categories/{id}`

Use cases:
- `ListPublicCategoriesUseCase`
- `ListAdminCategoriesUseCase`
- `CreateCategoryUseCase`
- `UpdateCategoryUseCase`

---

## 11.3 Domain Concepts

Entity:
- `Category`

Core fields:
- `id`
- `name`
- `slug`
- `parentId`
- `sortOrder`
- `isActive`

Rules:
- slug unique
- parent cannot create invalid cycle
- inactive categories may be hidden from public endpoints
- category used by products should not be deleted casually
- rename/update must preserve integrity

---

## 11.4 Category Invariants

Examples:
- no self-parenting
- no cyclic ancestry
- `sortOrder` must be bounded integer
- public listing returns only active categories
- product assigned category must exist and usually be active for publish eligibility

---

## 12. Product Module Specification

## 12.1 Responsibilities

Product module owns:
- product lifecycle
- admin product CRUD
- product publish/archive transitions
- public product listing/details
- product search/filter orchestration within MVP scope
- product attribute handling
- SEO metadata fields
- publish eligibility validation

Product module does not own:
- binary file storage mechanics
- OTP/session logic
- generic audit storage implementation

---

## 12.2 Public API Surface

Endpoints:
- `GET /api/v1/products`
- `GET /api/v1/products/{slug}`
- `GET /api/v1/admin/products`
- `POST /api/v1/admin/products`
- `GET /api/v1/admin/products/{id}`
- `PATCH /api/v1/admin/products/{id}`
- `POST /api/v1/admin/products/{id}/publish`
- `POST /api/v1/admin/products/{id}/archive`

Use cases:
- `ListPublishedProductsUseCase`
- `GetPublishedProductBySlugUseCase`
- `ListAdminProductsUseCase`
- `CreateProductUseCase`
- `GetAdminProductByIdUseCase`
- `UpdateProductUseCase`
- `PublishProductUseCase`
- `ArchiveProductUseCase`

---

## 12.3 Domain Concepts

Aggregate root:
- `Product`

Child concepts:
- `ProductAttribute`
- `ProductSeo`
- possibly `ProductSummaryView` as read model

Core fields:
- `id`
- `title`
- `slug`
- `summary`
- `description`
- `status`
- `categoryId`
- `priceAmount`
- `priceCurrency`
- `availabilityStatus`
- `publishedAt`

Status enum:
- `draft`
- `published`
- `archived`

---

## 12.4 Product Invariants

Examples:
- title required
- slug unique
- price non-negative integer
- currency restricted in MVP
- published product must satisfy readiness checks
- archived product is not visible publicly
- duplicate attribute keys not allowed per product

---

## 12.5 Publish Policy

`PublishProductUseCase` must validate at minimum:
- product exists
- current state allows transition
- required product fields are present
- category exists
- at least one media item is `ready`
- product is not internally inconsistent

Recommended implementation:
- separate `ProductPublishPolicy` domain/application service
- return structured publish blockers

Example blocker output:
json
[
  { "field": "title", "reason": "REQUIRED" },
  { "field": "media", "reason": "AT_LEAST_ONE_READY_REQUIRED" }
]

---

## 12.6 Product Read Models

Public list read model may contain:
- lightweight summary
- category snippet
- thumbnail reference

Public detail read model may contain:
- full description
- ordered media
- attributes
- seo fields

Admin list read model may contain:
- status
- mediaCount
- updatedAt
- publishability summary in future if needed

Rule:
read models may diverge from write entities for performance and clarity.

---

## 13. Media Module Specification

## 13.1 Responsibilities

Media module owns:
- product media upload handling
- file metadata persistence
- media ordering
- media deletion workflow
- file validation
- storage integration
- media state transitions

Media module does not own:
- product business fields
- publish decision final authority, though it provides readiness data

---

## 13.2 Public API Surface

Endpoints:
- `POST /api/v1/admin/products/{id}/media`
- `PATCH /api/v1/admin/products/{id}/media/order`
- `DELETE /api/v1/admin/products/{id}/media/{mediaId}`

Use cases:
- `UploadProductMediaUseCase`
- `ReorderProductMediaUseCase`
- `DeleteProductMediaUseCase`

---

## 13.3 Domain Concepts

Entity:
- `MediaAsset`

Core fields:
- `id`
- `productId`
- `type`
- `mimeType`
- `sizeBytes`
- `storageKey`
- `url`
- `status`
- `alt`
- `sortOrder`

Status enum:
- `pending`
- `ready`
- `failed`
- `deleted`

---

## 13.4 Media Validation Rules

Rules:
- only allowed MIME types
- enforce size limit
- file must belong to existing product
- sort order uniqueness should be controlled logically per product
- deleting primary/first media should remain safe after reorder normalization

---

## 13.5 Media Storage Rules

Storage integration must:
- generate deterministic or safely unique object key
- separate public URL from internal storage key
- avoid trust in client-provided file name
- allow future migration to object storage/CDN
- clean up partially failed uploads when possible

If upload flow is synchronous in MVP:
- store file
- persist metadata
- mark status `ready` on success
- mark `failed` or rollback on failure

If async processing is introduced later:
- start with `pending`
- processing worker promotes to `ready`

---

## 14. Health Module Specification

## 14.1 Responsibilities

Health module owns:
- liveness endpoint
- readiness endpoint
- dependency readiness checks

Endpoints:
- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`

Rules:
- liveness should be lightweight
- readiness may check database connectivity
- readiness must fail if service cannot handle traffic safely

---

## 15. Audit Module Specification

## 15.1 Responsibilities

Audit module owns:
- recording auditable security/business actions
- immutable-style event records
- actor/action/resource metadata capture
- support for incident review

MVP minimum events:
- OTP request/verify result summary without secret leakage
- login success/failure
- admin category create/update
- admin product create/update/publish/archive
- media delete

---

## 15.2 Audit Record Shape

Suggested event structure:
json
{
  "id": "aud_001",
  "actorId": "usr_admin_001",
  "actorType": "user",
  "action": "product.publish",
  "resourceType": "product",
  "resourceId": "prd_001",
  "status": "success",
  "metadata": {},
  "createdAt": "2026-04-26T10:30:00Z"
}

Rules:
- metadata must be bounded
- sensitive payloads must not be stored blindly
- audit writes should not break primary request unless policy says otherwise

---

## 16. Inter-Module Communication Rules

Preferred pattern:
- application service calls another module through exported interface/service
- avoid direct repository access across modules
- avoid event-driven complexity unless needed

Examples:
- product module asks category module/service if category exists
- product module asks media module/read service for ready media count
- auth module uses user module repository/service for identity lookup

Rule:
cross-module calls must use stable contracts and minimal data.

---

## 17. Authorization Design

Authorization is enforced at 2 levels:

1. route guard level  
   Example: authenticated/admin only

2. use-case policy level  
   Example: whether current actor can mutate a given resource

MVP policy set:
- anonymous can access public catalog endpoints
- authenticated user can access own profile
- admin can access admin endpoints
- no customer-owned mutable resources yet beyond session

Recommended abstractions:
- `CurrentActor`
- `AuthorizationService`
- module-level policy classes

---

## 18. Repository Design Rules

Repositories should:
- expose domain-oriented methods
- avoid leaking ORM-specific query details into application services
- return domain entities or explicit read models
- be interface-driven where practical

Bad example:
ts
productRepository.db.query.products.findMany(...)

Preferred example:
ts
productRepository.listAdminProducts(filters, pagination)

Repository categories:
- write repositories
- read repositories
- search/list repositories

Use separate read-model repositories where this improves clarity.

---

## 19. DTO and Mapper Rules

### 19.1 Request DTOs

Rules:
- transport-focused
- validated using schema-based approach
- no business logic inside DTO

### 19.2 Response Mappers

Rules:
- map internal result objects to API contract
- keep envelope formatting outside domain/application
- no ORM entities returned directly

### 19.3 Internal Command Objects

Application layer may define explicit command/query objects:
- `CreateProductCommand`
- `ListProductsQuery`
- `VerifyOtpCommand`

This improves testability and decoupling.

---

## 20. State Transition Rules

## 20.1 Product State Machine

text
draft -> published
draft -> archived
published -> archived
archived -> draft   (optional, only if explicitly supported)

MVP recommendation:
- support `draft -> published`
- support `draft -> archived`
- support `published -> archived`
- do not support restore unless business requires it

Invalid transitions must return controlled business error.

---

## 20.2 Media State Machine

Synchronous MVP:
text
pending -> ready
pending -> failed
ready -> deleted
failed -> deleted

If synchronous upload completes in one request, `pending` may be transient/internal.

---

## 21. Example Use Case Breakdown

## 21.1 Create Product

Flow:
1. validate request DTO
2. authorize admin actor
3. check category existence
4. validate slug uniqueness
5. create product aggregate in `draft`
6. persist product
7. write audit event
8. return created product summary

Transaction:
- steps 3 to 6 may run in one DB transaction if efficient
- audit may be same transaction or resilient side write depending on design

---

## 21.2 Publish Product

Flow:
1. authorize admin actor
2. load product
3. load publish dependencies:
   - category existence
   - ready media count
4. run publish policy
5. if blockers exist -> return validation/state error
6. transition product to `published`
7. persist atomically
8. write audit event
9. return success result

---

## 21.3 Upload Product Media

Flow:
1. authorize admin actor
2. validate product exists
3. validate file type and size
4. upload file to storage
5. persist media metadata
6. return media result
7. on persistence failure after upload, attempt storage cleanup

Key rule:
compensating cleanup is required when storage write succeeds but DB write fails.

---

## 22. Testing Expectations by Module

Each module should have:

### Unit tests
For:
- domain invariants
- policy logic
- state transitions
- pure services

### Integration tests
For:
- repository behavior
- DB queries
- transactional use cases
- provider adapter behavior with mocks/fakes

### API tests
For:
- endpoint contract
- auth/authorization behavior
- error envelope consistency

Priority module tests:
- auth
- product publish flow
- media upload validation
- category uniqueness and hierarchy

---

## 23. Configuration Requirements by Module

### Auth
- OTP TTL
- OTP resend cooldown
- OTP max attempts
- session TTL
- cookie settings
- SMS provider credentials

### Media
- max file size
- allowed MIME types
- storage bucket/container
- public base URL

### Database
- connection URL
- pool sizing
- migration flags

### Observability
- log level
- service name
- environment
- correlation header settings

Rule:
modules must consume typed configuration abstractions, not raw environment variables directly.

---

## 24. Implementation Prioritization

Recommended implementation order:

### Phase 1
- shared infrastructure baseline
- auth module
- user module
- category module
- health module

### Phase 2
- product module
- media module
- admin-user module basic list
- audit module minimal implementation

### Phase 3
- hardening
- observability enrichment
- advanced validation and publish blocker detail
- performance tuning

Reason:
auth + category + health provide a minimal stable skeleton,
then product/media complete business value.

---

## 25. Non-Goals

This module spec does not include:
- microservices decomposition
- event bus architecture
- CQRS infrastructure complexity
- payment/order modules
- recommendation/search-engine infrastructure
- advanced workflow engine
- multi-tenant isolation model
- background job platform design beyond minimal future compatibility

These are intentionally excluded from MVP.

---

## 26. Definition of Done for a Backend Module

A module is considered production-ready when:

- responsibilities are clearly bounded
- public endpoints are implemented against contract
- validation exists at transport/application/domain levels
- authorization is enforced correctly
- persistence is covered with migrations and constraints
- expected failures map to standard error model
- structured logs exist for important flows
- audit events exist where required
- unit + integration + API tests are present for critical flows
- configuration is typed and documented
- no direct leakage of ORM/provider errors reaches API consumers

---

## 27. Final Rules

Non-negotiable engineering rules:
- keep controllers thin
- keep domain rules explicit
- keep module ownership strict
- do not centralize unrelated business logic in shared helpers
- do not bypass repositories from controllers
- do not mix transport DTOs with domain models
- do not publish products through ad hoc repository updates
- do not leak infrastructure concerns into domain layer

This module specification is the baseline for backend implementation review and code review.

