## ROADMAP — Project Repository Baseline (P0)

**Objective:** ایجاد baseline مهندسی پایدار برای backend، frontend و deployment assets

---

### Step 1: Repository Structure & Root Config (S)
- **Files:** `package.json`, `.gitignore`, `.editorconfig`, `README.md`, `tsconfig.base.json`
- **Acceptance:** root structure مطابق architecture، package manager مشخص، base configs آماده
- **Size:** S

### Step 2: Backend Module Structure (M)
- **Files:** `apps/backend/package.json`, `apps/backend/tsconfig.json`, `apps/backend/src/main.ts`, `apps/backend/.env.example`
- **Acceptance:** backend module با NestJS bootstrap می‌شود، env structure تعریف شده
- **Size:** M

### Step 3: Frontend Module Structure (M)
- **Files:** `apps/frontend/package.json`, `apps/frontend/tsconfig.json`, `apps/frontend/src/main.tsx`, `apps/frontend/.env.example`
- **Acceptance:** frontend module با React/Vite bootstrap می‌شود
- **Size:** M

### Step 4: Shared Packages Structure (S)
- **Files:** `packages/shared-types/package.json`, `packages/shared-utils/package.json`
- **Acceptance:** shared packages قابل import در backend و frontend
- **Size:** S

### Step 5: Lint, Format & Test Scripts (M)
- **Files:** `.eslintrc.js`, `.prettierrc`, `jest.config.js`, root `package.json` scripts
- **Acceptance:** `npm run lint`, `npm run format`, `npm run test` اجرا می‌شوند
- **Size:** M

### Step 6: Docker & Deployment Baseline (M)
- **Files:** `docker-compose.yml`, `Dockerfile.backend`, `Dockerfile.frontend`, `.dockerignore`
- **Acceptance:** backend و frontend با docker-compose بالا می‌آیند
- **Size:** M

### Step 7: CI Placeholder & Branch Convention (S)
- **Files:** `.github/workflows/ci.yml`, `CONTRIBUTING.md`
- **Acceptance:** CI workflow تعریف شده، branch/review conventions مستند
- **Size:** S

### Step 8: Documentation Folder & Final README (S)
- **Files:** `docs/README.md`, root `README.md` update
- **Acceptance:** documentation structure آماده، README کامل با دستورات نصب و اجرا
- **Size:** S

---

**Total:** 8 steps | مطابق `17-backlog-mvp.md` — Task 3.1
