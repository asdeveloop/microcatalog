# Frontend Module Specification

## 1. Purpose

This document defines the production-grade frontend module architecture for the MVP.

It specifies:

- frontend architectural boundaries
- module decomposition
- directory structure
- dependency rules
- state management rules
- API integration rules
- route ownership
- UI responsibility boundaries
- testing expectations

This specification is intended to keep the frontend:

- maintainable
- modular
- predictable
- testable
- aligned with backend API contracts
- suitable for MVP delivery and later controlled expansion

---

## 2. Scope

This document applies to the web frontend application.

It covers:

- public catalog UI
- authentication UI
- user profile UI
- admin management UI
- shared frontend infrastructure

It does not define:

- final visual design system in full detail
- branding decisions
- marketing website strategy
- native mobile architecture

---

## 3. Architecture Goals

The frontend architecture must support the following goals:

1. clear separation between domain modules
2. minimal cross-module coupling
3. stable API consumption patterns
4. isolated route ownership
5. reusable shared UI and infrastructure
6. easy onboarding for future contributors
7. testability at unit, integration, and route level
8. controlled growth from MVP into larger product scope

---

## 4. Frontend Architecture Style

Recommended architecture style:

- modular feature-first frontend
- application shell at top level
- domain-oriented route segmentation
- shared infrastructure and shared UI libraries
- server communication encapsulated behind API client layer
- minimal global state
- local state preferred unless shared behavior is required

This is not a micro-frontend architecture.

This is a single frontend application with internal modular boundaries.

---

## 5. Suggested Technology Baseline

The exact stack may be finalized during implementation, but the architecture assumes a modern TypeScript-based SPA or SSR-capable web app.

Recommended baseline:

- `TypeScript`
- `React`
- `Next.js` or `Vite + React Router`
- `TanStack Query` or equivalent for server-state management
- `React Hook Form` or equivalent for forms
- `Zod` or equivalent for runtime validation
- CSS solution chosen consistently across project
- API integration over `REST`

If the implementation chooses a different framework, this module specification still applies conceptually.

---

## 6. Top-Level Frontend Layers

The frontend should be organized into the following top-level layers:

### 6.1 App Layer
Responsible for:
- app bootstrap
- providers
- router setup
- auth/session initialization
- layout composition
- global error boundaries
- top-level configuration

### 6.2 Module Layer
Responsible for:
- feature/domain behavior
- route-specific pages
- domain UI
- business interaction flows

Examples:
- auth
- catalog
- profile
- admin-category
- admin-product
- admin-media

### 6.3 Shared Layer
Responsible for:
- reusable UI primitives
- shared hooks
- API client
- utility helpers
- validation primitives
- constants
- shared types derived from API contracts where appropriate

### 6.4 Infrastructure Layer
Responsible for:
- HTTP client setup
- storage abstraction
- logging adapter
- telemetry integration
- environment configuration parsing

---

## 7. Core Design Rules

### Rule 1 — Feature-first organization
Frontend code must be organized primarily by feature/module, not by technical type alone.

### Rule 2 — Shared is for true reuse only
Anything under shared must be generic and reusable across multiple modules.

### Rule 3 — API calls must be centralized
Raw HTTP calls must not be scattered across pages/components.

### Rule 4 — Pages orchestrate, components render
Page-level containers own orchestration; presentational components remain focused on rendering and simple event emission.

### Rule 5 — Global state must be minimal
Do not introduce global stores for state that can remain local or server-driven.

### Rule 6 — Module ownership must be explicit
Each route and screen belongs to one module.

### Rule 7 — Type safety across boundaries
Request/response DTOs and form models must be typed and validated where needed.

### Rule 8 — Unauthorized access must fail safely
Admin UI and user-only UI must handle unauthorized/expired sessions predictably.

---

## 8. Suggested Directory Structure

Recommended baseline:

```text
src/
  app/
    providers/
    router/
    layouts/
    guards/
    config/
    bootstrap/
  modules/
    auth/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
      utils/
    catalog/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
      utils/
    profile/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
      utils/
    admin-category/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
      utils/
    admin-product/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
      utils/
    admin-media/
      api/
      components/
      hooks/
      pages/
      schemas/
      types/
      utils/
    health/
      pages/
  shared/
    ui/
    components/
    hooks/
    utils/
    types/
    constants/
    validation/
    table/
    feedback/
  infrastructure/
    http/
    auth/
    storage/
    telemetry/
    logger/
    env/
```
This structure is a baseline, not a rigid law, but the module boundaries must remain clear.

---

## 9. Route Ownership Model

Each route must have a single owning module.

Suggested MVP route ownership:

### Public routes
- `/` → `catalog`
- `/products` → `catalog`
- `/products/:slug` → `catalog`

### Auth routes
- `/auth/login` → `auth`
- `/auth/verify` → `auth`

### User routes
- `/profile` → `profile`

### Admin routes
- `/admin/categories` → `admin-category`
- `/admin/categories/new` → `admin-category`
- `/admin/categories/:id/edit` → `admin-category`
- `/admin/products` → `admin-product`
- `/admin/products/new` → `admin-product`
- `/admin/products/:id/edit` → `admin-product`
- `/admin/media` or modal/media flows → `admin-media`

### Operational routes
- `/health-ui` if needed internally → `health`

Route ownership means:
- primary page implementation belongs to module owner
- API operations belong to owner module
- validations belong to owner module
- shared UI may be consumed, but business behavior stays with owner module

---

## 10. Frontend Modules

Recommended MVP frontend modules:

1. `auth`
2. `catalog`
3. `profile`
4. `admin-category`
5. `admin-product`
6. `admin-media`
7. `health`
8. `shared`
9. `app`
10. `infrastructure`

---

## 11. Module Specification — Auth

### Responsibilities
- login form for mobile/identifier submission
- OTP verification flow
- logout flow
- session initialization on app load
- auth guard integration
- handling expired/invalid session behavior

### Owns
- login page
- verify page
- auth session hooks
- auth-related API client functions
- auth form validation schemas

### Does not own
- admin authorization policy logic beyond UI checks
- profile management
- user domain data beyond session identity

### Required capabilities
- submit login request
- submit OTP verification
- show resend/retry behavior if API supports it
- handle rate-limited errors gracefully
- persist session state according to security model
- clear session on logout

### Dependencies
- `infrastructure/http`
- `infrastructure/storage`
- `shared/ui`
- `shared/validation`

---

## 12. Module Specification — Catalog

### Responsibilities
- public product browsing
- category-based browsing if exposed
- product detail rendering
- search/filter/sort UI if in MVP scope
- pagination behavior
- catalog loading, empty, and error states

### Owns
- public catalog routes
- product list page
- product detail page
- catalog query hooks
- catalog display models

### Does not own
- product creation/edit logic
- admin publish workflow
- media upload management

### Required capabilities
- fetch published products only
- render SEO-safe/public-safe product fields only
- support pagination contract
- support filters defined by backend contract
- display product status only if appropriate for route audience

### Dependencies
- `shared/ui`
- `shared/table` only if catalog table layout is used
- `infrastructure/http`

---

## 13. Module Specification — Profile

### Responsibilities
- current user profile page
- self-view of basic account data
- session-aware page rendering

### Owns
- profile route
- profile query hook
- profile page composition

### Does not own
- admin user management
- auth login flow
- user list management

### Required capabilities
- fetch current user profile
- handle unauthorized state
- render safe account information
- support logout entry point if placed in profile area

---

## 14. Module Specification — Admin Category

### Responsibilities
- category list
- create category
- edit category
- activation/inactivation if supported
- category ordering/sort management if part of MVP

### Owns
- admin category routes
- category admin forms
- admin category validation schemas
- category mutation hooks

### Does not own
- public catalog category browsing behavior
- product assignment flows except category selection UI dependency

### Required capabilities
- list categories for admin
- create category
- edit category
- validate slug/title/business constraints
- handle conflict and validation API errors

### Key UI states
- loading
- empty
- form validation error
- server conflict
- permission denied
- successful mutation feedback

---

## 15. Module Specification — Admin Product

### Responsibilities
- admin product list
- create product
- edit product
- publish/archive/draft actions
- assign category
- attach/select media references if integrated
- manage product metadata exposed by MVP

### Owns
- admin product routes
- product admin forms
- product mutation/query hooks
- product validation schemas
- state transition UI

### Does not own
- raw media storage upload mechanics
- public catalog rendering
- category admin maintenance

### Required capabilities
- list products for admin
- create draft product
- edit existing product
- change product status according to backend rules
- support pagination/filtering/sorting for admin list
- show audit-relevant metadata where useful

### Special rules
- state transitions must be explicit in UI
- prevent accidental destructive actions
- show backend validation messages in structured form

---

## 16. Module Specification — Admin Media

### Responsibilities
- upload initiation flow if direct upload exists
- media list/selector for admin use
- media attach/detach UI where required
- preview metadata and processing status

### Owns
- media management screens/components
- upload-related hooks
- media selection dialogs if centralized

### Does not own
- full product editing
- permanent storage provider logic
- public asset delivery strategy

### Required capabilities
- upload or register media according to backend contract
- render upload progress where feasible
- show processing/ready/error states
- prevent unsupported file types/sizes based on API contract
- support selecting existing media for products if scope includes it

---

## 17. Module Specification — Health

### Responsibilities
- optional internal UI route for sanity checks
- build/version/environment visibility if explicitly permitted
- no sensitive operational leakage

This module is optional for user-facing MVP and must stay minimal.

---

## 18. Shared UI Layer

The shared UI layer contains only reusable presentation elements and generic composites.

Allowed examples:
- `Button`
- `Input`
- `Textarea`
- `Select`
- `Modal`
- `Drawer`
- `Table`
- `Pagination`
- `Badge`
- `Spinner`
- `EmptyState`
- `ErrorState`
- `ConfirmDialog`

Rules:
- shared UI must not contain domain-specific API logic
- shared UI may accept domain data via props
- shared UI should be accessible by default
- visual consistency should be enforced here

---

## 19. Shared Components vs Module Components

### Shared components
Use when:
- reused across multiple modules
- domain-agnostic
- behavior remains generic

### Module components
Use when:
- tied to one module’s vocabulary or flow
- coupled to one module’s form/model/API
- unlikely to be reused safely elsewhere

Examples:

Shared:
- `DataTable`
- `PageHeader`
- `StatusBadge` if generic
- `PaginationControl`

Module-specific:
- `ProductStatusActionPanel`
- `CategoryForm`
- `OtpVerifyForm`
- `MediaPickerDialog`

---

## 20. State Management Policy

Frontend state must be categorized explicitly.

### 20.1 Server state
Use query/mutation library for:
- products
- categories
- profile data
- media lists
- auth session fetch/refresh if applicable

This data should not be duplicated into custom global state unless necessary.

### 20.2 UI state
Use local component/page state for:
- modal open/close
- selected row
- active tab
- form drafts
- optimistic local interactions when justified

### 20.3 Global app state
Use sparingly for:
- authenticated session summary
- theme if present
- global notifications if centrally managed

### Rule
Do not create a large global store as default architecture.

---

## 21. API Integration Rules

All API communication must flow through a controlled client layer.

Recommended pattern:

text
module -> module api functions/hooks -> infrastructure http client

Rules:
- raw `fetch`/`axios` calls must not be repeated in page components
- request/response typing must be centralized
- auth headers/cookies/session handling must be handled consistently
- correlation/request id handling should be supported where applicable
- API errors should be normalized before reaching presentation layer

---

## 22. API Error Handling Model

The frontend must consume the standardized backend error envelope.

UI code should distinguish at minimum:

- validation errors
- unauthorized
- forbidden
- not found
- conflict
- rate limit
- server error
- network/unavailable

Rules:
- do not expose raw server internals to users
- show actionable validation feedback for field errors
- redirect or session-clear on unauthorized when needed
- show retry option for transient failures where appropriate

---

## 23. Validation Strategy

Validation should exist at two levels:

### Client-side validation
For:
- basic required fields
- field length checks
- format checks
- early UX feedback

### Server-side validation
Backend remains source of truth.

Rules:
- frontend validation must not diverge intentionally from API contract
- schema definitions should be colocated with owning module
- critical business validation must not rely solely on frontend

---

## 24. Auth and Session Handling Rules

The frontend must clearly handle:

- unauthenticated user
- authenticated regular user
- authenticated admin user
- expired session
- invalid verification flow state

Rules:
- protected routes require guard logic
- admin routes require role-aware guard logic
- session bootstrap should avoid flicker where possible
- logout must clear local auth artifacts
- unauthorized API responses must trigger safe fallback behavior

---

## 25. Route Guard Strategy

Recommended guard types:

### PublicGuard
Allows anonymous access.

### AuthenticatedGuard
Requires logged-in user.

### AdminGuard
Requires authenticated admin role.

### GuestOnlyGuard
For login/OTP routes when authenticated users should be redirected away.

Rules:
- guards should be composable
- guards should not duplicate API logic
- authorization checks in UI complement but do not replace backend authorization

---

## 26. Form Design Rules

Forms must follow consistent rules.

Requirements:
- typed form model
- validation schema
- server error mapping
- disabled/loading submit states
- duplicate submit prevention
- clear success behavior
- predictable reset behavior

Large forms like product create/edit should be decomposed into sub-sections, for example:
- basic info
- categorization
- status
- media attachments

---

## 27. Table/List Screen Rules

Admin list screens should follow consistent patterns:

- filter area
- sort support where needed
- pagination support
- loading state
- empty state
- error state
- row actions
- batch actions only if truly required

Do not introduce advanced grid complexity unless MVP requires it.

---

## 28. Loading and Feedback UX Rules

Every async UI flow must define:

- initial loading state
- background refetch behavior
- mutation pending state
- success feedback
- error feedback
- empty state where applicable

Rules:
- avoid silent failures
- avoid permanent spinners without timeout/fallback UX
- mutation success should be visible but not noisy

---

## 29. File/Media Upload UX Rules

If media upload exists in MVP, the UI must define:

- allowed file types
- max file size messaging
- upload progress or pending indication
- success state
- failure state
- retry path if possible
- attachment/selection result

Rules:
- do not trust client-only validation
- large file errors must be handled gracefully
- UI must reflect media processing states if asynchronous

---

## 30. Environment and Configuration Rules

Frontend runtime configuration must be explicit.

Allowed examples:
- API base URL
- public app environment label
- public asset base URL if needed
- observability DSN if public-safe

Rules:
- do not expose secrets in frontend env
- validate required public env values at startup/build time
- configuration access must be centralized under infrastructure/env

---

## 31. Telemetry and Logging Rules

Frontend observability should remain minimal but useful.

May include:
- route error capture
- unexpected runtime exceptions
- API failure trends
- performance signals if tooling exists

Rules:
- do not log secrets, OTP values, or sensitive personal data
- redact identifiers when necessary
- keep user-facing notifications separate from developer telemetry

---

## 32. Accessibility Baseline

The MVP frontend must meet a practical accessibility baseline.

Requirements:
- semantic HTML where possible
- accessible form labels
- keyboard-accessible buttons, dialogs, and navigation
- focus management for modals/dialogs
- visible error messages
- visible loading/disabled states

This is mandatory for shared UI primitives.

---

## 33. Performance Rules

For MVP, performance should be managed through simple disciplined rules:

- avoid unnecessary global rerenders
- lazy-load heavy admin routes if framework supports it
- cache server state reasonably
- avoid over-fetching on every route transition
- paginate admin and public lists
- optimize image/media rendering at UI level where feasible

Do not prematurely over-engineer frontend optimization.

---

## 34. Testing Strategy

Frontend testing should be split into levels.

### 34.1 Unit tests
For:
- utility functions
- validation helpers
- pure rendering logic where useful

### 34.2 Component tests
For:
- forms
- dialogs
- reusable UI states
- guarded rendering logic

### 34.3 Integration tests
For:
- module flows with mocked API
- login flow
- product create/edit flow
- category create/edit flow

### 34.4 E2E tests
For critical MVP paths:
- login
- admin create category
- admin create product
- public view published product
- logout

---

## 35. Frontend Module Dependency Rules

Allowed dependency direction:

text
app -> modules -> shared -> infrastructure

More precisely:
- `app` can depend on everything
- `modules/*` can depend on `shared` and `infrastructure`
- one module should not tightly depend on another module’s internals
- `shared` must not depend on module code
- `infrastructure` must remain domain-agnostic

### Cross-module rule
If one module needs something from another:
- consume a stable exported contract only
- or duplicate minimal UI if coupling would otherwise increase

Do not create hidden module entanglement.

---

## 36. Public Exports Rule

Each module should expose a controlled public surface.

Example:

text
modules/admin-product/index.ts

Export only:
- page entrypoints
- public hooks if needed
- public types if shared intentionally

Do not expose every internal helper by default.

---

## 37. Example Internal Module Layout

Example for `admin-product`:

text
modules/admin-product/
  api/
    listProducts.ts
    getProduct.ts
    createProduct.ts
    updateProduct.ts
    changeProductStatus.ts
  components/
    ProductForm.tsx
    ProductStatusPanel.tsx
    ProductTable.tsx
  hooks/
    useProductsList.ts
    useCreateProduct.ts
    useUpdateProduct.ts
  pages/
    ProductListPage.tsx
    ProductCreatePage.tsx
    ProductEditPage.tsx
  schemas/
    productFormSchema.ts
  types/
    productAdmin.types.ts
  utils/
    mapProductFormToRequest.ts
  index.ts

---

## 38. Naming Conventions

Rules:
- module folders use lowercase kebab-case or consistent convention
- component names use `PascalCase`
- hooks use `useXxx`
- schemas use explicit names like `productFormSchema`
- API functions use verbs describing operation
- avoid vague names like `helper.ts`, `data.ts`, `common.ts`

Examples:
- `useCurrentUser`
- `createCategory`
- `ProductEditPage`
- `mapApiErrorToFormErrors`

---

## 39. Frontend Security Rules

The frontend must follow these minimum security constraints:

- do not trust client authorization alone
- do not store secrets in browser storage
- handle session expiration safely
- sanitize or safely render any rich text if introduced later
- avoid exposing internal admin-only data in public routes
- prevent accidental debug info exposure in production builds

For OTP flows:
- never log OTP values
- avoid showing sensitive retry internals
- respect backend rate-limit responses

---

## 40. Build and Deployment Expectations

The frontend must be buildable reproducibly.

Requirements:
- deterministic build command
- environment-specific build/runtime config strategy
- static asset handling defined
- cache-busting/versioned assets supported by framework
- health of deployment verifiable through app availability and API connectivity checks

---

## 41. Definition of Done for Frontend Modules

A frontend module is complete only when:

- route ownership is clear
- API integration is typed and centralized
- loading/empty/error states are implemented
- validation is defined
- authorization behavior is correct
- tests cover critical paths
- no forbidden dependency direction exists
- accessibility baseline is met for core interactions

---

## 42. MVP Implementation Priority

Recommended implementation order:

1. app bootstrap and infrastructure
2. auth module
3. catalog module
4. admin-category module
5. admin-product module
6. admin-media module
7. profile module
8. shared hardening and test coverage
9. optional health/internal route

This sequence aligns with MVP delivery needs and dependency order.

---

## 43. Final Rule

The frontend must remain modular, API-contract-driven, and operationally predictable.

Any implementation that:
- spreads API logic through pages
- relies on large uncontrolled global state
- mixes unrelated domains in shared folders
- or couples modules through hidden imports

is considered non-compliant with this specification.