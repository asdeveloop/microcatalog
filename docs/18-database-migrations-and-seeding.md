# Database Migrations and Seeding Specification

## 1. Purpose

This document defines the production-grade policy and implementation baseline for:

- database migration design
- migration execution workflow
- rollback expectations
- schema evolution rules
- seed data strategy
- environment-specific seeding behavior
- operational safety controls

This document applies to the PostgreSQL database used by Micro-Catalog.

It is intended to ensure that schema changes remain:

- deterministic
- reviewable
- reversible where practical
- safe for production deployment
- compatible with automated delivery pipelines

---

## 2. Goals

Primary goals:

- make schema evolution reliable across `local`, `staging`, and `production`
- ensure every schema change is represented as code
- prevent manual drift between environments
- define safe seed behavior for bootstrap and testability
- support repeatable environment creation from zero state
- reduce deployment risk during database changes

---

## 3. Non-Goals

This document does not define:

- business-domain schema details already covered in database design docs
- ORM selection rationale
- analytical/warehouse migration patterns
- multi-region replication workflows
- zero-downtime blue/green database cutover

---

## 4. Core Principles

All migration and seeding logic must follow these principles:

1. schema is changed only through reviewed migrations
2. production schema must never depend on manual SQL edits
3. every migration must be deterministic
4. migrations must be idempotent only where tooling requires it; they must primarily be single-application safe
5. destructive operations require explicit review and safety planning
6. seed logic must be environment-aware
7. reference/bootstrap data must be distinguishable from test/demo data
8. application release and DB migration compatibility must be planned together

---

## 5. Migration Ownership Model

### Ownership
Database migrations are owned by backend engineering.

### Review requirement
Every migration must be code-reviewed for:

- naming correctness
- forward safety
- rollback implications
- lock risk
- data preservation
- index impact
- compatibility with current application version and rollout plan

### Approval expectations
At minimum, migrations affecting the following require elevated review:

- table drops
- column drops
- type changes
- data backfills
- uniqueness changes
- index changes on large tables
- state enum changes
- auth/session tables
- audit tables

---

## 6. Migration Types

Migrations may be categorized as follows:

### 6.1 Schema migrations
Structural changes such as:
- create table
- alter table
- add column
- create index
- create constraint
- add enum value
- foreign keys

### 6.2 Data migrations
Data transformation such as:
- backfill slug values
- normalize sort order
- convert existing state values
- populate derived columns

### 6.3 Bootstrap migrations
Minimal essential bootstrap data required for application correctness.

Use sparingly.

Examples:
- default roles if represented in DB
- mandatory root categories only if product logic requires them

### Rule
Do not mix complex schema changes and large risky data backfills in one opaque migration unless clearly justified.

---

## 7. Migration File Conventions

Every migration file must be:

- immutable after merge
- uniquely named
- ordered deterministically
- easy to understand during incident review

Recommended naming format:

```text
YYYYMMDDHHMMSS_short_descriptive_name

Examples:

text
20260426103000_create_users_table
20260426104500_create_categories_table
20260426112000_add_product_slug_unique_index
20260426124000_backfill_category_sort_order

Rules:
- use UTC-based timestamp ordering
- use lowercase snake_case names
- avoid generic names like `update_table`
- filename must describe intent clearly
```
---

## 8. Migration Granularity Rules

Prefer small, focused migrations.

### Good examples
- create `users` table
- create `products` table
- add `published_at` to `products`
- create unique index on `products.slug`

### Bad examples
- create 12 tables plus 4 backfills plus 3 index changes in one migration
- rename multiple concepts and rewrite data with no isolation

### Practical rule
One migration should usually answer one operational question:
- what changed?
- why?
- what could fail?
- how do we recover?

If those questions cannot be answered simply, the migration is too large.

---

## 9. Forward-Only vs Reversible Strategy

### Baseline policy
All migrations must support a clear rollback strategy, but not every migration must be automatically reversible.

Two acceptable approaches:

### Approach A — Reversible migration
Suitable for:
- new tables
- new indexes
- new nullable columns
- non-destructive additions

### Approach B — Forward-only migration with documented rollback plan
Suitable for:
- data backfills
- enum extension
- destructive cleanups
- irreversible transformations

If a migration is forward-only, the PR and release notes must state:

- why rollback is not automatic
- what application rollback compatibility exists
- what manual remediation steps apply

---

## 10. Safe Schema Evolution Rules

### 10.1 Additive-first rule
Prefer additive schema changes before destructive changes.

Example safe rollout:
1. add nullable column
2. deploy app writing both old/new forms if needed
3. backfill existing rows
4. deploy app reading new column
5. remove old column later in separate release

### 10.2 Avoid destructive changes in same release
Do not:
- drop old columns immediately after introducing replacements
- rename columns in-place if compatibility matters
- tighten constraints before data is compliant

### 10.3 Constraint hardening sequence
For non-null or uniqueness rules:
1. create column nullable
2. populate/backfill safely
3. verify no invalid rows remain
4. apply non-null or uniqueness constraint

### 10.4 Large table caution
For larger datasets:
- avoid long blocking operations during peak traffic
- evaluate online index creation features where supported
- separate backfills from deploy-critical schema actions

---

## 11. PostgreSQL-Specific Rules

### Required practices
- use explicit constraints
- use foreign keys where integrity matters
- use indexes intentionally, not automatically
- use `CHECK` constraints for bounded invariants when appropriate
- use `TIMESTAMPTZ` for timestamps
- store times in UTC
- use `JSONB` only when structure is intentionally flexible

### Avoid
- implicit schema behavior without explicit migration
- unbounded text fields where practical limits should exist
- storing derived values without clear reason
- using DB enums casually if change frequency is uncertain

### Enum policy
For MVP, prefer one of:
- application-level enum with DB check constraint
- PostgreSQL enum if values are stable and operationally manageable

Be consistent across the schema.

---

## 12. Migration Content Standards

Every migration should clearly define:

- purpose
- affected objects
- forward operation
- reverse operation if supported
- notes for risky operations

If migration framework supports comments/metadata, use them.

If not, include a short header in the migration source code.

Example comment header:

sql
-- Purpose: add published_at to products for publish lifecycle tracking
-- Safe rollout: additive
-- Reverse: drop column published_at

---

## 13. Required Initial Migration Set

The MVP baseline should include migrations for at least:

- users table
- sessions table
- categories table
- products table
- product media table
- audit logs table
- required indexes
- required foreign keys
- required unique constraints

Depending on implementation choice, it may also include:
- OTP challenges table
- refresh/session token table
- outbox/event table if introduced later

---

## 14. Suggested Migration Order for MVP

Recommended order:

1. create users
2. create sessions
3. create categories
4. create products
5. create product_media
6. create audit_logs
7. create indexes and uniqueness constraints
8. seed baseline admin or bootstrap data if required
9. optional backfills or normalization scripts

Reason:
- foundational auth and ownership entities first
- taxonomy before products
- products before media
- audit after core domain if independent

---

## 15. Seed Data Strategy

Seeding must be divided into explicit categories.

### 15.1 Bootstrap seed
Minimal required data for application operation.

Examples:
- initial admin user if policy requires bootstrapped access
- mandatory internal roles if represented in DB
- top-level categories only if absolutely required

### 15.2 Development seed
Data for local development convenience.

Examples:
- sample categories
- sample draft/published products
- sample media metadata
- test users

### 15.3 Test seed
Deterministic fixtures for automated tests.

Examples:
- one admin user
- one regular user
- one published product
- one archived product
- one category tree

### 15.4 Production seed
Must be minimal and intentional.

Production must never be seeded with:
- fake demo products
- fake users
- broad sample data
- dummy media

---

## 16. Seed Data Principles

Rules:
- seed scripts must be deterministic
- production seeds must be idempotent where possible
- seed data must be clearly tagged by purpose
- seed scripts must not silently overwrite real production data
- test data must not leak into production environments
- local convenience data must be isolated from bootstrap essentials

---

## 17. Environment-Specific Seeding Policy

### Local
Allowed:
- bootstrap seed
- development seed
- optional reset-and-reseed workflow

### Test / CI
Allowed:
- deterministic test seed only
- isolated per test suite or test run where practical

### Staging
Allowed:
- bootstrap seed
- limited realistic non-sensitive sample data if intentionally approved

### Production
Allowed:
- bootstrap-only
- no demo data
- no sample catalog data unless business explicitly approves and tracks it

---

## 18. Initial Admin User Seeding Policy

If the system requires an initial admin user for first access, choose one of these policies:

### Policy A — bootstrap admin seed
A one-time bootstrap creates first admin identity from secure environment configuration.

Requirements:
- mobile or identifier provided by env
- no hardcoded credentials
- bootstrap action logged
- bootstrap is idempotent
- process is documented

### Policy B — manual promotion workflow
Create user through normal auth flow, then promote via controlled admin SQL/runbook step.

Requirements:
- runbook documented
- audit trail preserved where possible
- manual operation limited to first setup only

### Recommendation
Prefer `Policy A` if implementation can be done safely and simply.
Prefer `Policy B` if admin bootstrapping complexity would create security risk.

---

## 19. Migration Execution Rules

### Local development
Typical commands:
- create migration
- run migrations
- rollback last migration if supported
- reset database and rerun migrations

### CI
CI must validate at minimum:
- migrations apply successfully on clean DB
- schema boots from zero state
- application can start after migrations
- tests run against migrated schema

### Staging
Before production:
- run migrations against staging
- validate app compatibility
- validate health endpoints
- validate critical flows

### Production
Production migration execution must:
- use reviewed artifact/version
- run from controlled pipeline or documented operator command
- be logged
- happen before or during deploy according to compatibility strategy
- include post-migration verification

---

## 20. Production Migration Safety Checklist

Before running a production migration, verify:

- migration reviewed
- backup status verified
- rollback strategy documented
- expected runtime/lock impact understood
- application compatibility confirmed
- staging execution succeeded
- on-call/owner aware if risk is non-trivial
- maintenance window considered if needed
- monitoring and logs available during execution

---

## 21. Post-Migration Verification Checklist

After applying migrations, verify:

- migration status marked successful
- application starts successfully
- readiness checks pass
- no unexpected DB errors in logs
- critical endpoints work
- insert/update/select on changed tables work
- indexes/constraints behave as expected
- seed data applied only where intended

---

## 22. Rollback Strategy

Rollback strategy must be defined at release level, not assumed.

Possible rollback modes:

### 22.1 Application-only rollback
Use when schema changes are backward-compatible.

Example:
- add nullable column
- old app version can still run safely

### 22.2 Migration rollback
Use when migration is safely reversible.

Example:
- remove newly added unused table

### 22.3 Forward-fix
Use when rollback is unsafe or impossible.

Example:
- data backfill partially applied
- enum values extended
- irreversible transformations made

### Rule
For risky releases, decide rollback mode before deployment.

---

## 23. Data Migration Rules

Data migrations must be written carefully.

Rules:
- be deterministic
- avoid ambiguous transforms
- operate in batches if dataset size requires it
- log progress if execution may be long
- fail loudly on invalid assumptions
- avoid hidden business logic that belongs in application code

Examples of acceptable data migration:
- backfill null `sort_order` to `0`
- generate slugs for legacy rows with clear algorithm

Examples of risky data migration:
- infer product categories from unstructured text without manual verification
- rewrite state machine values with incomplete mapping logic

---

## 24. Seed Implementation Rules

Seeders should be implemented as explicit commands or scripts.

Recommended structure:

text
src/database/
  migrations/
  seeds/
    bootstrap/
    development/
    test/

Rules:
- each seed type has explicit entrypoint
- production deploy must never run development seed by mistake
- seed commands must validate environment before running
- bootstrap seed should be safe to run multiple times when possible

Example command design:

bash
npm run db:migrate
npm run db:seed:bootstrap
npm run db:seed:dev
npm run db:seed:test

---

## 25. Example Seed Scope for MVP

### Bootstrap seed
May include:
- initial admin user or bootstrap admin marker
- required static categories only if policy requires them

### Development seed
May include:
- 3 categories
- 10 sample products
- several media metadata records
- one admin user
- one regular user

### Test seed
May include:
- fixed admin user
- fixed session fixture
- category tree
- products in `draft`, `published`, `archived`
- upload metadata fixture

---

## 26. Seeding Safety Controls

Required controls:
- environment guard rails
- explicit confirmation for destructive local reseed commands
- production detection logic
- no use of default passwords in production bootstrap
- no plaintext secret output in console logs

Example guard:
- `db:seed:dev` must fail in `production`
- `db:reset` must fail in `production`
- `db:seed:test` must fail outside allowed environments unless explicitly forced in CI tooling

---

## 27. Test Database Lifecycle Policy

Automated testing should not rely on long-lived shared mutable state.

Preferred patterns:
- create schema from migrations for test runs
- isolate tests by transaction or database reset strategy
- keep test seed deterministic
- avoid order-dependent test data

Rules:
- tests must not depend on manually prepared database contents
- tests must be runnable from zero state
- migration path must be part of CI confidence, not bypassed

---

## 28. Drift Prevention Policy

Schema drift occurs when actual DB differs from migration history.

Prevent drift by:
- forbidding manual production schema edits
- using migration tool state consistently
- validating schema in staging
- requiring all structural changes through PR-reviewed migrations

If manual emergency DB change is unavoidable:
1. document exact SQL
2. assess impact immediately
3. create corrective migration as soon as possible
4. record incident/runbook note

---

## 29. Compatibility Between App Releases and Migrations

Every release that includes schema changes must answer:

- Can new app run before migration?
- Can old app run after migration?
- Is the change additive or breaking?
- Is a maintenance window needed?
- Is a multi-step rollout required?

Preferred MVP policy:
- design migrations so deployment can tolerate short sequencing differences
- prefer additive changes
- avoid one-shot breaking schema rewrites

---

## 30. Operational Commands Baseline

Exact commands depend on the chosen tooling, but the workflow must support:

bash
npm run db:migrate
npm run db:rollback
npm run db:seed:bootstrap
npm run db:seed:dev
npm run db:seed:test
npm run db:reset

Minimum command expectations:
- clear exit codes
- useful console output
- environment awareness
- failure on unsafe production misuse

---

## 31. CI/CD Requirements for Migrations

CI pipeline should validate:

- migration files are syntactically valid
- migrations apply to clean DB
- seed scripts execute in intended environments
- automated tests pass on migrated schema

CD pipeline or release process should support:
- migration step visibility
- explicit failure detection
- deploy halt on migration failure
- post-deploy verification

---

## 32. Example Release Workflow with Migrations

Recommended release flow:

1. merge reviewed migration and app code
2. CI validates migrations on clean DB
3. deploy to staging
4. run migrations in staging
5. validate critical flows
6. create/approve production release
7. verify backup readiness
8. run production migrations
9. deploy application version
10. run post-deploy health and smoke checks
11. monitor logs and DB errors

If release requires reverse order, it must be explicitly justified by compatibility rules.

---

## 33. Documentation Requirements Per Migration

Each meaningful migration PR should document:

- reason for change
- affected tables/columns/indexes
- production risk level
- expected execution characteristics
- rollback or forward-fix plan
- whether seed changes are also required

This is mandatory for risky migrations and strongly recommended for all others.

---

## 34. Anti-Patterns

Do not:
- edit old migration files after they are merged
- make schema changes manually in production without reconciliation
- combine unrelated schema changes in one migration
- run development seed in staging/production
- hide destructive behavior inside ambiguous seed scripts
- rely on ORM auto-sync in production
- skip migration testing in CI
- drop data as part of “cleanup” without explicit approval
- encode business-critical bootstrap assumptions only in tribal knowledge

---

## 35. MVP Baseline Recommendation

For the initial MVP, adopt the following operational baseline:

- all schema created through migrations
- all environments boot from migration history
- production uses bootstrap-only seed
- local and CI use environment-specific seed commands
- destructive migrations deferred unless strictly necessary
- release notes include migration impact summary
- staging validates every schema-changing release before production

This baseline is sufficient for a production-grade MVP on a single PostgreSQL instance.

---

## 36. Definition of Done

A migration or seed change is complete only when:

- code is reviewed
- naming follows conventions
- migration applies successfully on clean DB
- rollback/forward-fix plan is defined
- environment restrictions are enforced
- tests pass
- documentation is updated if operational behavior changed

---

## 37. Final Rule

Database migrations and seeds are part of the production system, not setup convenience.

They must be treated with the same engineering discipline as:
- API contracts
- security controls
- deployment scripts
- runtime code

Any schema or seed change that is not safe, reviewable, and reproducible is not acceptable for MVP production delivery.