# Deployment Runbook

## Purpose

این سند نحوه استقرار، بروزرسانی و rollback سیستم را مشخص می‌کند.

---

## Deployment Model

پیشنهاد اصلی:

- `frontend` container
- `backend` container
- `postgres` container/service
- `minio` container
- `reverse-proxy` container

---

## Environment Tiers

- `local`
- `staging`
- `production`

---

## Infrastructure Requirements

### Minimum VPS Suggestion
- 2 to 4 vCPU
- 4 to 8 GB RAM
- SSD storage
- stable network
- Ubuntu LTS

### Recommended Production Baseline
- separate persistent volume for PostgreSQL
- separate persistent volume for MinIO
- automated restart policy
- off-server backups

---

## Required Environment Variables

Example categories:

### Backend
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `SESSION_SECRET`
- `COOKIE_DOMAIN`
- `STORAGE_ENDPOINT`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `SMS_PROVIDER`
- `SMS_API_KEY`

### Frontend
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_BASE_URL`

### Database
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

---

## Deployment Steps

### 1. Prepare Server
- update system packages
- install Docker and Docker Compose
- configure firewall
- configure domain DNS
- mount persistent volumes

### 2. Prepare Reverse Proxy
- configure TLS
- configure HTTP to HTTPS redirect
- configure security headers
- configure upstream routes

### 3. Prepare Environment Files
- create `.env.production`
- validate secrets
- ensure no placeholder values remain

### 4. Build and Start Services
```bash
docker compose --env-file .env.production up -d --build

### 5. Run Database Migrations
bash
docker compose exec backend npm run migrate

### 6. Verify Health
bash
curl -f https://your-domain.com/health/live
curl -f https://your-domain.com/health/ready

### 7. Run Smoke Checks
- login OTP request path
- product create path
- storefront read path
- media upload intent path
```
---

## Release Process

### Standard Release
1. merge approved code
2. build images
3. deploy to staging
4. run smoke tests
5. approve release
6. deploy production
7. run production smoke tests
8. monitor logs and metrics

---

## Rollback Process

Rollback should be possible for:
- app image
- reverse proxy config
- feature flags if any

### Rollback Rules
- DB destructive migrations must not be coupled with immediate rollback assumptions
- rollback plan must be known before release

### Example App Rollback
bash
docker compose pull
docker compose up -d

یا deploy image tag قبلی.

---

## Backup Policy

### PostgreSQL
- scheduled dumps
- retention policy
- encrypted storage preferred
- periodic restore test mandatory

### MinIO
- object backup or replication strategy
- metadata consistency check if needed

---

## Operational Checks After Deploy

- health endpoints pass
- DB connectivity OK
- public storefront accessible
- auth endpoint reachable
- no spike in error logs
- no migration errors
- no storage connectivity errors

---

## Disaster Recovery Minimum

باید بتوان موارد زیر را انجام داد:
- restore PostgreSQL from backup
- restore object storage data
- redeploy application from clean server
- rotate secrets if needed

---

## Production Rules

- no manual hotfix directly on server without documentation
- no direct DB mutation except emergency process
- all releases must be traceable
- staging before production for significant changes


---
