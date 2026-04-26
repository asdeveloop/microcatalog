# Executive Summary

## Purpose

این پروژه یک **mobile-first micro-catalog platform** برای کسب‌وکارهای کوچک است که به آن‌ها اجازه می‌دهد بدون پیچیدگی marketplace یا ecommerce enterprise، یک ویترین آنلاین سبک، سریع و قابل‌اتکا داشته باشند.

هدف این پروژه ارائه یک محصول production-grade است که:

- روی VPS قابل استقرار باشد
- حداقل وابستگی خارجی داشته باشد
- برای کاربران فارسی‌زبان و RTL مناسب باشد
- روی موبایل، مخصوصاً Android، عملکرد خوبی داشته باشد
- از نظر مهندسی، maintainable، secure و scalable باشد

---

## Product Scope

نسخه اولیه سیستم شامل موارد زیر است:

- ورود و احراز هویت با شماره موبایل
- ایجاد و مدیریت فروشگاه
- ایجاد، ویرایش، انتشار و آرشیو محصول
- آپلود و مدیریت تصویر محصول
- نمایش storefront عمومی
- دریافت استعلام یا راه ارتباطی با فروشنده

---

## Explicit Non-Goals

این پروژه در فاز فعلی شامل موارد زیر نیست:

- marketplace
- cart
- online payment
- order management
- ERP/inventory پیچیده
- recommendation engine
- plugin ecosystem
- multi-service distributed architecture

---

## Technical Direction

معماری پیشنهادی:

- Frontend: `Next.js` + `TypeScript` + `Tailwind CSS`
- Backend: `NestJS` + `TypeScript`
- Database: `PostgreSQL`
- ORM / Query Layer: `Drizzle ORM`
- Object Storage: `MinIO`
- Deployment: `Docker Compose` روی VPS
- Reverse Proxy: `Caddy` یا `Nginx`

---

## Architecture Style

سیستم به‌صورت `modular monolith` طراحی می‌شود تا:

- complexity پایین بماند
- deploy ساده باشد
- توسعه سریع‌تر انجام شود
- نگهداری و debug ساده‌تر باشد
- در آینده امکان scale عمودی و افقی محدود فراهم باشد

---

## Product Principles

- reliability over feature breadth
- mobile-first by default
- Persian/RTL first-class support
- low operational overhead
- secure by default
- minimal dependency surface
- clean architecture and clear ownership

---

## Production Constraints

این سیستم باید برای شرایط اجرایی ایران مناسب باشد:

- قابل استقرار روی VPS داخلی یا خارجی
- حداقل وابستگی به سرویس‌های پرریسک خارجی
- پشتیبانی از SMS providerهای داخلی
- فونت self-hosted
- performance قابل‌قبول روی اینترنت ناپایدار
- SEO فارسی
- تحمل degraded mode در اختلال dependencyهای خارجی

---

## Delivery Outcome

خروجی مورد انتظار این پروژه:

- یک backend production-grade
- یک frontend mobile-first و RTL-ready
- استقرار reproducible
- observability پایه
- security baseline مشخص
- مستندات کامل برای توسعه، استقرار و عملیات
