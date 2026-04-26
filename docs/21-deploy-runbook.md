# Deploy Runbook

## 1. هدف

این سند یک **runbook عملیاتی** برای استقرار پروژه در محیط‌های `staging` و `production` ارائه می‌کند.

هدف این runbook:

- مراحل deploy شفاف، کوتاه و قابل اجرا باشند.
- ریسک خطای انسانی کاهش یابد.
- قبل، حین و بعد از deploy، کنترل‌های لازم انجام شود.
- rollback یا roll-forward در صورت بروز مشکل از قبل تعریف شده باشد.

این سند مکمل اسناد زیر است:

- `docker-compose.production.md`
- `release-management.md`
- `database-migrations-and-seeding.md`

---

## 2. دامنه

این runbook فرض می‌کند:

- استقرار با **Docker Compose** روی یک VPS انجام می‌شود.
- سرویس‌ها حداقل شامل موارد زیر هستند:
  - `nginx`
  - `backend`
  - `frontend`
  - `postgres`
- migrationهای دیتابیس بخشی از فرآیند deploy هستند.
- محیط‌ها:
  - `staging`
  - `production`

---

## 3. پیش‌نیازها

قبل از هر deploy باید این موارد برقرار باشند:

1. دسترسی SSH به سرور مقصد.
2. دسترسی به registry برای pull کردن imageها.
3. فایل env معتبر برای محیط مقصد:
   - `.env.staging`
   - `.env.production`
4. دسترسی به backupهای دیتابیس.
5. docker و docker compose روی سرور نصب و سالم باشند.
6. release/version مشخص باشد:
   - مثال: `v1.4.2`
7. release notes و تغییرات schema بررسی شده باشند.

---

## 4. نقش‌ها

در تیم کوچک ممکن است همه نقش‌ها توسط یک نفر انجام شود.

- **Deployer**
  - اجرای مراحل deploy
  - بررسی health
  - تصمیم برای rollback اولیه

- **Reviewer / Observer** (اختیاری)
  - مشاهده لاگ‌ها
  - تایید smoke test
  - کمک در تصمیم‌گیری go/no-go

---

## 5. متغیرهای استاندارد عملیات

در این runbook از متغیرهای مفهومی زیر استفاده می‌شود:

- `APP_VERSION`
  - مثال: `v1.4.2`

- `REMOTE_DIR`
  - مثال: `/opt/app`

- `ENV_FILE`
  - staging: `.env.staging`
  - production: `.env.production`

- `COMPOSE_FILE`
  - مثال: `docker-compose.yml`

در اجرای واقعی، این‌ها با مسیر و نام واقعی پروژه جایگزین می‌شوند.

---

## 6. سیاست کلی Deploy

### 6.1 ترتیب استاندارد

ترتیب توصیه‌شده برای deploy:

1. بررسی وضعیت فعلی
2. گرفتن backup دیتابیس
3. pull کردن image/version جدید
4. اجرای migrationها
5. بالا آوردن backend و frontend جدید
6. بررسی health checks
7. اجرای smoke tests
8. مانیتورینگ کوتاه‌مدت پس از deploy

### 6.2 اصل مهم

- اگر migrationها **backward-compatible** باشند:
  - rollback اپلیکیشن بسیار ساده‌تر خواهد بود.
- اگر migrationها **destructive** باشند:
  - deploy باید با حساسیت بالا و backup تاییدشده انجام شود.

---

## 7. چک‌لیست قبل از Deploy

## 7.1 Pre-Deploy Checklist

قبل از شروع deploy، این موارد را تایید کن:

- [ ] release/version نهایی مشخص است.
- [ ] commit/tag نهایی تایید شده است.
- [ ] imageهای backend/frontend برای این version در registry موجودند.
- [ ] env فایل صحیح روی سرور وجود دارد.
- [ ] disk space کافی وجود دارد.
- [ ] دیتابیس سالم است.
- [ ] backup policy اجرا شده یا backup جدید گرفته می‌شود.
- [ ] migrationهای release بررسی شده‌اند.
- [ ] rollback plan مشخص است.
- [ ] در production، زمان deploy مناسب است.

---

## 8. دستورات بررسی اولیه سرور

بعد از SSH به سرور:

```bash
ssh user@your-server
cd /opt/app

بررسی وضعیت docker:

bash
docker --version
docker compose version
docker ps
docker compose ps

بررسی فضای دیسک:

bash
df -h

بررسی مصرف volumeها:

bash
docker system df

بررسی وضعیت سرویس‌ها:

bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs --tail=100 nginx
docker compose logs --tail=100 postgres

اگر قبل از deploy سیستم ناپایدار است، ابتدا مشکل فعلی را حل کن و سپس release جدید را اعمال کن.
```
---

## 9. Backup قبل از Deploy

## 9.1 قانون

در `production` قبل از هر deploy که یکی از موارد زیر را دارد، backup الزامی است:

- migration دیتابیس
- تغییر config مهم
- release با ریسک متوسط یا بالا

برای `staging` backup اختیاری ولی توصیه‌شده است.

## 9.2 نمونه backup از PostgreSQL

اگر postgres داخل compose اجرا می‌شود:

```bash
mkdir -p /opt/app/backups
timestamp=$(date +%F-%H%M%S)

docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "/opt/app/backups/db-${timestamp}.sql"

اگر نیاز به فشرده‌سازی باشد:

bash
gzip "/opt/app/backups/db-${timestamp}.sql"
```
## 9.3 اعتبارسنجی Backup

حداقل این موارد چک شود:

```bash
ls -lh /opt/app/backups

در صورت امکان، restore test دوره‌ای روی محیط test/staging انجام شود.  
Backupی که restore آن تست نشده، کاملاً قابل اعتماد فرض نمی‌شود.
```
---

## 10. Deploy به Staging

## 10.1 هدف

deploy روی `staging` برای تایید release candidate انجام می‌شود.

## 10.2 مراحل

### Step 1: ورود و آماده‌سازی

```bash
ssh user@staging-server
cd /opt/app
```
### Step 2: دریافت آخرین compose/env

اگر compose file یا env روی سرور sync می‌شود، نسخه صحیح آن را قرار بده.

مثال:

```bash
git pull origin main
```
یا اگر repo روی سرور نگه‌داری نمی‌شود، فایل‌ها باید از pipeline یا artifact store تامین شوند.
### Step 3: تنظیم version

اگر از env برای image tag استفاده می‌شود:

```bash
export APP_VERSION=v1.4.2

یا در env file:

bash
APP_VERSION=v1.4.2
```
### Step 4: login به registry

در صورت نیاز:

```bash
docker login your-registry.example.com

### Step 5: pull imageها

bash
docker compose --env-file .env.staging pull

### Step 6: اجرای migrationها

اگر migration runner جداگانه دارید:

bash
docker compose --env-file .env.staging run --rm backend npm run migration:run

یا:

bash
docker compose --env-file .env.staging exec backend npm run migration:run

**قاعده:**  
برای migrationها اجرای `run --rm` معمولاً امن‌تر و واضح‌تر است، چون وابسته به وضعیت container قدیمی backend نیست.
```
### Step 7: بالا آوردن سرویس‌ها

```bash
docker compose --env-file .env.staging up -d

یا اگر فقط backend/frontend/nginx باید recreate شوند:

bash
docker compose --env-file .env.staging up -d --force-recreate backend frontend nginx

### Step 8: بررسی وضعیت

bash
docker compose ps

### Step 9: بررسی health و logs

bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
docker compose logs --tail=100 nginx

### Step 10: smoke test

نمونه تست‌ها:

bash
curl -I https://staging.example.com
curl -I https://staging.example.com/api/health
curl https://staging.example.com/api/health

اگر endpointهای readiness دارید، همان‌ها بررسی شوند.
```
## 10.3 تایید نهایی staging

موارد زیر باید OK باشند:

- [ ] سرویس‌ها running هستند.
- [ ] migrationها بدون خطا اجرا شده‌اند.
- [ ] backend health OK است.
- [ ] frontend قابل دسترس است.
- [ ] login flow کار می‌کند.
- [ ] critical admin flow کار می‌کند.
- [ ] لاگ‌ها error غیرمنتظره ندارند.

اگر همه‌چیز درست بود، همین build/tag کاندید production است.

---

## 11. Deploy به Production

## 11.1 قانون

production deploy فقط وقتی انجام می‌شود که:

- staging تایید شده باشد.
- backup گرفته شده باشد.
- release tag مشخص باشد.
- rollback plan آماده باشد.

## 11.2 مراحل

### Step 1: ورود به سرور production

```bash
ssh user@production-server
cd /opt/app

### Step 2: تایید version

bash
echo "$APP_VERSION"

یا env file را بررسی کن:

bash
grep APP_VERSION .env.production

باید نسخه دقیق release دیده شود.

### Step 3: بررسی وضعیت فعلی

bash
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs --tail=50 backend
docker compose --env-file .env.production logs --tail=50 nginx

### Step 4: گرفتن backup

bash
mkdir -p /opt/app/backups
timestamp=$(date +%F-%H%M%S)

docker compose --env-file .env.production exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  > "/opt/app/backups/prod-${timestamp}.sql"

در صورت نیاز:

bash
gzip "/opt/app/backups/prod-${timestamp}.sql"

### Step 5: pull imageهای release

bash
docker compose --env-file .env.production pull

### Step 6: اجرای migrationها

bash
docker compose --env-file .env.production run --rm backend npm run migration:run

اگر migration fail شد:

- deploy را ادامه نده.
- علت را مشخص کن.
- بر اساس وضعیت، rollback یا fix انجام بده.

### Step 7: deploy سرویس‌ها

bash
docker compose --env-file .env.production up -d

یا recreate هدفمند:

bash
docker compose --env-file .env.production up -d --force-recreate backend frontend nginx

### Step 8: بررسی وضعیت containerها

bash
docker compose --env-file .env.production ps

### Step 9: بررسی health

bash
curl -I https://example.com
curl -I https://example.com/api/health
curl https://example.com/api/health

### Step 10: بررسی logs

bash
docker compose --env-file .env.production logs --tail=100 backend
docker compose --env-file .env.production logs --tail=100 frontend
docker compose --env-file .env.production logs --tail=100 nginx
```
### Step 11: smoke test production

حداقل این flowها تست شوند:

- [ ] homepage/public catalog
- [ ] login
- [ ] admin authenticated page
- [ ] create/update یک entity کم‌ریسک (در صورت امکان)
- [ ] media/static assets loading
- [ ] API health/readiness

---

## 12. Post-Deploy Verification

بعد از هر deploy، حداقل 10 تا 30 دقیقه مانیتورینگ کوتاه‌مدت انجام شود.

موارد قابل بررسی:

- error rate
- response time
- container restarts
- nginx upstream errors
- database connection saturation
- disk growth
- log anomalies

نمونه دستورات:

bash
docker compose ps
docker stats --no-stream
docker compose logs --since=10m backend
docker compose logs --since=10m nginx

---

## 13. Rollback Runbook

## 13.1 چه زمانی rollback کنیم؟

rollback فقط وقتی انجام شود که:

- سرویس اصلی بالا نمی‌آید.
- خطا بحرانی در login / checkout / admin core flow وجود دارد.
- health endpoint fail می‌شود.
- error rate یا crash loop غیرقابل قبول است.
- fix فوری و safe در چند دقیقه ممکن نیست.

اگر مشکل کوچک و قابل اصلاح سریع باشد، **roll-forward** ترجیح دارد.

---

## 13.2 Rollback اپلیکیشن

اگر schema هنوز با نسخه قبلی سازگار است:

### Step 1: version قبلی را تنظیم کن

مثلاً:

```bash
APP_VERSION=v1.4.1

یا env file را به نسخه قبلی برگردان.

### Step 2: image نسخه قبلی را pull کن

bash
docker compose --env-file .env.production pull

### Step 3: سرویس‌ها را با نسخه قبلی بالا بیاور

bash
docker compose --env-file .env.production up -d --force-recreate backend frontend nginx

### Step 4: health check

bash
curl -I https://example.com/api/health

### Step 5: logs را بررسی کن

bash
docker compose --env-file .env.production logs --tail=100 backend
```
---

## 13.3 Rollback دیتابیس

این مرحله فقط در شرایط خاص و با دقت بالا.

### هشدار

restore دیتابیس ممکن است باعث از دست رفتن داده‌های جدید بعد از deploy شود.

### پیش‌نیاز

- backup معتبر موجود باشد.
- تصمیم rollback توسط مسئول release تایید شود.
- در صورت امکان، اپلیکیشن موقتاً read-only یا offline شود.

### نمونه restore

ابتدا فایل backup را آماده کن، سپس:

```bash
gunzip -c /opt/app/backups/prod-YYYY-MM-DD-HHMMSS.sql.gz | \
docker compose --env-file .env.production exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

یا اگر لازم است database recreate شود، بسته به سیاست پروژه باید runbook جداگانه و کنترل‌شده‌تری نوشته شود.  
برای production، restore destructive بدون procedure دقیق توصیه نمی‌شود.
```
---

## 14. Roll-Forward Runbook

اگر مشکل مشخص و fix سریع موجود است:

1. bugfix را روی branch مناسب اعمال کن.
2. image جدید بساز.
3. روی staging تایید کن.
4. patch release جدید بده:
   - مثال: `v1.4.3`
5. deploy مجدد به production.

**قاعده:**  
اگر rollback به دلیل schema یا data complexity پرریسک است، roll-forward معمولاً انتخاب بهتر است.

---

## 15. Failure Scenarios و اقدام پیشنهادی

## 15.1 Migration Fail شد

اقدام:

1. deploy را متوقف کن.
2. log migration را بررسی کن.
3. تایید کن که schema در چه وضعیتی مانده است.
4. اگر تغییری اعمال نشده:
   - fix migration
   - build جدید
   - redeploy
5. اگر بخشی از migration اعمال شده:
   - طبق strategy همان migration عمل کن:
     - manual fix
     - forward migration
     - یا restore backup

## 15.2 Backend بالا نمی‌آید

اقدام:

```bash
docker compose logs --tail=200 backend
docker compose ps

بررسی کن:

- env variables
- database connectivity
- missing migrations
- startup command
- image tag اشتباه

اگر سریع fix نشد و outage جدی است:
- rollback app version
```
## 15.3 Frontend بالا می‌آید ولی API fail است

اقدام:

- backend logs
- nginx upstream config
- CORS / proxy config
- health endpoint

اگر backend fail دارد:
- rollback backend
- اگر frontend وابسته به تغییر API جدید است، ممکن است نیاز به rollback هر دو باشد.

## 15.4 Nginx Misconfiguration

اقدام:

```bash
docker compose logs --tail=100 nginx
docker exec -it <nginx-container> nginx -t

در صورت config invalid:
- config قبلی را restore کن
- nginx را recreate/reload کن
```
---

## 16. دستورات مفید عملیاتی

### مشاهده وضعیت

```bash
docker compose ps
docker ps

### مشاهده logs

bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f postgres

### restart یک سرویس

bash
docker compose restart backend

### recreate یک سرویس

bash
docker compose up -d --force-recreate backend

### pull مجدد imageها

bash
docker compose pull

### اجرای shell داخل backend

bash
docker compose exec backend sh

### اجرای query روی postgres

bash
docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```
---

## 17. Cleanup بعد از Deploy

برای جلوگیری از پر شدن دیسک:

### پاک‌سازی imageهای بدون استفاده

```bash
docker image prune -f

### پاک‌سازی عمومی با احتیاط

bash
docker system prune -f
```
**هشدار:**  
دستورات prune را با احتیاط اجرا کن، مخصوصاً اگر build cache یا imageهای موردنیاز دیگری روی سرور وجود دارند.

### مدیریت backupهای قدیمی

- retention policy مشخص داشته باش:
  - مثلاً backup روزانه 7 روز
  - backup هفتگی 4 هفته
- حذف backupهای قدیمی فقط وقتی مجاز است که سیاست backup روشن باشد.

---

## 18. Definition of Success

یک deploy موفق است اگر:

- [ ] همه سرویس‌های اصلی running باشند.
- [ ] health endpointها سالم باشند.
- [ ] migrationها کامل و بدون ambiguity اعمال شده باشند.
- [ ] critical user flows کار کنند.
- [ ] لاگ‌ها خطای بحرانی نداشته باشند.
- [ ] نیازی به rollback یا hotfix فوری نباشد.

---

## 19. Definition of Incident

deploy به incident تبدیل می‌شود اگر یکی از موارد زیر رخ دهد:

- downtime معنادار
- از دست رفتن داده
- failure در login/admin/public core flows
- migration ناقص یا ناسازگار
- نیاز به rollback اضطراری

در این شرایط، بعد از کنترل وضعیت باید postmortem کوتاه ثبت شود:
- چه شد؟
- چرا شد؟
- چگونه حل شد؟
- چه guardrailی باید اضافه شود؟

---

## 20. چک‌لیست نهایی خیلی کوتاه

## Staging

- [ ] pull
- [ ] migrate
- [ ] up -d
- [ ] health check
- [ ] smoke test
- [ ] verify logs

## Production

- [ ] verify version
- [ ] backup
- [ ] pull
- [ ] migrate
- [ ] up -d
- [ ] health check
- [ ] smoke test
- [ ] monitor
- [ ] rollback if necessary