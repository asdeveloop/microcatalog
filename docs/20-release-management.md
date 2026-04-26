# Release Management Specification

## 1. هدف

این سند مدل Release Management برای این پروژه را تعریف می‌کند تا:

- فرآیند انتشار نسخه‌ها قابل تکرار، قابل ردیابی و قابل بازگشت باشد.
- هماهنگی بین backend, frontend, database و زیرساخت حفظ شود.
- ریسک تغییرات در محیط‌های `staging` و `production` کنترل شود.
- امکان توسعه موازی (feature branches)، تست و استقرار تدریجی فراهم شود.

این سند بیشتر روی **فرآیند و سیاست‌ها** تمرکز دارد تا ابزار خاص (Git provider, CI/CD vendor).

---

## 2. اصول کلیدی

1. **Release قابل ردیابی است**  
   هر نسخه‌ی منتشر شده باید:
   - `tag` مشخص در Git داشته باشد.
   - با نسخه اپلیکیشن (backend و frontend) و نسخه migration دیتابیس هم‌تراز باشد.

2. **Releaseها باید Automation-First باشند**  
   - Build, Test, Deploy تا حد ممکن خودکار (CI/CD).
   - کار دستی فقط برای approval و عملیات خاص (مثل rollback‌های پیچیده).

3. **Promotion از پایین به بالا**  
   - تغییرات ابتدا در `local` و `dev` تست می‌شوند.
   - سپس در `staging` با داده/پیکربندی شبیه production تست می‌شوند.
   - در نهایت به `production` promote می‌شوند، بدون باینری/ایمیج متفاوت.

4. **Schema First, Code Second**  
   - migration دیتابیس بخشی از release است و قبل یا در کنار deploy backend اجرا می‌شود.
   - تغییرات schema باید backward-compatible باشند (حساب‌شده).

5. **Release کوچک و متواتر**  
   - ترجیح با releaseهای کوچک‌تر ولی مداوم است.
   - جعبه تغییرات بزرگ فقط در صورت اجبار و با ریسک‌سنجی.

6. **هر Release قابل بازگشت است**  
   - استراتژی rollback (یا roll-forward) باید از قبل مشخص باشد.
   - نسخه قبلی و دیتای مرتبط باید قابل restore یا re-deploy باشد.

---

## 3. مدل Versioning

### 3.1 Naming

برای اپلیکیشن (monolith backend + frontend) از `Semantic Versioning` ساده شده استفاده می‌کنیم:

- قالب: `MAJOR.MINOR.PATCH`  
  مثال: `v1.3.0`

- معنی:
  - `MAJOR`: تغییرات breaking برای API public (یا تغییرات بزرگ معماری).
  - `MINOR`: feature جدید backward-compatible.
  - `PATCH`: bugfix یا تغییرات کوچک بدون تغییر در رفتار خارجی.

### 3.2 Scope نسخه

نسخه به صورت واحد برای کل سیستم در نظر گرفته می‌شود:

- **Backend version** = **Frontend version** = **Release version**  
  (برای MVP که monolith + یک frontend است).

این نسخه:

- در Git tag ثبت می‌شود: `v1.2.3`
- در backend به‌عنوان config/constant قابل مشاهده است (برای health endpoint).
- در frontend (مثلاً صفحه health یا footer internal) قابل مشاهده است (صرفاً برای internal).

### 3.3 هم‌ترازی با Migrationها

برای database:

- هر release باید با یک state مشخص از migrationها هماهنگ باشد.
- مطلوب است در backend:
  - `APP_VERSION` و `DB_SCHEMA_VERSION` (latest applied migration) قابل مشاهده باشد (health endpoint).
- در Release notes باید مشخص شود تا چه migrationی (اسم/شماره) انتظار می‌رود اعمال شده باشد.

---

## 4. Branching Strategy (Git)

### 4.1 Branchهای اصلی

پیشنهاد:

- `main` (یا `master`):
  - همیشه نماینده‌ی آخرین کد آماده production.
  - فقط از طریق **Pull Request** با review و CI green merge می‌شود.
- `develop` (اختیاری، بسته به تیم):
  - اگر تیم بزرگ شود، می‌تواند محل تجمیع featureها قبل از release به main باشد.
  - برای MVP کوچک می‌توان مستقیماً با `main` + feature branches کار کرد.

برای سادگی MVP، پیشنهاد:

- `main` = branch پایه.
- featureها روی `feature/*` توسعه و بعد از review به `main` merge می‌شوند.
- release با tag روی `main` انجام می‌شود.

### 4.2 Branchهای Feature

نام‌گذاری:

- `feature/auth-otp-flow`
- `feature/admin-product-create`
- `bugfix/category-slug-validation`

قوانین:

- هر feature branch:
  - از `main` (یا `develop` اگر استفاده شود) منشعب می‌شود.
  - با PR و حداقل یک reviewer merge می‌شود.
  - قبل از merge باید:
    - تست‌های خودکار (unit/integration/backend/frontend) پاس شوند.
    - migrations مرتبط بررسی شوند.

### 4.3 Hotfix Branches

برای مشکلات production:

- branch: `hotfix/v1.2.1-fix-login`
- از آخرین tag production (مثلاً `v1.2.0`) منشعب می‌شود.
- پس از رفع مشکل:
  - اول روی `main` merge می‌شود.
  - سپس tag جدید `v1.2.1` ساخته و deploy می‌شود.

---

## 5. Release Pipeline (End-to-End Flow)

### 5.1 Flow کلی

1. توسعه feature روی `feature/*`.
2. Merge به `main` پس از review + CI green.
3. Build اتوماتیک در CI (build images, run tests).
4. Deploy اتوماتیک/نیمه‌اتوماتیک به `staging`.
5. Testing در `staging` (QA / UAT).
6. تصمیم release:
   - ثبت tag روی commit `main` (مثلاً `v1.0.0`).
7. Build images production-tagged (یا reuse همان artifact).
8. Deploy به `production` از روی tag.
9. مانیتور health و metrics بعد از release.
10. در صورت مشکل:
    - apply hotfix یا rollback.

### 5.2 Release Candidate در Staging

برای هر انتشار:

- قبل از tag کردن:
  - آخرین commit `main` روی `staging` deploy می‌شود.
  - این commit کاندید release است.
- اگر تست‌ها OK:
  - روی همان commit، tag `vX.Y.Z` زده می‌شود.
  - همان artifact (images) برای production استفاده می‌شود.

---

## 6. هماهنگی Backend, Frontend, Database

### 6.1 Migration Sequence

برای releaseهایی که migration دارند:

1. **Pre-release**:
   - migrations در repo اضافه شده‌اند.
   - CI روی نسخه جدید migration اجرا و تست‌ها را پاس می‌کند.

2. **Staging Deployment**:
   - روی staging:
     - `docker-compose` یا ابزار CI:
       - ابتدا migrations را اجرا می‌کند.
       - سپس backend image را به version جدید می‌برد.
       - frontend image را هم sync می‌کند.

3. **Production Deployment**:
   - sequence مشابه staging:
     1. Database backup (اجباری).
     2. اجرای migrations (در صورت امکان online و بدون downtime).
     3. Deploy backend.
     4. Deploy frontend.

### 6.2 Backward Compatibility

قوانین برای releaseهایی با تغییر schema:

- مرحله 1: اضافه کردن ستون جدید / جدول جدید بدون حذف یا تغییر ستون‌های قدیمی (additive).
- مرحله 2: backend و frontend تغییرات را consume می‌کنند.
- در release بعدی (یا بعد از مدتی):
  - ستون‌های قدیمی که دیگر استفاده نمی‌شوند حذف می‌شوند.

هدف: امکان **roll-forward** و جلوگیری از rollback پیچیده migrationها.

---

## 7. Release Types

### 7.1 Regular Release

Release عادی (feature + bugfix):

- نسخه: `1.1.0` یا `1.1.1`
- شامل:
  - کد backend.
  - کد frontend.
  - migrations (اگر نیاز).
- مسیر:
  - feature branches → main → staging → tag → production.

### 7.2 Hotfix Release

Release سریع برای production:

- نسخه: `1.1.2` (Patch).
- فقط bugfix یا config fix.
- مسیر:
  - hotfix branch ← tag قبلی
  - develop & main sync (اگر develop داریم).
  - staging تست کوتاه.
  - tag و deploy به production.

### 7.3 Infrastructure-only Release

اگر تغییری فقط در docker-compose، Nginx config یا env انجام شود:

- می‌توان همان نسخه اپلیکیشن را نگه داشت ولی:
  - در release notes ثبت می‌شود که infra تغییر کرده.
- ترجیحاً حتی برای infra-only:
  - یک patch version جدید (مثلاً `1.1.3`) با تغییری کوچک در کد/metadata ایجاد شود تا traceability حفظ شود.

---

## 8. CI/CD Requirements

### 8.1 CI: Checks

روی هر PR و commit به `main`:

- Build backend
- Run backend tests
- Build frontend
- Run frontend tests
- Run lint/format checks
- (در صورت امکان) run migrations against test DB و اجرای testها

Fail هر مرحله = عدم اجازه merge.

### 8.2 CD: Environments

حداقل دو محیط:

- `staging`
- `production`

پیشنهاد:

- Push به `main`:
  - trigger deployment به `staging`.
- Tag `vX.Y.Z`:
  - trigger deployment به `production`.

### 8.3 Release Artifacts

Artifacts build شده:

- Backend image:
  - `backend:<git-sha>` + `backend:vX.Y.Z`
- Frontend image:
  - `frontend:<git-sha>` + `frontend:vX.Y.Z`

در Compose production به نسخه tag شده اشاره می‌کنیم، نه `latest`.

---

## 9. Release Checklist

### 9.1 Pre-Release (برای staging)

1. [ ] همه PRهای مربوط به release در `main` merge شده‌اند.
2. [ ] CI روی `main` سبز است.
3. [ ] migrationها بررسی و تایید شده‌اند.
4. [ ] `.env.staging` با نسخه جدید سازگار است.
5. [ ] feature flags (اگر وجود دارد) تنظیم شده‌اند.

### 9.2 Staging Verification

1. [ ] deployment به staging کامل شده است.
2. [ ] health check backend/DB OK.
3. [ ] critical user flows (login, admin create product, public catalog) تست شده‌اند.
4. [ ] لاگ‌ها بدون error بحرانی است.
5. [ ] metrics (اگر داریم) نرمال است.

### 9.3 Production Release

1. [ ] روی commit تایید شده در `main` tag `vX.Y.Z` ایجاد شده است.
2. [ ] backup دیتابیس production گرفته شده است.
3. [ ] rollout plan و rollback plan مشخص است.
4. [ ] window زمانی release با تیم (در صورت وجود) هماهنگ شده است.
5. [ ] deployment production انجام شده است:
   - [ ] migrations اجرا شده‌اند.
   - [ ] backend/ frontend با نسخه جدید بالا آمده‌اند.
6. [ ] health check و smoke test بعد از release انجام شده است.

---

## 10. Rollback / Roll-Forward Strategy

### 10.1 Rollback App Version

اگر بعد از release مشکل جدی رخ دهد:

- سریع‌ترین گزینه:
  - re-deploy نسخه قبلی:
    - backend image قبلی: `backend:vPrev`
    - frontend image قبلی: `frontend:vPrev`

پیش‌نیاز:
- تغییرات schema breaking رخ نداده باشد، یا schema هنوز با کد قبلی سازگار باشد.

### 10.2 Rollback Database

rollback دیتابیس بسیار حساس است.

- ترجیح: **roll-forward** و fix سریع در نسخه جدید.
- اگر rollout migrationی بوده که backward incompatible است:
  - design باید تا جای ممکن از migrationهای destructive بپرهیزد.
  - اگر مجبور به destructive change هستیم:
    - قبل از release:
      - backup کامل DB.
    - در صورت نیاز rollback:
      - restore backup (با downtime کنترل‌شده).
      - re-deploy نسخه قبلی backend/frontend.

### 10.3 Feature Flags (Optional)

برای تغییرات پرریسک UI/feature:

- اگر ابزار آن فراهم باشد:
  - feature را behind a flag استقرار دهید.
  - در صورت مشکل:
    - فقط flag را خاموش کنید، بدون rollback نسخه.

---

## 11. Release Notes

برای هر Release `vX.Y.Z` باید Release Notes حداقل شامل موارد زیر باشد:

- تاریخ release.
- محیط هدف: staging / production.
- تغییرات اصلی:
  - Features
  - Bugfixes
  - Infra changes
- Migrationها:
  - لیست فایل migration‌های اعمال‌شده.
- Known Issues:
  - مشکلات شناخته‌شده و workaroundها.
- Links:
  - PRهای مرتبط.
  - Tickets (اگر issue tracker استفاده می‌شود).

فرمت ذخیره‌سازی (مثال):

- `docs/releases/v1.0.0.md`

---

## 12. Environment-specific Policies

### 12.1 Staging

- همیشه نزدیک‌ترین نسخه به production.
- داده تست (غیرحساس)؛ ممکن است reset شود.
- استفاده برای:
  - QA، UAT، performance ساده.

سیاست:

- deployment به staging می‌تواند خودکار روی هر commit `main` باشد.
- اگر تیم ترجیح دهد: staged deployment فقط روی PR خاص یا tag RC.

### 12.2 Production

- محیط حساس، داده واقعی.
- deployment:
  - کنترل‌شده.
  - حتماً همراه با checklist قبل و بعد از release.
- امکان:
  - deployment خارج از ساعات شلوغ (در صورت نیاز).

---

## 13. Release Calendar و Cadence

برای MVP:

- تا قبل از launch:
  - releases سریع (مثلاً هفته‌ای ۲–۳ بار) به staging و متناوب به production (قبل از go-live واقعی).
- بعد از launch:
  - cadence پیشنهادی:
    - یک release minor/patch پایدار در هفته یا هر دو هفته.
    - hotfixها در صورت نیاز.

هدف: تعادل بین سرعت تحویل و ثبات.

---

## 14. نقش‌ها و مسئولیت‌ها (در صورت وجود تیم)

در تیم کوچک، ممکن است همه نقش‌ها بر دوش یک نفر یا دو نفر باشد، ولی مدل کلی:

- **Developer**:
  - توسعه feature.
  - نوشتن tests.
  - آماده‌سازی migrationها.
  - شرکت در code review.

- **Reviewer**:
  - بازبینی کد.
  - بررسی تاثیر تغییرات روی API/DB/infra.

- **Release Owner** (per release):
  - هماهنگی release.
  - تکمیل release checklist.
  - تصمیم‌گیری برای go/no-go در production (در تیم کوچک: خود developer/ops).

- **Ops / DevOps** (اگر جدا باشد):
  - نگهداری pipeline CI/CD.
  - نگهداری backup، monitoring، logging.
  - همراهی در deployment و rollback.

---

## 15. Definition of Done برای یک Release

یک Release وقتی "Done" است که:

1. [ ] کد backend و frontend در `main` merge شده‌اند.
2. [ ] CI (build + test) سبز است.
3. [ ] migrations طراحی، review و test شده‌اند.
4. [ ] release در `staging` deploy و تست شده است (smoke + critical flows).
5. [ ] tag `vX.Y.Z` ساخته شده است.
6. [ ] images/artefacts با tag version موجود هستند.
7. [ ] release به `production` deploy شده است.
8. [ ] health checks و smoke tests بعد از release موفق بوده‌اند.
9. [ ] release notes نوشته و ذخیره شده است.
10. [ ] در صورت وجود مشکل، action items برای fix یا hardening ثبت شده است.

---

## 16. قانون نهایی

هر تغییری که نتوان:

- آن را به‌صورت reproducible build کرد،
- مسیر promotion آن را از dev → staging → production شرح داد،
- و در صورت مشکل آن را rollback یا roll-forward کرد،

طبق این سند، **Release قابل قبول** محسوب نمی‌شود و نباید به production برسد.
