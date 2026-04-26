# Frontend Architecture

## Purpose

این سند معماری frontend را برای merchant dashboard و storefront عمومی مشخص می‌کند.

---

## Technology Stack

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `React Query` یا `SWR`
- `Zod`
- self-hosted Persian fonts

---

## Frontend Goals

- mobile-first
- fast on low-end Android devices
- Persian-first UX
- full RTL support
- SEO-friendly public pages
- predictable state handling
- low bundle size

---

## Primary Surfaces

### Merchant Dashboard
- login
- onboarding
- store settings
- product management
- media management

### Public Storefront
- merchant public page
- product list
- product details
- contact / inquiry CTA

---

## Rendering Strategy

### Public Pages
ترجیحاً:
- SSR یا static where possible
- SEO metadata server-rendered
- optimized HTML for Persian content

### Dashboard
- authenticated app
- CSR acceptable
- partial SSR optional for shell

---

## UI/UX Principles

- touch-friendly controls
- large tappable targets
- minimal navigation depth
- Persian labels and copy
- low cognitive load
- clear empty/loading/error states
- no desktop-first assumptions

---

## RTL Rules

- `dir="rtl"` در layout
- spacing و icon direction باید RTL-aware باشد
- inputهایی مثل phone number باید درست نمایش داده شوند
- mixed Persian/English text cases باید تست شوند

---

## Performance Rules

- self-hosted fonts
- image optimization
- route-level code splitting
- avoid heavy component libraries
- avoid unnecessary hydration
- minimal client JS for public pages

---

## State Management

### Server State
- use `React Query` or `SWR`

### Local UI State
- React state
- avoid global state unless necessary

### Auth State
- derived from server session
- do not keep sensitive auth state in local storage

---

## API Consumption Rules

- all API calls through shared client layer
- typed request/response contracts
- unified error mapping
- retry only on safe and idempotent cases

---

## Design System Rules

- typography optimized for Persian
- spacing scale consistent
- forms standardized
- buttons standardized
- error/success banners standardized
- loading skeletons for key pages

---

## Accessibility Baseline

- readable contrast
- keyboard-accessible forms where applicable
- semantic HTML
- clear focus states
- proper form labels
- screen-reader friendly main flows

---

## Frontend Folder Structure

src/
  app/
  components/
  features/
auth/
merchant/
product/
storefront/
  lib/
api/
config/
utils/
validation/
  styles/

---

## Non-Goals

- native mobile app in first phase
- complex offline-first architecture
- client-heavy dashboard framework
- animation-heavy UI


---
