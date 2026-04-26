# Docker Compose Production Deployment

## 1. Purpose

This document defines the production-grade Docker Compose deployment model for Micro-Catalog on a single VPS.

Goals:
- low operational complexity
- low infrastructure cost
- minimal external dependencies
- reproducible deployment
- safe restart behavior
- maintainable backup and rollback path
- compatible with VPS hosting common in Iran

This document assumes:
- one VPS
- Docker Engine installed
- Docker Compose plugin installed
- domain and DNS already configured
- TLS terminated at Nginx
- PostgreSQL runs in a dedicated container on the same VPS for MVP/Phase 1

This is a valid production setup for early-stage rollout with controlled traffic.
It is not the final form for very high scale or multi-node HA.

---

## 2. Deployment Topology

Single-host topology:

- `nginx`
  - public entrypoint
  - TLS termination
  - reverse proxy to web and api
  - static/media serving if needed
- `api`
  - backend application
  - private network only
- `web`
  - frontend application
  - private network only
- `db`
  - PostgreSQL
  - private network only
- `backup`
  - scheduled DB backup container or host-side cron integration

Logical flow:
```text
Internet
   |
   v
Nginx (80/443)
   |------------------> Web container
   |
   +------------------> API container
|
v
PostgreSQL container
```
---

## 3. Deployment Principles

1. only `nginx` exposes public ports
2. `db`, `api`, and `web` are internal on docker network
3. persistent data uses named volumes or mounted host paths
4. containers restart automatically
5. health checks must exist for critical services
6. logs must go to stdout/stderr and be collected by Docker
7. no source-code bind mount in production
8. secrets must be injected from server-side env file
9. backup path must be persistent outside ephemeral container filesystem
10. image tags must be explicit, not floating `latest`

---

## 4. Recommended VPS Baseline

Minimum recommended production VPS for MVP:

- 2 vCPU
- 4 GB RAM
- 60+ GB SSD
- Ubuntu 22.04 LTS
- Docker Engine 24+
- Docker Compose plugin

Preferred for safer headroom:

- 4 vCPU
- 8 GB RAM
- 80+ GB SSD

If image processing or heavy media usage increases:
- move to 8 GB RAM minimum

---

## 5. Directory Layout on VPS

Recommended server layout:

```bash
/opt/micro-catalog/
  compose/
docker-compose.yml
.env.production
.env.nginx
nginx/
nginx.conf
sites/
micro-catalog.conf
ssl/
fullchain.pem
privkey.pem
  data/
postgres/
uploads/
backups/
  releases/
api/
web/

Alternative:
- if using private container registry, image build artifacts remain outside VPS code directory

Rules:
- `compose/` contains deployment manifests only
- `data/` contains persistent runtime data
- `ssl/` permissions must be restricted
- `.env.production` readable only by trusted operators
```
---

## 6. Production Compose File

Example production `docker-compose.yml`:

```yaml
version: "3.9"

name: micro-catalog

services:
  nginx:
image: nginx:1.27-alpine
container_name: catalog-nginx
restart: unless-stopped
depends_on:
- web
- api
ports:
- "80:80"
- "443:443"
volumes:
- ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
- ./nginx/sites:/etc/nginx/conf.d:ro
- ./nginx/ssl:/etc/nginx/ssl:ro
- /opt/micro-catalog/data/uploads:/var/www/uploads:ro
networks:
- public_net
- app_net
healthcheck:
test: ["CMD-SHELL", "nginx -t || exit 1"]
interval: 30s
timeout: 10s
retries: 3

  api:
image: registry.example.com/micro-catalog/api:1.0.0
container_name: catalog-api
restart: unless-stopped
env_file:
- .env.production
depends_on:
db:
condition: service_healthy
expose:
- "3000"
volumes:
- /opt/micro-catalog/data/uploads:/app/uploads
networks:
- app_net
healthcheck:
test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:3000/health/live || exit 1"]
interval: 30s
timeout: 5s
retries: 5
start_period: 20s
read_only: true
tmpfs:
- /tmp
security_opt:
- no-new-privileges:true

  web:
image: registry.example.com/micro-catalog/web:1.0.0
container_name: catalog-web
restart: unless-stopped
env_file:
- .env.production
depends_on:
- api
expose:
- "3001"
networks:
- app_net
healthcheck:
test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:3001/ || exit 1"]
interval: 30s
timeout: 5s
retries: 5
start_period: 20s
read_only: true
tmpfs:
- /tmp
security_opt:
- no-new-privileges:true

  db:
image: postgres:16-alpine
container_name: catalog-db
restart: unless-stopped
environment:
POSTGRES_DB: ${DB_NAME}
POSTGRES_USER: ${DB_USER}
POSTGRES_PASSWORD: ${DB_PASSWORD}
expose:
- "5432"
volumes:
- /opt/micro-catalog/data/postgres:/var/lib/postgresql/data
networks:
- app_net
healthcheck:
test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME} || exit 1"]
interval: 10s
timeout: 5s
retries: 10
shm_size: "256mb"
security_opt:
- no-new-privileges:true

  backup:
image: postgres:16-alpine
container_name: catalog-backup
restart: unless-stopped
env_file:
- .env.production
depends_on:
db:
condition: service_healthy
volumes:
- /opt/micro-catalog/data/backups:/backups
networks:
- app_net
entrypoint: ["/bin/sh", "-c"]
command: >
while true; do
sleep 86400;
done
security_opt:
- no-new-privileges:true

networks:
  public_net:
driver: bridge
  app_net:
driver: bridge
```
---

## 7. Compose Design Notes

### 7.1 Why only Nginx exposes ports

This reduces attack surface:
- API is not directly reachable from internet on raw app port
- Web is not directly reachable on node server port
- DB remains private

### 7.2 Why `read_only: true`

For `api` and `web`, this limits write access in container filesystem.
Writable paths must be explicit:
- uploads volume
- `/tmp` tmpfs

### 7.3 Why explicit image tags

Avoid:
yaml
image: registry.example.com/micro-catalog/api:latest

Use:
yaml
image: registry.example.com/micro-catalog/api:1.0.0

Benefits:
- deterministic rollback
- predictable deployment
- lower release ambiguity

---

## 8. Production Environment File Example

Example `.env.production`:

```env
APP_ENV=production
NODE_ENV=production
APP_NAME=micro-catalog

APP_PORT=3000
APP_BASE_URL=https://api.example.com
WEB_BASE_URL=https://example.com
LOG_LEVEL=info
TRUST_PROXY=true

DB_HOST=db
DB_PORT=5432
DB_NAME=micro_catalog
DB_USER=catalog_user
DB_PASSWORD=REPLACE_WITH_STRONG_PASSWORD
DATABASE_URL=postgresql://catalog_user:REPLACE_WITH_STRONG_PASSWORD@db:5432/micro_catalog
DB_SSL_MODE=disable

SESSION_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
SESSION_TTL_DAYS=30
OTP_TTL_SEC=120
OTP_RESEND_COOLDOWN_SEC=60
OTP_MAX_ATTEMPTS=5
LOGIN_MAX_ATTEMPTS_PER_WINDOW=10
LOGIN_WINDOW_SEC=900
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=.example.com

SMS_PROVIDER=kavenegar
SMS_API_KEY=REPLACE_WITH_SMS_API_KEY
SMS_TEMPLATE_LOGIN=login-otp
SMS_SENDER=
SMS_ENABLED=true

STORAGE_DRIVER=local
MEDIA_MAX_UPLOAD_MB=10
MEDIA_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
MEDIA_PUBLIC_BASE_URL=https://example.com/uploads

RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_SEC=60
RATE_LIMIT_MAX_REQUESTS=120
OTP_RATE_LIMIT_WINDOW_SEC=3600
OTP_RATE_LIMIT_MAX_REQUESTS=5

CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com
CORS_ALLOW_CREDENTIALS=true

REQUEST_LOGGING_ENABLED=true
METRICS_ENABLED=true
HEALTHCHECK_ENABLED=true
SLOW_REQUEST_THRESHOLD_MS=1000

BACKUP_ENABLED=true
BACKUP_SCHEDULE_CRON=0 3 * * *
BACKUP_RETENTION_DAYS=7
BACKUP_DIR=/backups
BACKUP_ENCRYPTION_ENABLED=true
BACKUP_ENCRYPTION_PASSWORD=REPLACE_WITH_BACKUP_PASSWORD

FEATURE_ADMIN_PANEL=true
FEATURE_PUBLIC_CATALOG=true
FEATURE_ANALYTICS=false

NEXT_PUBLIC_WEB_BASE_URL=https://example.com
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_DEFAULT_LOCALE=fa-IR

Rules:
- file permissions should be `600`
- owner should be deploy user or root
- never commit this file into git

Commands:

bash
chmod 600 /opt/micro-catalog/compose/.env.production
```
---

## 9. Nginx Base Configuration

Recommended `nginx.conf`:

```nginx
user nginx;
worker_processes auto;

events {
worker_connections 1024;
}

http {
include       /etc/nginx/mime.types;
default_type  application/octet-stream;

sendfile on;
tcp_nopush on;
tcp_nodelay on;
keepalive_timeout 65;
client_max_body_size 10m;
server_tokens off;

log_format main escape=json
'{'
'"time":"$time_iso8601",'
'"remote_addr":"$remote_addr",'
'"request_id":"$request_id",'
'"method":"$request_method",'
'"uri":"$request_uri",'
'"status":$status,'
'"body_bytes_sent":$body_bytes_sent,'
'"referer":"$http_referer",'
'"user_agent":"$http_user_agent",'
'"forwarded_for":"$http_x_forwarded_for",'
'"request_time":$request_time'
'}';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log warn;

gzip on;
gzip_types text/plain text/css application/json application/javascript application/xml+rss application/xml image/svg+xml;

map $http_upgrade $connection_upgrade {
default upgrade;
''      close;
}

include /etc/nginx/conf.d/*.conf;
}
```
---

## 10. Nginx Site Configuration

Example `nginx/sites/micro-catalog.conf`:

```nginx
server {
listen 80;
server_name example.com www.example.com api.example.com;

location /.well-known/acme-challenge/ {
root /var/www/certbot;
}

location / {
return 301 https://$host$request_uri;
}
}

server {
listen 443 ssl http2;
server_name example.com www.example.com;

ssl_certificate     /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;

add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-XSS-Protection "1; mode=block" always;

location /_next/static/ {
proxy_pass http://catalog-web:3001;
proxy_set_header Host $host;
}

location /uploads/ {
alias /var/www/uploads/;
access_log off;
expires 30d;
add_header Cache-Control "public, max-age=2592000, immutable";
}

location / {
proxy_pass http://catalog-web:3001;
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto https;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
}
}

server {
listen 443 ssl http2;
server_name api.example.com;

ssl_certificate     /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;

location /health/live {
proxy_pass http://catalog-api:3000/health/live;
proxy_set_header Host $host;
}

location /health/ready {
proxy_pass http://catalog-api:3000/health/ready;
proxy_set_header Host $host;
}

location / {
proxy_pass http://catalog-api:3000;
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Request-ID $request_id;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto https;
}
}
```
---

## 11. TLS Strategy

### Option A — Certificate files managed externally

Use:
- Let's Encrypt with certbot on host
- acme.sh
- hosting provider certificate management

Then mount generated files into nginx.

Pros:
- simple
- common on VPS

Cons:
- renewal process must be documented

### Option B — Reverse proxy with auto TLS

Possible, but not preferred for this architecture if trying to keep control explicit and predictable.

Recommended for this project:
- explicit certificate files
- scheduled renewal automation on host
- post-renew nginx reload

Example host command after renewal:

bash
docker compose -f /opt/micro-catalog/compose/docker-compose.yml exec nginx nginx -s reload

---

## 12. Persistent Volume Strategy

### 12.1 PostgreSQL Data

Path:
```bash
/opt/micro-catalog/data/postgres

Requirements:
- persistent SSD-backed storage
- daily backup
- do not edit manually

### 12.2 Uploaded Media

Path:
bash
/opt/micro-catalog/data/uploads

Requirements:
- writable by API container
- readable by Nginx
- backed up with DB metadata

### 12.3 Backups

Path:
bash
/opt/micro-catalog/data/backups

Requirements:
- outside application container layer
- retained according to policy
- optionally synced to secondary storage if available
```
---

## 13. Backup Strategy

### 13.1 Minimum Backup Scope

Required:
- PostgreSQL dump
- uploaded media directory
- deployment manifests (`docker-compose.yml`, nginx config, env shape without secrets if possible)

### 13.2 Recommended DB Backup Command

Example manual backup:

```bash
docker exec catalog-db pg_dump -U catalog_user -d micro_catalog > /opt/micro-catalog/data/backups/micro_catalog_$(date +%F_%H-%M-%S).sql

Compressed variant:

bash
docker exec catalog-db pg_dump -U catalog_user -d micro_catalog | gzip > /opt/micro-catalog/data/backups/micro_catalog_$(date +%F_%H-%M-%S).sql.gz

### 13.3 Media Backup Command

bash
tar -czf /opt/micro-catalog/data/backups/uploads_$(date +%F_%H-%M-%S).tar.gz /opt/micro-catalog/data/uploads
```
### 13.4 Retention

Minimum:
- 7 daily backups

Preferred:
- 7 daily
- 4 weekly
- 3 monthly

### 13.5 Restore Drill

Must be tested before production launch:
- restore DB to clean environment
- restore uploads
- run app
- verify core flows

---

## 14. Deployment Procedure

## 14.1 First-Time Server Preparation

Install Docker and Compose:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

Create directories:

bash
sudo mkdir -p /opt/micro-catalog/compose/nginx/sites
sudo mkdir -p /opt/micro-catalog/compose/nginx/ssl
sudo mkdir -p /opt/micro-catalog/data/postgres
sudo mkdir -p /opt/micro-catalog/data/uploads
sudo mkdir -p /opt/micro-catalog/data/backups

Permissions:

bash
sudo chown -R $USER:$USER /opt/micro-catalog
chmod 700 /opt/micro-catalog/data/backups
```
---

## 14.2 Deploy Configuration Files

Copy:
- `docker-compose.yml`
- `.env.production`
- `nginx.conf`
- `micro-catalog.conf`
- TLS cert files

Validate:

```bash
docker compose -f /opt/micro-catalog/compose/docker-compose.yml config
```
---

## 14.3 Pull and Start

```bash
cd /opt/micro-catalog/compose
docker compose pull
docker compose up -d

Check status:

bash
docker compose ps

Logs:

bash
docker compose logs -f nginx
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db
```
---

## 15. Zero-Downtime Consideration

Plain Docker Compose on one VPS does not guarantee true zero-downtime for all deployments.

For MVP:
- acceptable to have short restart window
- minimize by deploying web and api one at a time when possible
- ensure healthchecks pass before traffic verification

If stricter uptime becomes required later:
- blue/green or dual-stack reverse proxy approach
- separate DB host
- orchestrator migration

---

## 16. Rollback Procedure

### 16.1 Image Rollback

Edit image tag in `docker-compose.yml`:

```yaml
image: registry.example.com/micro-catalog/api:0.9.3

Then:

bash
docker compose pull api web
docker compose up -d api web
```
### 16.2 DB Rollback

Danger:
DB rollback is not the same as image rollback.

Required:
- schema migrations must be backward compatible whenever possible
- backup must exist before migration
- destructive migration must have explicit rollback plan

Restore example:

bash
gunzip -c /opt/micro-catalog/data/backups/micro_catalog_2026-04-26_03-00-00.sql.gz | docker exec -i catalog-db psql -U catalog_user -d micro_catalog

Use only after careful validation.

---

## 17. Health Check Design

Required endpoints:
- `GET /health/live`
- `GET /health/ready`

### 17.1 Liveness

Purpose:
- process is alive

Should check:
- app process running
- basic internal loop functioning

Should not fail because:
- external SMS provider is down

### 17.2 Readiness

Purpose:
- instance ready to serve requests

Should check:
- DB connectivity
- critical configuration loaded
- required writable path available if applicable

Response example:

```json
{
  "status": "ok",
  "service": "catalog-api",
  "checks": {
"database": "ok"
  }
}
```
---

## 18. Logging Strategy

Recommended:
- app logs to stdout/stderr
- nginx logs to default files inside container and Docker captures stream
- central external logging is optional in MVP
- structured JSON logging preferred for API

Rules:
- no OTP values in logs
- no session secrets in logs
- no full PII dumps
- 4xx and 5xx must be observable

Useful commands:

```bash
docker compose logs --tail=200 api
docker compose logs --tail=200 nginx
```
---

## 19. Security Baseline for Compose Deployment

Required:
- only `nginx` exposes ports
- no DB public exposure
- strong secrets
- TLS enabled
- security headers enabled
- `no-new-privileges`
- minimal writable paths
- image tags pinned
- access to server restricted by SSH key
- root login disabled if possible
- firewall enabled

Recommended UFW setup:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

Never expose:
- `5432`
- `3000`
- `3001`

to public internet.
```
---

## 20. Host-Level Hardening

Minimum:
- create non-root deploy user
- SSH key auth only
- disable password auth if operationally possible
- automatic security updates enabled
- firewall enabled
- time synchronization enabled
- disk space monitoring

Recommended:
- fail2ban
- unattended-upgrades
- periodic reboot window if kernel updates require it

---

## 21. Image Build and Release Policy

Recommended release flow:
1. build image in CI
2. run tests
3. push versioned image to registry
4. update compose file with new tag
5. deploy with `docker compose pull && docker compose up -d`

Do not build production images manually on server unless temporarily unavoidable.

Preferred tags:
- semantic version: `1.0.0`
- plus immutable commit tag if desired: `1.0.0-sha.abcdef`

---

## 22. Operational Commands

### Start

```bash
docker compose up -d

### Stop

bash
docker compose down

### Restart one service

bash
docker compose restart api

### Pull latest pinned images

bash
docker compose pull

### Recreate containers

bash
docker compose up -d --force-recreate

### Inspect environment-resolved config

bash
docker compose config

### Check health status

bash
docker inspect --format='{{json .State.Health}}' catalog-api
```
---

## 23. Failure Scenarios and Response

### Scenario A — API unhealthy

Check:
```bash
docker compose logs --tail=200 api
docker compose ps

Inspect:
- startup validation failure
- DB connection error
- missing env var
- migration issue

### Scenario B — DB disk full

Check:
bash
df -h
docker compose logs db

Action:
- free space
- rotate old backups
- expand disk if required

### Scenario C — Uploads not accessible

Check:
- volume mount path
- file permissions
- nginx alias path
- `MEDIA_PUBLIC_BASE_URL`

### Scenario D — TLS expired

Check certificate renewal automation.
Reload nginx after renewal.
```
---

## 24. Production Readiness Checklist

Before go-live:

- [ ] server hardened
- [ ] firewall enabled
- [ ] docker and compose installed
- [ ] directories created
- [ ] `.env.production` validated
- [ ] secrets are strong and unique
- [ ] nginx config validated
- [ ] TLS working
- [ ] DB volume persistent
- [ ] uploads volume persistent
- [ ] health endpoints working
- [ ] backup command tested
- [ ] restore drill tested
- [ ] API not publicly exposed except via nginx
- [ ] DB not publicly exposed
- [ ] logs verified
- [ ] image tags pinned

---

## 25. Go/No-Go Rules

No production launch if:
- DB data is not on persistent storage
- backups are not configured
- TLS is not active
- API or DB ports are exposed publicly
- secrets are weak/default
- health checks are absent
- rollback procedure is untested
- disk capacity is insufficient

---

## 26. Future Evolution Path

When traffic or criticality grows, migrate incrementally:

Phase 2:
- move PostgreSQL to dedicated managed server or separate VPS
- move media to object storage/MinIO
- add offsite backup sync
- add metrics stack

Phase 3:
- blue/green deployments
- externalized cache/queue if needed
- CDN for media/static
- multi-node/high-availability design

Current Docker Compose architecture is intentionally optimized for:
- simplicity
- cost control
- operational clarity
- early production readiness
---
