# API Standards

## Purpose

این سند استانداردهای طراحی API را مشخص می‌کند.

---

## General Principles

- REST-style HTTP APIs
- JSON request/response
- predictable naming
- stable error model
- backend-enforced validation
- versioning only when needed

---

## URL Design

### Rules
- nouns over verbs
- plural resource names where applicable
- lowercase
- hyphen-separated if needed

### Examples
- `POST /auth/otp/request`
- `POST /auth/otp/verify`
- `GET /me`
- `PATCH /me`
- `GET /products`
- `POST /products`
- `PATCH /products/:id`
- `POST /products/:id/publish`
- `POST /products/:id/archive`
- `POST /media/upload-intents`
- `POST /media/upload-intents/:id/complete`
- `GET /storefront/:slug`

---

## Request Validation

- all input must be validated
- unknown fields should be rejected or stripped explicitly
- field-level constraints must be deterministic
- invalid payload returns `400`

---

## Response Design

### Success Response
```json
{
  "data": {}
}

### Error Response
json
{
  "error": {
"code": "VALIDATION_ERROR",
"type": "validation_error",
"message": "Request validation failed",
"correlationId": "req_123",
"details": {
"fields": {
"phone": ["Invalid Iranian mobile number"]
}
}
  }
}

```
---

## Error Categories

- `validation_error`
- `authentication_error`
- `authorization_error`
- `not_found`
- `conflict`
- `rate_limited`
- `dependency_failure`
- `internal_error`

---

## HTTP Status Mapping

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `429 Too Many Requests`
- `500 Internal Server Error`
- `502/503` for dependency issues when applicable

---

## Idempotency Rules

برای endpointهای حساس یا retriable، در صورت نیاز:
- support idempotency key
- retries only where safe
- OTP verify endpoint should not be naive-retryable without policy

---

## Authentication Rules

- authenticated endpoints require valid session
- session should be cookie-based for web
- auth errors should not leak internal details

---

## Pagination Rules

برای listingها:

```json
{
  "data": [],
  "meta": {
"page": 1,
"pageSize": 20,
"total": 100
  }
}
```
---

## Sorting and Filtering

- sorting field list must be explicit
- filtering fields must be explicit
- no free-form arbitrary DB-backed filters in MVP

---

## API Versioning

در فاز اول:
- avoid premature versioning
- if breaking change becomes necessary, use `/v2` explicitly

---

## Correlation ID

- every request must have correlation ID
- if client does not send one, server generates it
- response must include it

---

## API Security Rules

- request size limits
- rate limiting on sensitive endpoints
- validation before business logic
- ownership checks on every write operation

---

## Documentation Rules

برای هر endpoint باید این موارد مشخص باشد:
- purpose
- auth requirement
- request shape
- response shape
- possible errors
- side effects
- idempotency expectation


---
