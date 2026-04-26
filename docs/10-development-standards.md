# Development Standards

## Purpose

این سند استانداردهای توسعه را تعریف می‌کند تا کدبیس از ابتدا یکدست، maintainable و production-grade باشد.

---

## Core Principles

- clean code
- explicit boundaries
- low coupling
- high readability
- deterministic behavior
- production safety over shortcuts

---

## General Rules

- use `TypeScript` strict mode
- avoid `any`
- prefer explicit interfaces
- keep functions focused
- prefer composition over hidden magic
- avoid premature abstraction
- no dead code
- no commented-out obsolete code

---

## Naming Rules

- variables and functions: clear and intention-revealing
- classes: noun-based
- services: use-case oriented
- repository interfaces: domain-oriented
- avoid vague names مثل `data`, `helper`, `manager`

---

## Backend Code Rules

- controller must stay thin
- business logic must live in application/domain
- repository only handles persistence concerns
- external SDK calls only in infrastructure layer
- no direct SQL/ORM usage in controller
- validate at boundary

---

## Frontend Code Rules

- components should be small and composable
- business logic should not be scattered in UI
- shared UI primitives should be reusable
- API calls should go through centralized client layer
- no duplicated validation rules where avoidable

---

## Error Handling Rules

- never swallow errors silently
- map errors to known types
- do not expose internal implementation details
- include correlationId in responses/logs

---

## Testing Rules

- all business-critical flows require tests
- bug fixes should include regression tests when applicable
- do not rely only on manual QA
- migrations require validation before production

---

## Git and Review Rules

- small focused PRs
- descriptive commit messages
- no direct push to protected branches
- every PR must be reviewed
- architecture-impacting changes require explicit approval

---

## Documentation Rules

هر بخش مهم باید مستند باشد:
- module responsibility
- public API contract
- env vars
- operational caveats
- non-obvious business rules

---

## Dependency Rules

قبل از اضافه کردن dependency:
- why is it needed?
- can existing stack solve it?
- what is operational cost?
- what is security risk?
- what is bundle/runtime cost?

---

## Configuration Rules

- no hardcoded secrets
- config must be environment-driven
- invalid config must fail fast on startup

---

## Definition of Done

یک task فقط زمانی done است که:
- code implemented
- tests added/updated
- docs updated if needed
- logs/errors handled correctly
- no obvious security or operational gap introduced
