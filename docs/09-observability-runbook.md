# Observability Runbook

## Purpose

این سند baseline مربوط به logging, metrics, health checks و incident visibility را تعریف می‌کند.

---

## Observability Goals

- detect failures early
- diagnose issues quickly
- support incident response
- understand system health over time

---

## Logging Standard

همه logها باید structured JSON باشند.

### Required Fields
- `timestamp`
- `level`
- `service`
- `environment`
- `correlationId`
- `module`
- `event`
- `route`
- `actorId` when available
- `errorCode` when applicable

---

## Log Levels

- `debug` for local/dev only where appropriate
- `info` for normal lifecycle events
- `warn` for degraded behavior or recoverable issues
- `error` for failed operations

---

## Sensitive Logging Rules

- no OTP in logs
- no raw token in logs
- mask phone where possible
- no full sensitive payload dump

---

## Metrics Baseline

### API Metrics
- request count
- request latency
- response status distribution
- error rate

### Auth Metrics
- OTP requested
- OTP send success/failure
- OTP verify success/failure
- rate limit trigger count

### Database Metrics
- connection health
- query latency
- slow query count

### Storage Metrics
- upload intent creation count
- upload complete success/failure
- storage adapter error count

### Business Metrics
- merchant created
- product created
- product published
- storefront viewed

---

## Health Checks

### Liveness
- process running
- app booted successfully

### Readiness
- DB reachable
- config valid
- storage optionally checkable
- service capable of serving traffic

---

## Audit Logging

Audit events required for:
- login success/failure
- session revoke
- merchant profile update
- product publish/unpublish
- product delete
- media attach/delete
- sensitive admin action

---

## Alerts

حداقل alertهای لازم:

- high 5xx rate
- readiness failures
- database unavailable
- storage unavailable
- OTP failure spike
- repeated auth abuse pattern

---

## Incident Triage Checklist

1. identify affected surface
2. check recent deploy
3. inspect error logs by correlationId
4. inspect DB connectivity
5. inspect storage/SMS dependency
6. determine rollback vs fix-forward
7. document incident timeline

---

## Retention Guidelines

- application logs: based on storage budget
- audit logs: longer retention than application logs
- metrics: enough to observe trends and regressions
