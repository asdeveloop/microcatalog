# API Contract v1

## 1. Purpose

This document defines the production-grade HTTP API contract for v1 of Micro-Catalog.

Goals:
- stable contract between frontend and backend
- predictable request/response model
- clean separation between public, authenticated user, and admin APIs
- support MVP scope without over-design
- enable implementation, testing, and future versioning

This contract is written for:
- REST-style HTTP APIs
- JSON request/response bodies
- cookie-based session authentication for user/admin web clients
- server-side validation and standardized error handling

---

## 2. Base Rules

### 2.1 Base URLs

Public web application:
```text
https://example.com

API:
text
https://api.example.com

Versioned API base path:
text
/api/v1

Example:
text
https://api.example.com/api/v1/auth/otp/request
```
---

### 2.2 Content Type

Requests with body:
http
Content-Type: application/json

Responses:
http
Content-Type: application/json; charset=utf-8

File upload endpoints use:
http
Content-Type: multipart/form-data

---

### 2.3 Time Format

All timestamps must be ISO 8601 UTC.

Example:
json
"createdAt": "2026-04-26T10:30:00Z"

---

### 2.4 Number and Money Rules

In MVP:
- prices are stored and returned as integer amounts
- no floating point for money
- currency is `IRR` unless future extension is added

Example:
json
{
  "priceAmount": 12500000,
  "priceCurrency": "IRR"
}

---

### 2.5 Language and Locale

API messages are machine-oriented.
Human-readable text should not be relied on by frontend logic.

Stable fields:
- `code`
- `message`
- structured `details` when needed

Default locale:
- `fa-IR` on frontend
- API remains language-neutral where possible

---

## 3. Authentication Model

### 3.1 User Authentication

MVP user authentication flow:
1. request OTP with mobile number
2. verify OTP
3. backend creates session
4. session stored in secure cookie
5. authenticated user accesses protected endpoints

### 3.2 Admin Authentication

For MVP:
- admin uses same authentication mechanism
- authorization is role-based
- admin routes require authenticated session + admin role

### 3.3 Session Transport

Authentication state is transported using secure HTTP-only cookie.

Required cookie properties in production:
- `HttpOnly`
- `Secure`
- `SameSite=Lax` or stricter if compatible
- domain configured explicitly

API clients must send credentials.

Frontend request example:
ts
fetch("https://api.example.com/api/v1/auth/session", {
  method: "GET",
  credentials: "include"
});

---

## 4. Standard Response Envelope

Success response:

```json
{
  "success": true,
  "data": {}
}

Error response:

json
{
  "success": false,
  "error": {
"code": "VALIDATION_ERROR",
"message": "Request validation failed",
"details": []
  }
}

Optional metadata response:

json
{
  "success": true,
  "data": [],
  "meta": {
"page": 1,
"pageSize": 20,
"total": 135,
"totalPages": 7
  }
}

Rules:
- `success` is mandatory
- exactly one of `data` or `error` must exist
- `meta` is optional and mainly used for lists
- backend must not return inconsistent envelope shapes across similar endpoints
```
---

## 5. Error Model

## 5.1 Error Object

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [
{
"field": "mobile",
"reason": "INVALID_FORMAT"
}
  ],
  "correlationId": "d9d1e6ec-0ca2-49f7-94c0-d8dba2a6f4d1"
}

Fields:
- `code`: stable application error code
- `message`: generic readable message
- `details`: optional array of machine-readable specifics
- `correlationId`: required for tracing in logs
```
---

## 5.2 Common Error Codes

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
OTP_EXPIRED
OTP_INVALID
OTP_MAX_ATTEMPTS_EXCEEDED
SESSION_EXPIRED
MEDIA_INVALID_TYPE
MEDIA_TOO_LARGE
PRODUCT_INVALID_STATE
DEPENDENCY_FAILURE
INTERNAL_ERROR
```
---

## 5.3 HTTP Status Mapping

| HTTP Status | Code                         | Meaning |
|------------|------------------------------|---------|
| 200        | -                            | success |
| 201        | -                            | resource created |
| 204        | -                            | success with no body |
| 400        | VALIDATION_ERROR             | invalid request |
| 401        | UNAUTHORIZED                 | no valid session |
| 403        | FORBIDDEN                    | authenticated but not allowed |
| 404        | NOT_FOUND                    | resource absent |
| 409        | CONFLICT                     | state conflict |
| 413        | MEDIA_TOO_LARGE              | upload too large |
| 415        | MEDIA_INVALID_TYPE           | unsupported file type |
| 422        | OTP_INVALID / PRODUCT_INVALID_STATE | semantic failure |
| 429        | RATE_LIMITED                 | throttled |
| 500        | INTERNAL_ERROR               | unhandled server error |
| 502/503    | DEPENDENCY_FAILURE           | upstream/provider issue |

---

## 6. Pagination, Sorting, Filtering

### 6.1 Pagination Query Parameters

List endpoints should support:

- `page` default: `1`
- `pageSize` default: `20`
- maximum `pageSize`: `100`

Example:
http
GET /api/v1/admin/products?page=2&pageSize=20

Response meta:
```json
{
  "meta": {
"page": 2,
"pageSize": 20,
"total": 53,
"totalPages": 3
  }
}
```
---

### 6.2 Sorting

Pattern:
http
sort=createdAt:desc

Multiple sort fields are optional for future versions.
MVP requires single-field sort support.

Allowed sort fields must be endpoint-specific.

---

### 6.3 Filtering

Simple scalar filters via query string.

Example:
http
GET /api/v1/admin/products?status=published&categoryId=cat_123

Rules:
- unsupported filters must return `400 VALIDATION_ERROR`
- backend must whitelist allowed filters

---

## 7. Resource Naming

Rules:
- plural nouns for collections
- kebab-case in URLs
- camelCase in JSON
- IDs are opaque strings at API layer

Examples:
- `/products`
- `/categories`
- `/auth/otp/request`

---

## 8. Domain Enums

## 8.1 Product Status

text
draft
published
archived

## 8.2 Media Status

text
pending
ready
failed
deleted

## 8.3 User Role

text
customer
admin

## 8.4 Availability Status

text
in_stock
out_of_stock
preorder

These values are part of the public contract once released and must not change casually.

---

## 9. Authentication Endpoints

## 9.1 Request OTP

### Endpoint
```http
POST /api/v1/auth/otp/request

### Purpose
Start login flow by sending OTP to mobile number.
```
### Request Body
```json
{
  "mobile": "09123456789"
}

### Validation
- required
- valid Iranian mobile format
- normalized before processing
```
### Success Response
```json
{
  "success": true,
  "data": {
"expiresInSec": 120,
"resendCooldownSec": 60
  }
}

### Error Responses
- `400 VALIDATION_ERROR`
- `429 RATE_LIMITED`
- `502 DEPENDENCY_FAILURE`
```
---

## 9.2 Verify OTP

### Endpoint
http
POST /api/v1/auth/otp/verify

### Purpose
Verify OTP and establish session.

### Request Body
```json
{
  "mobile": "09123456789",
  "code": "123456"
}

### Success Response
json
{
  "success": true,
  "data": {
"user": {
"id": "usr_01HXYZ...",
"mobile": "09123456789",
"role": "customer",
"createdAt": "2026-04-26T10:30:00Z"
}
  }
}

### Set-Cookie
Server sets authenticated session cookie.

### Error Responses
- `400 VALIDATION_ERROR`
- `422 OTP_INVALID`
- `422 OTP_EXPIRED`
- `429 OTP_MAX_ATTEMPTS_EXCEEDED`
```
---

## 9.3 Get Current Session

### Endpoint
http
GET /api/v1/auth/session

### Auth
Required

### Success Response
```json
{
  "success": true,
  "data": {
"authenticated": true,
"user": {
"id": "usr_01HXYZ...",
"mobile": "09123456789",
"role": "customer"
}
  }
}

### Unauthorized Response
json
{
  "success": false,
  "error": {
"code": "UNAUTHORIZED",
"message": "Authentication required",
"correlationId": "..."
  }
}
```
---

## 9.4 Logout

### Endpoint
http
POST /api/v1/auth/logout

### Auth
Required

### Success Response
```json
{
  "success": true,
  "data": {
"loggedOut": true
  }
}

Behavior:
- invalidates session server-side if stored
- expires session cookie client-side
```
---

## 10. Public Catalog Endpoints

## 10.1 List Published Products

### Endpoint
http
GET /api/v1/products

### Purpose
Return paginated list of published products only.

### Query Parameters

- `page`
- `pageSize`
- `categoryId` optional
- `q` optional free-text search
- `sort` allowed:
  - `createdAt:desc`
  - `priceAmount:asc`
  - `priceAmount:desc`

### Example Request
http
GET /api/v1/products?page=1&pageSize=20&categoryId=cat_001&sort=createdAt:desc

### Success Response
```json
{
  "success": true,
  "data": [
{
"id": "prd_001",
"slug": "iphone-13-128",
"title": "iPhone 13 128GB",
"summary": "گوشی موبایل اپل",
"status": "published",
"priceAmount": 325000000,
"priceCurrency": "IRR",
"availabilityStatus": "in_stock",
"thumbnail": {
"url": "https://example.com/uploads/products/prd_001/thumb.webp",
"alt": "iPhone 13 128GB"
},
"category": {
"id": "cat_001",
"name": "موبایل"
},
"createdAt": "2026-04-26T10:30:00Z"
}
  ],
  "meta": {
"page": 1,
"pageSize": 20,
"total": 1,
"totalPages": 1
  }
}
```
---

## 10.2 Get Product Details by Slug

### Endpoint
http
GET /api/v1/products/{slug}

### Purpose
Return full public view of one published product.

### Path Parameters
- `slug`: product slug

### Success Response
```json
{
  "success": true,
  "data": {
"id": "prd_001",
"slug": "iphone-13-128",
"title": "iPhone 13 128GB",
"summary": "گوشی موبایل اپل",
"description": "توضیحات کامل محصول",
"status": "published",
"priceAmount": 325000000,
"priceCurrency": "IRR",
"availabilityStatus": "in_stock",
"category": {
"id": "cat_001",
"name": "موبایل",
"slug": "mobile"
},
"media": [
{
"id": "med_001",
"type": "image",
"url": "https://example.com/uploads/products/prd_001/1.webp",
"alt": "نمای جلویی"
}
],
"attributes": [
{
"key": "storage",
"label": "حافظه",
"value": "128GB"
},
{
"key": "color",
"label": "رنگ",
"value": "Midnight"
}
],
"seo": {
"metaTitle": "iPhone 13 128GB",
"metaDescription": "مشخصات و قیمت آیفون 13"
},
"publishedAt": "2026-04-26T10:30:00Z",
"updatedAt": "2026-04-26T10:30:00Z"
  }
}
```
### Error Responses
- `404 NOT_FOUND` when slug does not exist or product is not published
---

## 10.3 List Categories

### Endpoint
http
GET /api/v1/categories

### Purpose
Return active categories for public catalog navigation.

### Success Response
```json
{
  "success": true,
  "data": [
{
"id": "cat_001",
"name": "موبایل",
"slug": "mobile",
"parentId": null,
"sortOrder": 10
}
  ]
}
```
---

## 11. User Profile Endpoints

MVP profile scope is intentionally minimal.

## 11.1 Get My Profile

### Endpoint
http
GET /api/v1/me

### Auth
Required

### Success Response
```json
{
  "success": true,
  "data": {
"id": "usr_01HXYZ...",
"mobile": "09123456789",
"role": "customer",
"createdAt": "2026-04-26T10:30:00Z"
  }
}

---

## 12. Admin Category Endpoints

Admin endpoints require:
- authenticated session
- `role = admin`

## 12.1 List Categories

### Endpoint
http
GET /api/v1/admin/categories

### Query Parameters
- `page`
- `pageSize`
- `sort` allowed:
  - `sortOrder:asc`
  - `createdAt:desc`

### Success Response
json
{
  "success": true,
  "data": [
{
"id": "cat_001",
"name": "موبایل",
"slug": "mobile",
"parentId": null,
"sortOrder": 10,
"isActive": true,
"createdAt": "2026-04-26T10:30:00Z",
"updatedAt": "2026-04-26T10:30:00Z"
}
  ],
  "meta": {
"page": 1,
"pageSize": 20,
"total": 1,
"totalPages": 1
  }
}

---

## 12.2 Create Category

### Endpoint
http
POST /api/v1/admin/categories

### Request Body
json
{
  "name": "لپ تاپ",
  "slug": "laptop",
  "parentId": null,
  "sortOrder": 20,
  "isActive": true
}

### Success Response
json
{
  "success": true,
  "data": {
"id": "cat_002",
"name": "لپ تاپ",
"slug": "laptop",
"parentId": null,
"sortOrder": 20,
"isActive": true,
"createdAt": "2026-04-26T10:30:00Z",
"updatedAt": "2026-04-26T10:30:00Z"
  }
}

### Errors
- `400 VALIDATION_ERROR`
- `409 CONFLICT` for duplicate slug

---

## 12.3 Update Category

### Endpoint
http
PATCH /api/v1/admin/categories/{id}

### Request Body
json
{
  "name": "لپ تاپ و نوت‌بوک",
  "sortOrder": 30,
  "isActive": true
}

### Success Response
json
{
  "success": true,
  "data": {
"id": "cat_002",
"name": "لپ تاپ و نوت‌بوک",
"slug": "laptop",
"parentId": null,
"sortOrder": 30,
"isActive": true,
"updatedAt": "2026-04-26T10:30:00Z"
  }
}

---

## 13. Admin Product Endpoints

## 13.1 List Products

### Endpoint
http
GET /api/v1/admin/products

### Query Parameters
- `page`
- `pageSize`
- `status` optional
- `categoryId` optional
- `q` optional
- `sort` allowed:
  - `createdAt:desc`
  - `updatedAt:desc`
  - `priceAmount:asc`
  - `priceAmount:desc`

### Success Response
json
{
  "success": true,
  "data": [
{
"id": "prd_001",
"slug": "iphone-13-128",
"title": "iPhone 13 128GB",
"status": "draft",
"priceAmount": 325000000,
"priceCurrency": "IRR",
"availabilityStatus": "in_stock",
"category": {
"id": "cat_001",
"name": "موبایل"
},
"mediaCount": 3,
"createdAt": "2026-04-26T10:30:00Z",
"updatedAt": "2026-04-26T10:30:00Z"
}
  ],
  "meta": {
"page": 1,
"pageSize": 20,
"total": 1,
"totalPages": 1
  }
}

---

## 13.2 Create Product

### Endpoint
http
POST /api/v1/admin/products

### Request Body
json
{
  "title": "iPhone 13 128GB",
  "slug": "iphone-13-128",
  "summary": "گوشی موبایل اپل",
  "description": "توضیحات کامل محصول",
  "categoryId": "cat_001",
  "priceAmount": 325000000,
  "priceCurrency": "IRR",
  "availabilityStatus": "in_stock",
  "attributes": [
{
"key": "storage",
"label": "حافظه",
"value": "128GB"
}
  ],
  "seo": {
"metaTitle": "iPhone 13 128GB",
"metaDescription": "مشخصات و قیمت آیفون 13"
  }
}

### Validation
- `title` required
- `slug` required and unique
- `categoryId` must exist
- `priceAmount >= 0`
- `priceCurrency = IRR` in MVP
- `attributes` optional, bounded list size
- product initial status is always `draft`

### Success Response
json
{
  "success": true,
  "data": {
"id": "prd_001",
"title": "iPhone 13 128GB",
"slug": "iphone-13-128",
"status": "draft",
"createdAt": "2026-04-26T10:30:00Z",
"updatedAt": "2026-04-26T10:30:00Z"
  }
}

### Errors
- `400 VALIDATION_ERROR`
- `409 CONFLICT`

---

## 13.3 Get Product by ID

### Endpoint
http
GET /api/v1/admin/products/{id}

### Success Response
json
{
  "success": true,
  "data": {
"id": "prd_001",
"title": "iPhone 13 128GB",
"slug": "iphone-13-128",
"summary": "گوشی موبایل اپل",
"description": "توضیحات کامل محصول",
"status": "draft",
"priceAmount": 325000000,
"priceCurrency": "IRR",
"availabilityStatus": "in_stock",
"categoryId": "cat_001",
"attributes": [
{
"key": "storage",
"label": "حافظه",
"value": "128GB"
}
],
"seo": {
"metaTitle": "iPhone 13 128GB",
"metaDescription": "مشخصات و قیمت آیفون 13"
},
"media": [
{
"id": "med_001",
"status": "ready",
"url": "https://example.com/uploads/products/prd_001/1.webp",
"sortOrder": 1
}
],
"createdAt": "2026-04-26T10:30:00Z",
"updatedAt": "2026-04-26T10:30:00Z",
"publishedAt": null
  }
}

---

## 13.4 Update Product

### Endpoint
http
PATCH /api/v1/admin/products/{id}

### Request Body
All fields optional, example:

json
{
  "title": "iPhone 13 128GB CH",
  "summary": "نسخه CH",
  "priceAmount": 319000000,
  "availabilityStatus": "in_stock",
  "attributes": [
{
"key": "storage",
"label": "حافظه",
"value": "128GB"
},
{
"key": "color",
"label": "رنگ",
"value": "Midnight"
}
  ]
}

### Success Response
json
{
  "success": true,
  "data": {
"id": "prd_001",
"updatedAt": "2026-04-26T10:45:00Z"
  }
}

### Errors
- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`
- `409 CONFLICT`

---

## 13.5 Publish Product

### Endpoint
http
POST /api/v1/admin/products/{id}/publish

### Purpose
Transition product from `draft` to `published`.

### Preconditions
Minimum publish requirements:
- title exists
- slug exists
- category exists
- valid price
- at least one ready media item
- no blocking validation failures

### Success Response
json
{
  "success": true,
  "data": {
"id": "prd_001",
"status": "published",
"publishedAt": "2026-04-26T10:50:00Z"
  }
}

### Errors
- `404 NOT_FOUND`
- `409 PRODUCT_INVALID_STATE`
- `422 VALIDATION_ERROR`

---

## 13.6 Unpublish / Archive Product

### Endpoint
http
POST /api/v1/admin/products/{id}/archive

### Purpose
Transition product to `archived`.

### Success Response
json
{
  "success": true,
  "data": {
"id": "prd_001",
"status": "archived",
"updatedAt": "2026-04-26T11:00:00Z"
  }
}
```
---

## 13.7 Delete Product

For MVP, hard delete is not exposed publicly in API contract.
Preferred behavior:
- keep product record
- archive instead of delete

If delete is later introduced, it must be protected and audited.

---

## 14. Admin Media Endpoints

## 14.1 Upload Product Media

### Endpoint
http
POST /api/v1/admin/products/{id}/media

### Content Type
http
multipart/form-data

### Form Fields
- `file` required
- `alt` optional
- `sortOrder` optional integer

### Allowed File Types
- `image/jpeg`
- `image/png`
- `image/webp`

### Size Limit
- max 10 MB per file in MVP

### Success Response
```json
{
  "success": true,
  "data": {
"id": "med_001",
"productId": "prd_001",
"status": "ready",
"type": "image",
"mimeType": "image/webp",
"sizeBytes": 245120,
"url": "https://example.com/uploads/products/prd_001/1.webp",
"alt": "نمای جلو",
"sortOrder": 1,
"createdAt": "2026-04-26T10:30:00Z"
  }
}

### Errors
- `404 NOT_FOUND`
- `413 MEDIA_TOO_LARGE`
- `415 MEDIA_INVALID_TYPE`

---

## 14.2 Reorder Product Media

### Endpoint
http
PATCH /api/v1/admin/products/{id}/media/order

### Request Body
json
{
  "items": [
{
"id": "med_001",
"sortOrder": 1
},
{
"id": "med_002",
"sortOrder": 2
}
  ]
}

### Success Response
json
{
  "success": true,
  "data": {
"updated": true
  }
}

---

## 14.3 Delete Product Media

### Endpoint
http
DELETE /api/v1/admin/products/{id}/media/{mediaId}

### Success Response
json
{
  "success": true,
  "data": {
"deleted": true
  }
}

Behavior:
- logical delete preferred in DB
- physical file removal may be immediate or asynchronous
- audit log required

---

## 15. Admin User Management Endpoints

MVP keeps this scope minimal.

## 15.1 List Admin-Visible Users

### Endpoint
http
GET /api/v1/admin/users

### Query Parameters
- `page`
- `pageSize`
- `role` optional
- `mobile` optional exact or normalized search

### Success Response
json
{
  "success": true,
  "data": [
{
"id": "usr_001",
"mobile": "09123456789",
"role": "customer",
"isActive": true,
"createdAt": "2026-04-26T10:30:00Z",
"lastLoginAt": "2026-04-26T10:40:00Z"
}
  ],
  "meta": {
"page": 1,
"pageSize": 20,
"total": 1,
"totalPages": 1
  }
}
```
---

## 16. Health and Operational Endpoints

## 16.1 Liveness Probe

### Endpoint
http
GET /api/v1/health/live

### Success Response
```json
{
  "success": true,
  "data": {
"status": "ok"
  }
}
```
---

## 16.2 Readiness Probe

### Endpoint
http
GET /api/v1/health/ready

### Success Response
json
{
  "success": true,
  "data": {
"status": "ok",
"checks": {
"database": "ok"
}
  }
}

### Failure Response
json
{
  "success": false,
  "error": {
"code": "DEPENDENCY_FAILURE",
"message": "Service not ready",
"correlationId": "..."
  }
}

---

## 17. Validation Rules by Field

## 17.1 Mobile

Rules:
- required in auth endpoints
- Iranian mobile format only
- normalize to canonical internal format before persistence

Recommended accepted inputs:
- `09123456789`
- `989123456789`
- `+989123456789`

Recommended normalized storage:
text
989123456789

Recommended returned format in API:
- keep one consistent public format
- MVP recommendation: `09123456789`

---

## 17.2 Slug

Rules:
- lowercase English letters, digits, hyphen
- unique within resource type
- no spaces
- no leading/trailing hyphen

Regex example:
text
^[a-z0-9]+(?:-[a-z0-9]+)*$

---

## 17.3 Product Title

Rules:
- required
- trimmed
- min length 2
- max length bounded, e.g. 200

---

## 17.4 Attributes

Rules:
- array of key/value items
- keys must be stable, machine-friendly
- labels are human-readable
- duplicate keys in one product should be rejected

Example valid item:
json
{
  "key": "storage",
  "label": "حافظه",
  "value": "128GB"
}

---

## 18. Idempotency and Retry Guidance

### 18.1 Safe Retries

Safe to retry:
- `GET`
- `DELETE` when implementation is idempotent
- some `PATCH` operations if contract guarantees deterministic outcome

### 18.2 OTP Request Endpoint

`POST /auth/otp/request` is not fully idempotent semantically.
Backend must enforce throttling and resend cooldown.

### 18.3 Create Endpoints

For MVP, explicit `Idempotency-Key` header is not required.
If payment/order flows are added later, it becomes necessary.

---

## 19. Rate Limiting

### 19.1 General Rules

Rate-limited endpoints must return:

json
{
  "success": false,
  "error": {
"code": "RATE_LIMITED",
"message": "Too many requests",
"correlationId": "..."
  }
}

HTTP status:
http
429 Too Many Requests

Optional headers:
http
Retry-After: 60
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0

### 19.2 Priority Limited Endpoints

Must be protected:
- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- admin write endpoints
- media upload endpoints

---

## 20. Authorization Matrix Summary

| Endpoint Group | Anonymous | Authenticated User | Admin |
|---------------|-----------|--------------------|-------|
| public products | yes | yes | yes |
| categories public | yes | yes | yes |
| me/profile | no | yes | yes |
| admin categories | no | no | yes |
| admin products | no | no | yes |
| admin media | no | no | yes |
| admin users | no | no | yes |

---

### Public endpoints
May use short-lived HTTP caching where safe.

Rules:
- cache only `GET` endpoints
- never cache authenticated personalized responses in shared public caches
- use `Cache-Control` explicitly
- avoid aggressive cache TTL during MVP unless invalidation is reliable
- prefer conservative TTL values

Recommended policy:
- public category list: short TTL allowed
- public product list: short TTL allowed
- public product detail: short TTL allowed
- admin endpoints: `Cache-Control: no-store`
- authenticated profile/session endpoints: `Cache-Control: no-store`

Example:
```http
Cache-Control: public, max-age=60, stale-while-revalidate=120

Use only when:
- response is public
- stale data for a short duration is acceptable
- publish/archive delays of up to configured TTL are acceptable

### Admin and authenticated endpoints
Must not be cached in shared intermediaries.

Use:
http
Cache-Control: no-store

### Future extension
If CDN/reverse proxy caching is introduced later:
- invalidation strategy must be documented
- publish/archive actions must trigger purge or tolerate TTL delay
- cache key design must include locale/query dimensions if introduced

---

## 22. Idempotency Guidance

MVP rule:
- `GET`, `HEAD`, `OPTIONS` are naturally idempotent
- `PATCH` should be designed to be safely repeatable where possible
- `POST` endpoints are not assumed idempotent unless explicitly designed so

Current policy:
- no mandatory idempotency-key support in MVP
- clients must avoid blind retries for mutating endpoints
- server must ensure duplicate requests do not corrupt state unnecessarily

Examples:
- repeated `POST /auth/otp/request` must still respect cooldown and throttle rules
- repeated `POST /admin/products/{id}/publish` should return controlled response if already published
- repeated media reorder with same payload should produce same final state

Future:
- if payment-like or externally retried flows are introduced, add `Idempotency-Key`

---

## 23. Concurrency and Consistency Rules

Rules:
- write operations must validate current state before mutation
- publish/archive transitions must enforce state machine rules
- duplicate slug creation must be prevented by both application checks and DB unique constraints
- media ordering updates must produce deterministic final order
- concurrent admin updates should fail safely, not silently corrupt data

Recommended MVP approach:
- rely on DB constraints for uniqueness
- optionally use `updatedAt` optimistic checks later
- keep write transactions short
- avoid read-modify-write without safeguards

Conflict response:
- use `409 Conflict` for state/version/conflicting uniqueness cases
- return machine-readable error code

Example:
json
{
  "error": {
    "code": "PRODUCT_SLUG_CONFLICT",
    "message": "Slug already exists",
    "details": {
      "field": "slug"
    },
    "correlationId": "3d2e1c8a-4b57-4d6a-9b5d-11c4a8d7ef91"
  }
}
```
---

## 24. File Upload Contract Rules

Applicable endpoint:
- `POST /api/v1/admin/products/{id}/media`

Content type:
- `multipart/form-data`

Rules:
- file field name must be stable and documented
- server validates MIME type and size
- server must not trust client-provided file name
- server response must include persisted media metadata
- failed upload must not leave inconsistent metadata state

Recommended multipart fields:
- `file` required
- `alt` optional

Successful response example:
json
{
  "data": {
    "id": "med_001",
    "productId": "prd_001",
    "type": "image",
    "mimeType": "image/jpeg",
    "sizeBytes": 248120,
    "url": "https://cdn.example.com/products/prd_001/med_001.jpg",
    "alt": "نمای جلویی محصول",
    "sortOrder": 1,
    "status": "ready",
    "createdAt": "2026-04-26T10:45:00Z"
  },
  "meta": {
    "correlationId": "d8858c72-4df8-461f-9d6e-fd1ad0f5f6bf"
  }
}

Failure cases:
- unsupported media type -> `415 Unsupported Media Type` or `422 Unprocessable Entity`
- file too large -> `413 Payload Too Large`
- product not found -> `404 Not Found`

---

## 25. Security Contract Rules

API contract must enforce the following baseline security rules:

### Authentication
- admin endpoints require authenticated admin session
- session endpoint requires authenticated session
- public catalog endpoints remain anonymous

### Authorization
- role checks must be server-side
- hidden UI state is not authorization
- clients must not be trusted for admin-only behavior

### Input handling
- all input must be validated
- unknown dangerous payloads must be rejected or ignored consistently
- no raw database/provider errors in response

### Sensitive data
Responses must never expose:
- OTP codes
- provider secrets
- internal DB errors
- internal stack traces
- storage internal credentials

### Cookie/session rules
If cookie-based session is used:
- `HttpOnly`
- `Secure` in staging/production
- `SameSite` set explicitly
- bounded expiration

---

## 26. Correlation and Tracing Contract

Each request should carry or receive a correlation identifier.

Rules:
- accept incoming `X-Correlation-Id` if valid
- otherwise generate server-side
- include correlation ID in response metadata
- propagate correlation ID into logs and audit context

Response pattern:
json
{
  "data": {},
  "meta": {
    "correlationId": "4f017ef6-99fd-4d54-a4c9-1f1c3879b2dc"
  }
}

Error pattern:
json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "correlationId": "4f017ef6-99fd-4d54-a4c9-1f1c3879b2dc"
  }
}

---

## 27. API Evolution Rules

Rules:
- additive changes are preferred
- avoid removing fields in same API version
- avoid changing field meaning silently
- introducing new optional fields is safe
- introducing new required request fields requires versioned change or backward-compatible defaulting
- enum expansion must be done carefully and documented

Examples of safe change:
- add `mediaCount` to admin product list response
- add optional `seo` object to product detail

Examples of breaking change:
- rename `title` to `name`
- change `price.amount` from integer to string
- require new request field with no default

---

## 28. Backward Compatibility Policy

For MVP:
- maintain compatibility within `v1`
- if a breaking change becomes unavoidable, introduce a new version path
- deprecation must be documented before removal

Minimal deprecation process:
1. document deprecated field/endpoint
2. stop recommending it in docs
3. add replacement
4. remove only in next major API version

---

## 29. OpenAPI / Swagger Requirements

The backend implementation must generate or maintain accurate API documentation.

Minimum requirements:
- every endpoint documented
- every request DTO documented
- every response shape documented
- auth requirements documented
- example payloads for key endpoints included
- error responses documented for important failure modes

Recommended tags:
- `Auth`
- `User`
- `Admin Users`
- `Categories`
- `Products`
- `Media`
- `Health`

Documentation quality rule:
OpenAPI must reflect actual runtime behavior, not aspirational behavior.

---

## 30. Contract Testing Requirements

Critical endpoints must have API contract tests.

Minimum coverage:
- auth OTP request and verify
- session retrieval
- public category list
- public product list/detail
- admin product create/update/publish/archive
- media upload/delete/reorder
- admin category create/update

Tests must assert:
- HTTP status code
- response envelope shape
- required fields
- error envelope shape for common failures
- auth/authorization behavior
- pagination metadata where applicable

---

## 31. Contract Checklist

Before an endpoint is considered complete, verify:

- path and method follow REST conventions
- auth requirement is explicit
- request validation is explicit
- response envelope is standard
- error model is standard
- pagination/filter/sort behavior is documented if applicable
- field naming is consistent
- timestamps are ISO 8601 UTC
- examples exist
- OpenAPI docs updated
- tests cover success and key failure cases

---

## 32. Final Contract Baseline

Non-negotiable contract principles:
- consistent envelope
- stable naming
- explicit auth rules
- machine-readable errors
- predictable pagination
- conservative versioning
- no leakage of internal implementation detail
- no undocumented response drift

This API contract is the baseline source for backend implementation, frontend integration, QA verification, and future OpenAPI generation.


---