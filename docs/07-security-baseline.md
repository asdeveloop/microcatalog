# Security Baseline

## Purpose

این سند baseline امنیتی لازم برای فاز production را تعریف می‌کند.

---

## Security Goals

- secure authentication
- protect merchant data
- prevent abuse
- limit blast radius of compromise
- keep operations manageable

---

## Core Security Principles

- secure by default
- least privilege
- deny by default
- minimize sensitive data exposure
- audit sensitive actions
- keep dependency surface small

---

## Authentication Security

### OTP Rules
- OTP must be random
- OTP must be short-lived
- OTP must be one-time use
- OTP must be stored hashed
- OTP must never be logged
- resend cooldown required
- max attempts required
- rate limiting by phone and IP required

### Session Rules
- session token must be random
- token must be stored hashed if persisted
- cookies must be `HttpOnly`
- cookies must be `Secure` in production
- session revoke must be supported
- rotation on login required
- absolute and inactivity timeout required

---

## Transport Security

- HTTPS mandatory in production
- TLS terminated at reverse proxy
- insecure HTTP redirected to HTTPS
- HSTS recommended after validation

---

## Input Security

- validate all inputs
- enforce payload size limits
- sanitize only where appropriate
- reject malformed content types
- file type allowlist for media uploads

---

## Authorization Rules

- every write endpoint must verify merchant ownership
- public endpoints must only expose published data
- internal admin access must be explicit and auditable

---

## Secret Management

- secrets must not be committed to git
- secrets must come from env or secret store
- rotation procedure must exist
- separate secrets per environment
- least access to production secrets

---

## Logging Security

- never log OTP
- never log raw session token
- mask phone when possible
- avoid logging full PII payloads
- errors must not expose stack traces to client

---

## File Upload Security

- allowlist MIME types
- max file size enforced
- deterministic object keys
- no public write access to object storage
- signed URL must be short-lived
- server must validate upload completion metadata

---

## Abuse Prevention

- rate limiting for auth endpoints
- IP throttling
- suspicious activity logging
- temporary blocking policy for repeated abuse
- monitor failed OTP attempts

---

## Dependency Security

- dependency review before adoption
- pin versions where appropriate
- periodic updates
- remove unused packages
- avoid heavy or low-trust packages

---

## Database Security

- least privilege DB user
- separate credentials per environment
- DB not publicly exposed unless explicitly required
- backup encryption strongly recommended

---

## Incident Readiness

حداقل runbookهای امنیتی:
- OTP abuse incident
- leaked secret rotation
- compromised session response
- suspicious file upload handling

---

## Security Review Gate

قبل از production:
- auth review complete
- cookie policy validated
- CORS policy validated
- secret management validated
- rate limiting validated
- file upload rules validated
- logging reviewed for sensitive data leakage
