# Product Charter

## Product Name

Micro Catalog Platform

---

## Problem Statement

بسیاری از کسب‌وکارهای کوچک برای داشتن حضور آنلاین، یا مجبور به استفاده از ابزارهای بسیار پیچیده و گران هستند، یا به راهکارهای غیرساختاریافته مثل شبکه‌های اجتماعی متکی می‌شوند.

مسئله اصلی این است که این کسب‌وکارها به یک ابزار ساده، سریع، کم‌هزینه و mobile-friendly نیاز دارند که فقط نیاز اصلی آن‌ها را پوشش دهد:

- معرفی فروشگاه
- نمایش محصولات
- اشتراک‌گذاری لینک فروشگاه
- دریافت استعلام از مشتری

---

## Product Goal

ساخت ساده‌ترین و قابل‌اتکاترین storefront برای SMBها با تمرکز روی:

- سرعت راه‌اندازی
- سادگی استفاده
- پایداری
- عملکرد مناسب روی موبایل
- هزینه عملیاتی پایین

---

## Target Users

### Primary Users
- فروشگاه‌های کوچک
- فروشندگان اینستاگرامی
- کسب‌وکارهای محلی
- فروشنده‌هایی که نیاز به storefront ساده دارند

### Secondary Users
- مشتریانی که storefront را مشاهده می‌کنند
- اپراتور یا ادمین پشتیبانی سیستم

---

## Core User Journey

1. کاربر با شماره موبایل وارد می‌شود
2. فروشگاه خود را ایجاد می‌کند
3. محصولات را اضافه می‌کند
4. تصاویر محصول را آپلود می‌کند
5. محصولات را منتشر می‌کند
6. لینک storefront را با مشتریان به اشتراک می‌گذارد
7. مشتری storefront را مشاهده می‌کند و برای خرید/استعلام با فروشنده ارتباط می‌گیرد

---

## MVP Scope

### Included
- auth با OTP
- merchant profile
- product CRUD
- media upload
- publish/unpublish
- storefront public page
- basic SEO metadata
- mobile responsive UI
- Persian + RTL support

### Excluded
- cart
- checkout
- payment
- order lifecycle
- inventory sync
- coupon/discount engine
- marketplace search
- chat system
- analytics advanced

---

## Product Success Criteria

### Activation
- merchant بتواند در کمتر از 10 دقیقه storefront خود را بسازد

### Performance
- storefront روی موبایل و اینترنت متوسط سریع لود شود

### Reliability
- publish/update product flow پایدار باشد

### Usability
- UI فارسی و ساده باشد
- کاربر بدون آموزش پیچیده بتواند از محصول استفاده کند

---

## Product Principles

- fast time-to-value
- simplicity scales
- reliability first
- mobile-first UX
- low support overhead
- no unnecessary enterprise complexity

---

## Risks

- پیچیده شدن scope
- وابستگی زیاد به external providers
- performance ضعیف روی موبایل
- UX نامناسب برای RTL
- media pipeline ناپایدار
- auth abuse via OTP

---

## Scope Control Rules

هر feature جدید فقط زمانی پذیرفته می‌شود که:

- مستقیماً activation را بهتر کند
- هزینه عملیاتی را زیاد نکند
- complexity معماری را بالا نبرد
- با non-goalهای محصول تضاد نداشته باشد
