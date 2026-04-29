# MicroCatalog

Practical catalog platform concept for sellers who need a lightweight digital storefront under constrained online conditions.

## What This Project Is

`microcatalog` is a product direction for small sellers, offline businesses, and social-channel-dependent merchants who need a simple catalog presence without the complexity of a full ecommerce stack.

The goal is not to build a bloated marketplace.

The goal is to build a focused system that helps sellers:

- present products clearly
- share a reliable catalog link
- operate with limited channel access
- move quickly from inquiry to sale

## Why This Matters

In constrained markets, many sellers cannot rely on stable access to platforms like Instagram or Telegram.

That creates a practical need for:

- simple independent catalog presence
- low-friction product management
- fast deployment
- strong mobile usability

This repository exists as the foundation for that opportunity.

## Product Direction

This project is positioned as:

- a monetizable MVP path
- a lightweight storefront alternative
- a system for quick product discovery and simple inquiry flow

## Architecture

- backend: NestJS
- frontend: Next.js
- database: PostgreSQL
- ORM: Drizzle
- cache: Redis
- package manager: pnpm

## Repository State

The current repository is at the foundation stage:

- base monorepo structure exists
- architecture direction is defined
- roadmap and commercialization potential are clear
- public-facing documentation needed stronger framing and is now being aligned

## Quick Start

### Prerequisites

- Node.js 20+
- `pnpm`
- Docker and Docker Compose for the current local setup

### Install

```bash
pnpm install
```

### Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update the environment files with working values.

### Start all services

```bash
docker-compose up -d
```

### Run app services manually

```bash
pnpm dev:backend
pnpm dev:frontend
```

## Main Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm test
pnpm format:check
```

Focused scripts:

```bash
pnpm dev:backend
pnpm dev:frontend
pnpm build:backend
pnpm build:frontend
```

## Project Role in Portfolio

This repository shows:

- product selection discipline around a realistic market problem
- monorepo planning for a commercial web application
- practical thinking for sellers in unstable platform ecosystems
- the early systems design behind a potentially revenue-generating product

## Ideal Use Case

`microcatalog` is best suited for:

- local sellers who need a simple online catalog
- shops that want a fallback to unstable social channels
- businesses that need a quick mobile-friendly showcase
- operators who want something lighter than a full store builder

## Next Expected Evolution

The most realistic next step for this project is a very small MVP with:

- seller profile
- product list
- category filtering
- simple inquiry or contact flow
- mobile-first product presentation

## Positioning

If you are evaluating product ideas that can work in constrained digital environments, `microcatalog` represents a focused, commercially practical direction rather than an overbuilt platform from day one.
