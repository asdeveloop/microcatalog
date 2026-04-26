# Testing Strategy

## Purpose

این سند استراتژی تست برای پروژه را تعریف می‌کند.

---

## Goals

- prevent regressions
- protect critical business flows
- support confident releases
- verify production-readiness

---

## Test Pyramid

### Unit Tests
برای:
- domain rules
- validators
- state transitions
- pure business logic

### Integration Tests
برای:
- repository implementations
- database interactions
- transactions
- storage adapter contracts
- SMS adapter behavior with mocks/fakes

### API Tests
برای:
- auth flow
- merchant profile flow
- product CRUD
- publish/unpublish
- media upload finalize
- storefront public read

### Smoke Tests
برای:
- post-deploy validation
- basic production sanity checks

---

## Priority Flows to Test

### P0
- request OTP
- verify OTP
- create session
- create merchant
- create product
- publish product
- upload intent creation
- upload complete
- storefront fetch

### P1
- session revoke
- product archive
- media delete
- merchant profile update

---

## Migration Testing

هر migration مهم باید:
- روی staging اجرا شود
- با snapshot یا dataset representative تست شود
- rollback implication بررسی شود
- data integrity validation داشته باشد

---

## Test Data Rules

- deterministic test data
- no dependency on production data
- no shared mutable state between tests
- cleanup strategy required

---

## CI Quality Gates

حداقل gateها:
- lint pass
- typecheck pass
- unit tests pass
- integration tests pass
- build pass

---

## Release Validation

قبل از production:
- staging smoke tests pass
- critical API paths pass
- migration verified
- health endpoints OK

---

## Non-Goals

- 100% coverage obsession
- heavy E2E suite before basics are stable
