# MVP Backlog

## 1. Purpose

This document defines the production-oriented MVP backlog for Micro-Catalog.

Goals:
- translate architecture and contracts into deliverable engineering work
- provide implementation order with dependencies
- make scope explicit
- separate MVP essentials from later enhancements
- support planning, delivery tracking, and acceptance review

This backlog is intentionally focused on **core product delivery** and **production readiness**, not idea expansion.

---

## 2. Backlog Structure

The backlog is organized into the following epics:

1. Foundation and Project Setup
2. Authentication and Session Management
3. User and Admin Access
4. Category Management
5. Product Management
6. Media Management
7. Public Catalog Experience
8. Security Hardening
9. Observability and Auditability
10. Deployment and Release Readiness
11. Testing and Quality Gates
12. Documentation and Operational Readiness

Each item includes:
- objective
- scope
- dependencies
- acceptance criteria
- priority

Priority legend:
- `P0` = mandatory for MVP launch
- `P1` = highly recommended in MVP window
- `P2` = can be deferred after MVP if needed

---

## 3. Epic 1 — Foundation and Project Setup

## 3.1 Project Repository Baseline
**Priority:** P0

### Objective
Create stable engineering baseline for backend, frontend, and deployment assets.

### Scope
- repository structure finalized
- environment variable structure defined
- lint/format/test scripts created
- branch and review conventions defined
- base README updated

### Dependencies
- none

### Acceptance Criteria
- project can be installed with documented commands
- backend and frontend both start in local environment
- lint and format commands run successfully
- CI placeholder or initial workflow exists
- documentation folder structure exists

---

## 3.2 Typed Configuration Baseline
**Priority:** P0

### Objective
Ensure runtime configuration is validated and environment-safe.

### Scope
- env schema for backend
- env schema for frontend
- startup validation
- clear local/staging/production separation

### Dependencies
- project repository baseline

### Acceptance Criteria
- invalid required env causes startup failure
- secrets are not hardcoded
- example env files exist
- production env contract is documented

---

## 3.3 Database Baseline
**Priority:** P0

### Objective
Prepare PostgreSQL schema management and migration workflow.

### Scope
- DB connection setup
- migration tooling configured
- initial schema bootstrap
- naming conventions enforced
- base indexes and constraints applied

### Dependencies
- typed configuration baseline

### Acceptance Criteria
- migrations can run from clean database
- schema can be recreated reliably
- rollback strategy documented
- local DB setup documented

---

## 3.4 Shared Backend Infrastructure
**Priority:** P0

### Objective
Implement reusable infrastructure primitives required by all modules.

### Scope
- error model foundation
- request validation pipeline
- structured logging
- correlation ID propagation
- base auth guard interfaces
- shared response envelope utilities

### Dependencies
- project baseline
- typed configuration baseline

### Acceptance Criteria
- all APIs can use same response/error shape
- correlation ID is included in responses and logs
- validation errors are standardized
- internal exceptions are mapped consistently

---

## 4. Epic 2 — Authentication and Session Management

## 4.1 OTP Request Flow
**Priority:** P0

### Objective
Allow a user to request login OTP using mobile number.

### Scope
- mobile validation
- OTP generation
- OTP persistence or secure challenge persistence
- resend cooldown
- SMS provider integration abstraction
- audit/logging

### Dependencies
- shared backend infrastructure
- database baseline

### Acceptance Criteria
- valid mobile can request OTP
- invalid mobile is rejected
- resend cooldown enforced
- OTP value is never exposed in API response
- request is logged safely
- provider failure returns controlled error

---

## 4.2 OTP Verify Flow
**Priority:** P0

### Objective
Authenticate user through OTP verification.

### Scope
- OTP validation
- attempt limit
- expiration handling
- create user if allowed by business policy
- session creation
- last login update
- audit event

### Dependencies
- OTP request flow

### Acceptance Criteria
- valid OTP creates authenticated session
- invalid OTP returns standardized error
- expired OTP rejected
- max attempts enforced
- session persistence works
- successful login updates user login timestamp

---

## 4.3 Session Retrieval and Logout
**Priority:** P0

### Objective
Provide current session visibility and logout action.

### Scope
- session lookup endpoint
- auth middleware/guard
- logout endpoint
- session invalidation

### Dependencies
- OTP verify flow

### Acceptance Criteria
- authenticated user can retrieve session info
- anonymous request is unauthorized
- logout invalidates current session
- invalid/expired session is handled correctly

---

## 5. Epic 3 — User and Admin Access

## 5.1 User Profile Endpoint
**Priority:** P0

### Objective
Expose authenticated user identity basics.

### Scope
- `GET /me`
- role, mobile, createdAt, lastLoginAt

### Dependencies
- session retrieval

### Acceptance Criteria
- authenticated user receives correct profile
- anonymous access denied
- response matches API contract

---

## 5.2 Admin Route Protection
**Priority:** P0

### Objective
Protect admin-only endpoints with server-side authorization.

### Scope
- role-based admin guard
- use-case level authorization checks
- standardized forbidden response

### Dependencies
- session/auth foundation

### Acceptance Criteria
- non-admin cannot access admin endpoints
- admin can access allowed admin endpoints
- forbidden responses are consistent

---

## 5.3 Admin User List
**Priority:** P1

### Objective
Allow admins to view user list for operational visibility.

### Scope
- paginated admin user list
- basic filters
- response contract

### Dependencies
- admin route protection

### Acceptance Criteria
- admin can list users
- pagination works
- non-admin denied

---

## 6. Epic 4 — Category Management

## 6.1 Public Category List
**Priority:** P0

### Objective
Expose active categories to public catalog consumers.

### Scope
- public category list endpoint
- active-only filtering
- ordering

### Dependencies
- category schema

### Acceptance Criteria
- only active categories returned
- order is deterministic
- response matches contract

---

## 6.2 Admin Category Create
**Priority:** P0

### Objective
Allow admin to create categories.

### Scope
- create endpoint
- slug validation
- parent validation
- uniqueness checks
- audit event

### Dependencies
- admin route protection
- category schema

### Acceptance Criteria
- admin can create valid category
- duplicate slug rejected
- invalid parent rejected
- audit event recorded

---

## 6.3 Admin Category Update
**Priority:** P0

### Objective
Allow admin to update category data safely.

### Scope
- partial update
- active state update
- sort order update
- hierarchy validation

### Dependencies
- admin category create

### Acceptance Criteria
- valid update succeeds
- self-parent/cycle prevented
- duplicate slug rejected
- public list reflects active changes

---

## 7. Epic 5 — Product Management

## 7.1 Admin Product Create
**Priority:** P0

### Objective
Allow admin to create products in draft state.

### Scope
- create endpoint
- required field validation
- slug uniqueness
- category existence validation
- initial draft state

### Dependencies
- admin route protection
- category management
- product schema

### Acceptance Criteria
- valid product created as `draft`
- duplicate slug rejected
- invalid category rejected
- response matches contract

---

## 7.2 Admin Product Detail and List
**Priority:** P0

### Objective
Allow admin to inspect created products.

### Scope
- admin product list
- admin product detail
- filtering by status/category/search

### Dependencies
- admin product create

### Acceptance Criteria
- admin can list products with pagination
- admin can fetch single product by id
- filters work as documented

---

## 7.3 Admin Product Update
**Priority:** P0

### Objective
Allow admin to update product fields before publishing.

### Scope
- partial update
- title/slug/content/category/price/availability/seo updates
- validation and audit

### Dependencies
- admin product create

### Acceptance Criteria
- valid updates succeed
- duplicate slug rejected
- invalid category rejected
- updated timestamps change correctly

---

## 7.4 Product Publish Flow
**Priority:** P0

### Objective
Allow admin to publish only ready products.

### Scope
- publish endpoint
- state transition validation
- publish blocker evaluation
- timestamping
- audit event

### Dependencies
- admin product update
- media management minimum upload support

### Acceptance Criteria
- draft product with required data and ready media can publish
- invalid state transition rejected
- missing required fields or media blocks publish
- published product becomes visible in public APIs

---

## 7.5 Product Archive Flow
**Priority:** P0

### Objective
Allow admin to remove product from public visibility.

### Scope
- archive endpoint
- state transition validation
- audit event

### Dependencies
- admin product detail/list

### Acceptance Criteria
- draft or published product can be archived per policy
- archived product hidden from public APIs
- invalid transition handled correctly

---

## 8. Epic 6 — Media Management

## 8.1 Product Media Upload
**Priority:** P0

### Objective
Allow admin to upload product images.

### Scope
- multipart upload endpoint
- MIME validation
- size validation
- storage integration
- metadata persistence
- product association validation

### Dependencies
- product create
- storage configuration

### Acceptance Criteria
- valid image upload succeeds
- invalid MIME rejected
- oversized file rejected
- media metadata persisted
- failed persistence does not leave inconsistent state

---

## 8.2 Product Media Reorder
**Priority:** P1

### Objective
Allow admin to control display order of product media.

### Scope
- reorder endpoint
- order normalization
- validation that all media belong to product

### Dependencies
- media upload

### Acceptance Criteria
- valid reorder updates ordering deterministically
- unknown media IDs rejected
- cross-product media IDs rejected

---

## 8.3 Product Media Delete
**Priority:** P0

### Objective
Allow admin to remove media safely.

### Scope
- delete endpoint
- storage deletion or controlled tombstone strategy
- metadata state update
- audit event

### Dependencies
- media upload

### Acceptance Criteria
- media delete removes/hides asset correctly
- repeated delete handled safely
- publish validation reflects removed media

---

## 9. Epic 7 — Public Catalog Experience

## 9.1 Public Product List
**Priority:** P0

### Objective
Expose published products to catalog users.

### Scope
- product listing endpoint
- published-only filtering
- pagination
- category filter
- search by title/slug where supported

### Dependencies
- product publish flow

### Acceptance Criteria
- only published products returned
- pagination metadata returned
- filters work as documented
- archived/draft products hidden

---

## 9.2 Public Product Detail
**Priority:** P0

### Objective
Expose product detail by slug.

### Scope
- product detail endpoint
- media
- attributes
- SEO metadata
- category summary

### Dependencies
- public product list
- media upload

### Acceptance Criteria
- published product accessible by slug
- non-published product returns not found publicly
- response shape matches contract

---

## 10. Epic 8 — Security Hardening

## 10.1 Input and Error Hardening
**Priority:** P0

### Objective
Ensure safe validation and error exposure.

### Scope
- DTO validation everywhere
- standardized error mapping
- no stack trace leaks
- no raw provider/database errors in response

### Dependencies
- shared backend infrastructure

### Acceptance Criteria
- invalid requests return standardized validation errors
- internal failures return generic error envelope
- secrets and OTP values never appear in logs/responses

---

## 10.2 Rate Limiting and Abuse Controls
**Priority:** P1

### Objective
Reduce abuse risk on auth and sensitive endpoints.

### Scope
- OTP request throttling
- OTP verify throttling
- optional IP/request limits
- abuse-safe logging

### Dependencies
- auth flows

### Acceptance Criteria
- repeated abuse attempts are limited
- safe error response returned
- legitimate flow still works within policy

---

## 10.3 Session Security Baseline
**Priority:** P0

### Objective
Secure session behavior for production environments.

### Scope
- secure cookie/session settings
- bounded TTL
- explicit invalidation behavior
- same-site policy

### Dependencies
- session management

### Acceptance Criteria
- production sessions use secure settings
- cookie flags configured correctly
- expired sessions denied consistently

---

## 11. Epic 9 — Observability and Auditability

## 11.1 Structured Logging
**Priority:** P0

### Objective
Provide actionable logs for operations and incident triage.

### Scope
- JSON logs
- level control
- correlation ID
- request summary logging
- safe redaction rules

### Dependencies
- shared backend infrastructure

### Acceptance Criteria
- logs are machine-readable
- every request includes correlation context
- secrets are not logged

---

## 11.2 Health Endpoints
**Priority:** P0

### Objective
Support runtime health checks for deployment and monitoring.

### Scope
- liveness endpoint
- readiness endpoint
- DB readiness integration

### Dependencies
- shared backend infrastructure
- database baseline

### Acceptance Criteria
- live endpoint returns success when process is healthy
- ready endpoint fails when DB is unavailable
- endpoints are lightweight and stable

---

## 11.3 Audit Event Recording
**Priority:** P1

### Objective
Persist security-relevant and admin actions.

### Scope
- audit event schema
- event writer
- capture actor/action/resource/status
- admin change coverage

### Dependencies
- auth
- category/product/media admin actions

### Acceptance Criteria
- key admin actions recorded
- login-related events recorded safely
- audit records do not store sensitive secrets

---

## 12. Epic 10 — Deployment and Release Readiness

## 12.1 Production Dockerization
**Priority:** P0

### Objective
Run backend/frontend stack reliably on VPS using containers.

### Scope
- Dockerfiles
- production compose configuration
- health checks
- persistent volumes
- restart policies

### Dependencies
- app services boot successfully

### Acceptance Criteria
- stack starts in production-like environment
- health checks work
- DB data persists
- images are versioned

---

## 12.2 Reverse Proxy and TLS Readiness
**Priority:** P0

### Objective
Prepare web exposure through hardened reverse proxy.

### Scope
- Nginx config
- upstream routing
- secure headers baseline
- body size configuration for uploads
- TLS-ready structure

### Dependencies
- production dockerization

### Acceptance Criteria
- API and web are routed correctly
- upload requests pass correctly
- direct internal service ports are not exposed publicly

---

## 12.3 Backup and Restore Baseline
**Priority:** P1

### Objective
Reduce operational risk from data loss.

### Scope
- DB backup job
- retention policy
- restore verification runbook

### Dependencies
- database baseline
- production compose

### Acceptance Criteria
- backup job runs successfully
- restore steps documented and tested at least once
- retention behavior defined

---

## 13. Epic 11 — Testing and Quality Gates

## 13.1 Unit Test Baseline
**Priority:** P0

### Objective
Protect core business rules with fast tests.

### Scope
- domain invariants
- policy logic
- state transitions
- validator logic

### Dependencies
- module implementations

### Acceptance Criteria
- critical pure logic covered
- failing business rules are caught by tests

---

## 13.2 Integration Test Baseline
**Priority:** P0

### Objective
Validate repository behavior and real DB integration.

### Scope
- repository tests
- migration application tests
- transaction behavior
- auth/session integration
- publish flow integration

### Dependencies
- database baseline
- module implementations

### Acceptance Criteria
- tests run against isolated test database
- critical persistence flows validated
- migration path tested from clean schema

---

## 13.3 API Contract Tests
**Priority:** P0

### Objective
Verify runtime behavior matches documented API contract.

### Scope
- endpoint success/failure tests
- envelope validation
- auth/authorization behavior
- pagination assertions

### Dependencies
- API implementation
- `docs/15-api-contract.md`

### Acceptance Criteria
- critical endpoints have automated contract tests
- contract drift is detected in CI

---

## 14. Epic 12 — Documentation and Operational Readiness

## 14.1 OpenAPI / Swagger Publication
**Priority:** P1

### Objective
Provide synchronized integration documentation.

### Scope
- endpoint docs
- DTO examples
- auth docs
- error docs

### Dependencies
- API implementation

### Acceptance Criteria
- docs are accessible in non-production or exported artifact
- docs reflect actual implementation

---

## 14.2 Operations Runbook Completion
**Priority:** P1

### Objective
Prepare team for deploy, rollback, incident triage, and maintenance.

### Scope
- deployment steps
- rollback steps
- backup/restore
- health check usage
- incident checklist

### Dependencies
- deployment baseline
- observability baseline

### Acceptance Criteria
- runbook reviewed
- deploy/rollback can be executed by engineer other than author

---

## 15. Launch-Critical Scope Summary

The following are **launch-critical P0 items**:

- project baseline
- typed configuration
- database baseline
- shared backend infrastructure
- OTP request/verify
- session retrieval/logout
- user profile endpoint
- admin route protection
- public category list
- admin category create/update
- admin product create/list/detail/update
- product publish/archive
- media upload/delete
- public product list/detail
- input/error hardening
- session security baseline
- structured logging
- health endpoints
- production dockerization
- reverse proxy readiness
- unit/integration/API contract test baseline

If time is constrained, these items must be completed before launch.

---

## 16. Recommended Deferred Items

Can move after MVP if necessary:

- admin user list
- media reorder
- advanced search
- richer audit metadata exploration
- aggressive caching optimization
- advanced rate-limiting policies
- restore-to-draft flow for archived products
- sophisticated analytics
- CDN invalidation workflow
- asynchronous media processing pipeline

These are useful but not launch-blocking for initial MVP.

---

## 17. Delivery Sequence

Recommended execution order:

### Phase A — Foundations
- Epic 1
- Epic 11 setup skeleton in parallel

### Phase B — Auth and Access
- Epic 2
- Epic 3

### Phase C — Catalog Structure
- Epic 4

### Phase D — Core Commerce Content
- Epic 5
- Epic 6

### Phase E — Public Read Experience
- Epic 7

### Phase F — Hardening
- Epic 8
- Epic 9

### Phase G — Productionization
- Epic 10
- Epic 12

This sequence minimizes blocking dependencies and enables earlier end-to-end validation.

---

## 18. Definition of MVP Complete

The MVP is complete when all launch-critical backlog items satisfy:

- implemented in code
- aligned with API contract
- covered by appropriate tests
- deployable on target VPS environment
- documented sufficiently for engineering and operations
- secure enough for production baseline
- observable enough for incident response
- reviewed and accepted by engineering owner

---

## 19. Final Scope Control Rule

Any new request must be evaluated against these questions before entering MVP:
1. does it unblock launch-critical user value?
2. does it reduce production risk materially?
3. is it already implied by an accepted architecture or security baseline?
4. can it be delivered without delaying P0 items?

If the answer is no, it must be deferred from MVP.

This rule protects delivery focus and prevents scope creep.