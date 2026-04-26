# docs/13-env-spec.md

# Environment Specification

## 1. Purpose

This document defines the environment model, configuration rules, secret handling policy, and runtime variable contract for the Micro-Catalog platform.

Goal:
- make deployment reproducible across `local`, `staging`, and `production`
- prevent configuration drift
- separate secrets from code
- support low-cost VPS deployment in Iran
- minimize operational ambiguity for backend, frontend, and DevOps

This document is normative for all runtime configuration.

---

## 2. Environment Model

The system supports three environments:

- `local`
- `staging`
- `production`

### 2.1 Local

Purpose:
- developer machine
- feature development
- local integration testing

Characteristics:
- runs with Docker Compose or local processes
- debug logging enabled
- test credentials allowed
- non-production SMS/storage adapters may be mocked
- lower security strictness than production, but same config shape

### 2.2 Staging

Purpose:
- pre-production verification
- QA/UAT
- deployment rehearsal
- release validation

Characteristics:
- mirrors production topology as closely as possible
- separate database and storage namespace
- real application configuration
- no test shortcuts in auth/session logic
- safe test-only SMS recipients or sandbox provider mode if available

### 2.3 Production

Purpose:
- live customer traffic

Characteristics:
- strict security controls
- production secrets only
- real SMS provider
- persistent storage
- backups enabled
- monitoring enabled
- debug disabled
- rate limiting enabled
- least-privilege access

---

## 3. Environment Naming Rules

### 3.1 Canonical Names

Allowed values for `APP_ENV`:
- `local`
- `staging`
- `production`

No alternative spellings are allowed:
- invalid: `prod`, `dev`, `test`, `uat`

### 3.2 Service Naming Convention

Recommended service names:
- `catalog-api`
- `catalog-web`
- `catalog-db`
- `catalog-nginx`
- `catalog-backup`
- `catalog-worker` (only if introduced later)

### 3.3 Hostname Convention

Recommended:
- Production API: `api.<domain>`
- Production Web: `<domain>` or `www.<domain>`
- Staging API: `api.staging.<domain>`
- Staging Web: `staging.<domain>`

Example:
- `microcatalog.ir`
- `api.microcatalog.ir`
- `staging.microcatalog.ir`
- `api.staging.microcatalog.ir`

---

## 4. Configuration Principles

### 4.1 Required Rules

1. all runtime config must come from environment variables
2. application must fail fast on missing required variables
3. secrets must never be committed to git
4. each variable must have one clear owner and purpose
5. production values must be injected only on server/VPS
6. local `.env` files must be gitignored
7. environment variable names must be uppercase with underscore separator
8. booleans must use explicit values: `true` or `false`
9. durations must include unit semantics in variable description
10. ports must be numeric and validated at startup

### 4.2 Forbidden Practices

Forbidden:
- hardcoding secrets in source code
- sharing production `.env` in chat tools
- reusing staging secrets in production
- using a single database for multiple environments
- using the same storage bucket/path across environments
- relying on implicit defaults for security-sensitive values

---

## 5. Configuration Ownership

| Area | Owner | Notes |
|---|---|---|
| Application variables | Backend Engineer | validated at startup |
| Web public variables | Frontend Engineer | must not expose secrets |
| DB credentials | DevOps | rotateable |
| SMS provider secrets | DevOps + Backend | stored as secret |
| TLS/domain config | DevOps | server-level |
| Backup config | DevOps | production-only mandatory |
| Monitoring config | DevOps | production/staging |

---

## 6. Secret Classification

### 6.1 Public Config

Definition:
- safe to expose to browser/client
- no security impact if disclosed

Examples:
- public app name
- public base URL
- image max size limits
- public feature flags without security effect

Prefix recommendation:
- `NEXT_PUBLIC_` for web-exposed variables if using Next.js

### 6.2 Internal Non-Secret Config

Definition:
- server-side operational values
- not sensitive by themselves, but not intended for public exposure

Examples:
- log level
- pagination defaults
- job intervals
- internal ports

### 6.3 Secret Config

Definition:
- any value that grants access, signs tokens, decrypts data, or reaches provider APIs

Examples:
- database password
- session secret
- encryption key
- SMS provider API key
- S3/MinIO secret key
- backup encryption password

Rule:
- secrets must be stored only in secure server-side env files or secret stores
- secrets must never be logged
- secrets must never be rendered in admin UI
- secrets must never be sent to client code

---

## 7. Variable Naming Standard

Format:
- `DOMAIN_PURPOSE[_QUALIFIER]`

Examples:
- `APP_ENV`
- `APP_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `SMS_PROVIDER`
- `STORAGE_SECRET_KEY`
- `SESSION_SECRET`
- `RATE_LIMIT_WINDOW_SEC`

Naming rules:
- uppercase only
- words separated by `_`
- no abbreviations unless standard and obvious (`DB`, `URL`, `OTP`, `SMS`)
- variables must remain stable after release
- rename only with migration plan

---

## 8. Required Environment Variables

## 8.1 Core Application

| Variable | Required | Environments | Example | Description |
|---|---|---|---|---|
| `APP_ENV` | yes | all | `production` | current environment |
| `APP_NAME` | yes | all | `micro-catalog` | service/application name |
| `APP_PORT` | yes | all | `3000` | internal app port |
| `APP_BASE_URL` | yes | all | `https://api.example.com` | canonical backend base URL |
| `WEB_BASE_URL` | yes | all | `https://example.com` | canonical frontend base URL |
| `LOG_LEVEL` | yes | all | `info` | `debug`, `info`, `warn`, `error` |
| `NODE_ENV` | yes | all | `production` | runtime mode |
| `TRUST_PROXY` | yes | staging/production | `true` | required behind nginx/reverse proxy |

Validation:
- `APP_ENV` must be one of `local|staging|production`
- `APP_BASE_URL` and `WEB_BASE_URL` must be valid absolute URLs
- `APP_PORT` must be integer between `1` and `65535`

---

## 8.2 Database

| Variable | Required | Environments | Example |
|---|---|---|---|
| `DB_HOST` | yes | all | `db` |
| `DB_PORT` | yes | all | `5432` |
| `DB_NAME` | yes | all | `micro_catalog` |
| `DB_USER` | yes | all | `catalog_user` |
| `DB_PASSWORD` | yes | all | `strong-password` |
| `DB_SSL_MODE` | yes | all | `disable` |
| `DATABASE_URL` | preferred | all | `postgresql://...` |

Rules:
- app may support both discrete DB vars and `DATABASE_URL`
- if both exist, startup must define precedence clearly
- recommended precedence: `DATABASE_URL` first, otherwise compose from discrete vars

Production rule:
- strong random password mandatory
- separate DB per environment mandatory

`DB_SSL_MODE` values:
- `disable`
- `require`

For single-host Docker Compose on same VPS, `disable` inside private docker network is acceptable.
For managed/external DB, `require` is recommended.

---

## 8.3 Authentication / Session

| Variable | Required | Environments | Example |
|---|---|---|---|
| `SESSION_SECRET` | yes | all | `long-random-secret` |
| `SESSION_TTL_DAYS` | yes | all | `30` |
| `OTP_TTL_SEC` | yes | all | `120` |
| `OTP_RESEND_COOLDOWN_SEC` | yes | all | `60` |
| `OTP_MAX_ATTEMPTS` | yes | all | `5` |
| `LOGIN_MAX_ATTEMPTS_PER_WINDOW` | yes | all | `10` |
| `LOGIN_WINDOW_SEC` | yes | all | `900` |
| `COOKIE_SECURE` | yes | all | `true` |
| `COOKIE_SAME_SITE` | yes | all | `lax` |
| `COOKIE_DOMAIN` | optional | staging/production | `.example.com` |

Rules:
- `SESSION_SECRET` minimum 32 bytes entropy
- production `COOKIE_SECURE=true`
- `COOKIE_SAME_SITE=lax` recommended unless cross-site use case exists
- OTP values must be conservative enough to reduce abuse

---

## 8.4 SMS Provider

| Variable | Required | Environments | Example |
|---|---|---|---|
| `SMS_PROVIDER` | yes | all | `kavenegar` |
| `SMS_API_KEY` | yes | staging/production | `***` |
| `SMS_TEMPLATE_LOGIN` | yes | staging/production | `login-otp` |
| `SMS_SENDER` | optional | depends on provider | `1000xxxx` |
| `SMS_ENABLED` | yes | all | `true` |

Rules:
- in `local`, `SMS_ENABLED=false` or mock adapter may be used
- provider-specific variables should be isolated in adapter config
- no OTP value may be logged in production

---

## 8.5 Storage / Media

| Variable | Required | Environments | Example |
|---|---|---|---|
| `STORAGE_DRIVER` | yes | all | `local` |
| `STORAGE_BUCKET` | required if object storage | all | `micro-catalog` |
| `STORAGE_ENDPOINT` | optional | all | `http://minio:9000` |
| `STORAGE_REGION` | optional | all | `us-east-1` |
| `STORAGE_ACCESS_KEY` | optional | all | `minioadmin` |
| `STORAGE_SECRET_KEY` | optional | all | `minioadmin` |
| `MEDIA_MAX_UPLOAD_MB` | yes | all | `10` |
| `MEDIA_ALLOWED_MIME_TYPES` | yes | all | `image/jpeg,image/png,image/webp` |
| `MEDIA_PUBLIC_BASE_URL` | yes | all | `https://cdn.example.com` |

Rules:
- MVP may use `local` driver on VPS
- if MinIO is introduced, credentials become secret
- max upload size must be enforced both at nginx and application layer

---

## 8.6 Rate Limiting / Abuse Protection

| Variable | Required | Environments | Example |
|---|---|---|---|
| `RATE_LIMIT_ENABLED` | yes | all | `true` |
| `RATE_LIMIT_WINDOW_SEC` | yes | all | `60` |
| `RATE_LIMIT_MAX_REQUESTS` | yes | all | `120` |
| `OTP_RATE_LIMIT_WINDOW_SEC` | yes | all | `3600` |
| `OTP_RATE_LIMIT_MAX_REQUESTS` | yes | all | `5` |

Rules:
- production must have rate limiting enabled
- OTP endpoints must have stricter limits than read endpoints

---

## 8.7 CORS / Origin Control

| Variable | Required | Environments | Example |
|---|---|---|---|
| `CORS_ALLOWED_ORIGINS` | yes | all | `https://example.com,https://www.example.com` |
| `CORS_ALLOW_CREDENTIALS` | yes | all | `true` |

Rules:
- production must never use wildcard `*` with credentials
- origins must be explicit and environment-specific

---

## 8.8 Observability

| Variable | Required | Environments | Example |
|---|---|---|---|
| `REQUEST_LOGGING_ENABLED` | yes | all | `true` |
| `METRICS_ENABLED` | yes | staging/production | `true` |
| `HEALTHCHECK_ENABLED` | yes | all | `true` |
| `SLOW_REQUEST_THRESHOLD_MS` | yes | all | `1000` |

Rules:
- logs must be structured
- secrets and OTP codes must be redacted
- healthcheck endpoint must not expose sensitive internals publicly

---

## 8.9 Backup / Recovery

| Variable | Required | Environments | Example |
|---|---|---|---|
| `BACKUP_ENABLED` | yes | staging/production | `true` |
| `BACKUP_SCHEDULE_CRON` | yes | production | `0 3 * * *` |
| `BACKUP_RETENTION_DAYS` | yes | production | `7` |
| `BACKUP_DIR` | yes | production | `/backups` |
| `BACKUP_ENCRYPTION_ENABLED` | yes | production | `true` |
| `BACKUP_ENCRYPTION_PASSWORD` | required if encryption enabled | production | `***` |

Rules:
- production backups are mandatory
- restore procedure must be tested before go-live
- DB dump and uploaded media backup strategy must be defined together

---

## 8.10 Feature Flags

| Variable | Required | Environments | Example |
|---|---|---|---|
| `FEATURE_ADMIN_PANEL` | yes | all | `true` |
| `FEATURE_PUBLIC_CATALOG` | yes | all | `true` |
| `FEATURE_ANALYTICS` | yes | all | `false` |

Rules:
- feature flags must not replace authorization checks
- security-sensitive features must not rely only on client-side flags

---

## 9. Frontend Public Variables

If web frontend uses a framework such as Next.js, only browser-safe variables may be prefixed with `NEXT_PUBLIC_`.

Examples:
- `NEXT_PUBLIC_WEB_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_DEFAULT_LOCALE=fa-IR`

Forbidden:
- `NEXT_PUBLIC_SESSION_SECRET`
- `NEXT_PUBLIC_SMS_API_KEY`
- `NEXT_PUBLIC_DB_PASSWORD`

Rule:
- anything exposed to client bundle must be treated as public

---

## 10. Validation Rules at Startup

Application must validate env vars on startup and exit with non-zero code if invalid.

Minimum validation:
- required vars present
- URLs valid
- integers parseable and within range
- booleans exactly `true|false`
- enum-like values restricted
- `production` must reject weak secrets
- CORS origins must be parseable
- upload size limits must be positive

Recommended implementation:
- schema validation using a runtime validator
- startup failure with clear error message
- no silent fallback for security-sensitive values

---

## 11. Secret Management Policy

## 11.1 Storage

Allowed:
- server-side `.env.production`
- restricted CI/CD secret store
- encrypted secret manager if available

Forbidden:
- git repository
- issue tracker
- chat messages
- screenshots
- shared unsecured notes

## 11.2 Access

Production secret access allowed only to:
- designated DevOps owner
- designated technical lead
- backend lead if operationally necessary

All access must follow least-privilege principle.

## 11.3 Rotation

Mandatory rotation events:
- suspected leak
- staff access change
- server compromise
- provider credential exposure
- scheduled periodic rotation for critical secrets

Recommended periodic rotation:
- `SMS_API_KEY`: every 90-180 days if provider supports
- `DB_PASSWORD`: every 90-180 days
- `SESSION_SECRET`: only with planned session invalidation strategy
- backup encryption password: yearly or after incident

Note:
rotating `SESSION_SECRET` invalidates active sessions unless multi-key strategy exists.

---

## 12. Environment Files Layout

Recommended:
```bash
project/
  .env.example
  .env.local
  .env.staging.example
  .env.production.example
  apps/
  packages/
  docs/

Rules:
- `.env.example` contains shape only, no real secrets
- `.env.local` is gitignored
- real production env file exists only on VPS
- production example file may document required keys without values

Recommended `.gitignore` entries:

gitignore
.env
.env.*
!.env.example
!.env.staging.example
!.env.production.example

If multiple safe example files are used, ensure actual secret files remain ignored.
```
---

## 13. Example .env.example

```env
APP_ENV=local
NODE_ENV=development
APP_NAME=micro-catalog
APP_PORT=3000
APP_BASE_URL=http://localhost:3000
WEB_BASE_URL=http://localhost:3001
LOG_LEVEL=debug
TRUST_PROXY=false

DB_HOST=localhost
DB_PORT=5432
DB_NAME=micro_catalog
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL_MODE=disable
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/micro_catalog

SESSION_SECRET=change-me-to-a-long-random-secret
SESSION_TTL_DAYS=30
OTP_TTL_SEC=120
OTP_RESEND_COOLDOWN_SEC=60
OTP_MAX_ATTEMPTS=5
LOGIN_MAX_ATTEMPTS_PER_WINDOW=10
LOGIN_WINDOW_SEC=900
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=

SMS_PROVIDER=mock
SMS_API_KEY=
SMS_TEMPLATE_LOGIN=login-otp
SMS_SENDER=
SMS_ENABLED=false

STORAGE_DRIVER=local
STORAGE_BUCKET=
STORAGE_ENDPOINT=
STORAGE_REGION=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
MEDIA_MAX_UPLOAD_MB=10
MEDIA_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
MEDIA_PUBLIC_BASE_URL=http://localhost:3000/uploads

RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_SEC=60
RATE_LIMIT_MAX_REQUESTS=120
OTP_RATE_LIMIT_WINDOW_SEC=3600
OTP_RATE_LIMIT_MAX_REQUESTS=5

CORS_ALLOWED_ORIGINS=http://localhost:3001
CORS_ALLOW_CREDENTIALS=true

REQUEST_LOGGING_ENABLED=true
METRICS_ENABLED=false
HEALTHCHECK_ENABLED=true
SLOW_REQUEST_THRESHOLD_MS=1000

BACKUP_ENABLED=false
BACKUP_SCHEDULE_CRON=0 3 * * *
BACKUP_RETENTION_DAYS=7
BACKUP_DIR=/backups
BACKUP_ENCRYPTION_ENABLED=false
BACKUP_ENCRYPTION_PASSWORD=

FEATURE_ADMIN_PANEL=true
FEATURE_PUBLIC_CATALOG=true
FEATURE_ANALYTICS=false

NEXT_PUBLIC_WEB_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_LOCALE=fa-IR
```
---

## 14. Production-Specific Requirements

Production minimum requirements:
- `APP_ENV=production`
- `NODE_ENV=production`
- `LOG_LEVEL=info` or `warn`
- `COOKIE_SECURE=true`
- strong `SESSION_SECRET`
- `SMS_ENABLED=true`
- explicit `CORS_ALLOWED_ORIGINS`
- `RATE_LIMIT_ENABLED=true`
- `BACKUP_ENABLED=true`
- `HEALTHCHECK_ENABLED=true`
- `TRUST_PROXY=true`
- no mock adapters
- no default passwords
- no localhost URLs

Production startup must fail if:
- `SESSION_SECRET` is weak
- `DB_PASSWORD` equals default/common values
- CORS uses wildcard with credentials
- `SMS_ENABLED=true` but SMS credentials missing
- backups enabled but backup dir undefined
- `APP_BASE_URL` is not HTTPS
- `WEB_BASE_URL` is not HTTPS

---

## 15. Staging-Specific Requirements

Staging must:
- mirror production env shape
- use separate DB and storage
- use non-production domain/subdomain
- avoid sending real OTP to arbitrary users unless explicitly approved
- keep security flags close to production

Staging should not:
- reuse production SMS/API keys unless unavoidable
- reuse production DB
- disable auth hardening

---

## 16. Local Development Requirements

Local should:
- keep same variable names as production
- allow mock SMS adapter
- allow non-HTTPS URLs
- support Docker Compose bootstrap
- include seed/test data workflow

Local should not:
- diverge structurally from production config contract
- require hidden undocumented env vars

---

## 17. Runtime Configuration Loading Order

Recommended precedence:

1. process environment injected by orchestrator/server
2. `.env.production` or environment-specific file
3. `.env.local`
4. `.env`

Production recommendation:
- rely primarily on server-provided environment or protected production env file
- avoid multiple overlapping sources in production

Rule:
- precedence must be documented in codebase README and startup logs must identify the active environment, not the secret values

---

## 18. Change Management

Any new environment variable must include:
- name
- purpose
- whether secret or non-secret
- default behavior
- validation rules
- environments required
- rollback impact

New variable introduction checklist:
- added to env schema validator
- added to `.env.example`
- added to this document
- added to deployment runbook if production-relevant

---

## 19. Operational Checklist

Before first production deployment verify:

- [ ] all required production variables are defined
- [ ] production secrets are unique
- [ ] `.env.production` is not inside repository
- [ ] app startup validation passes
- [ ] DB connectivity verified
- [ ] SMS provider verified
- [ ] uploads path/storage verified
- [ ] CORS origins verified
- [ ] TLS/domain verified
- [ ] backup config verified
- [ ] healthcheck responds correctly
- [ ] no secret values appear in logs

---

## 20. Go/No-Go Rules

No production go-live if any of the following is true:
- missing required secret
- default password in DB or provider credential
- no backup configuration
- no startup env validation
- production URLs not final
- insecure cookie/session settings
- mock SMS/storage still enabled
- secrets committed anywhere in repository history without remediation

---

## 21. Implementation Notes

Recommended implementation approach:
- centralized env schema module
- one config object per domain:
  - `appConfig`
  - `dbConfig`
  - `authConfig`
  - `smsConfig`
  - `storageConfig`
  - `rateLimitConfig`
  - `observabilityConfig`
- no direct `process.env` access outside config bootstrap layer
- freeze config objects after validation

Example folder suggestion:

bash
src/
  config/
env.ts
app.config.ts
db.config.ts
auth.config.ts
sms.config.ts
storage.config.ts

---

## 22. Final Decision Summary

This project will use:
- explicit environment-based configuration
- strict startup validation
- server-side secret isolation
- separate local/staging/production values
- minimal external dependency assumptions
- production-safe defaults with fail-fast behavior

This document is the single source of truth for runtime configuration until replaced by a versioned operational standard.

