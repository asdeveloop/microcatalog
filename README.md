# Project Repository

**Modular Monolith** — Backend (NestJS) + Frontend (Next.js)

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

## Quick Start
```bash
# Install dependencies
pnpm install

# Development
pnpm dev:backend
pnpm dev:frontend

# Build
pnpm build:backend
pnpm build:frontend

# Lint & Format
pnpm lint
pnpm format

# Test
pnpm test

## Repository Structure


/
├── backend/          # NestJS API
├── frontend/         # Next.js App
├── packages/         # Shared packages
├── docker/           # Docker configs
├── docs/             # Documentation
└── .github/          # CI/CD workflows

## Documentation

See `/docs` for architecture, API contracts, and runbooks.

## Branch Convention

- `main` — production-ready
- `develop` — integration branch
- `feature/*` — new features
- `fix/*` — bug fixes
- `hotfix/*` — production hotfixes

## License

Proprietary


---

## STEPS

```bash
# Initialize pnpm workspace
pnpm install
