# Database Design

## Purpose

این سند مدل داده سطح‌بالا، قواعد schema و سیاست migration را مشخص می‌کند.

---

## Database Choice

- `PostgreSQL` as source of truth

---

## Design Principles

- normalized where practical
- explicit ownership per table
- timestamps on all core entities
- soft delete only where justified
- indexes based on query patterns
- no hidden magic in ORM
- migration-first schema evolution

---

## Core Tables

### merchants
اطلاعات فروشنده

Suggested fields:
- `id`
- `phone`
- `display_name`
- `slug`
- `bio`
- `status`
- `created_at`
- `updated_at`

---

### merchant_settings
تنظیمات storefront

Suggested fields:
- `merchant_id`
- `theme`
- `contact_phone`
- `contact_whatsapp`
- `address`
- `location_lat`
- `location_lng`
- `created_at`
- `updated_at`

---

### otp_challenges
چالش‌های OTP

Suggested fields:
- `id`
- `phone`
- `otp_hash`
- `expires_at`
- `attempt_count`
- `max_attempts`
- `consumed_at`
- `created_at`

---

### sessions
sessionهای لاگین

Suggested fields:
- `id`
- `merchant_id`
- `token_hash`
- `user_agent`
- `ip_address`
- `last_seen_at`
- `expires_at`
- `revoked_at`
- `created_at`

---

### products
محصولات فروشنده

Suggested fields:
- `id`
- `merchant_id`
- `title`
- `slug`
- `description`
- `price_text`
- `status`
- `published_at`
- `archived_at`
- `created_at`
- `updated_at`

---

### product_status_history
تاریخچه تغییر وضعیت محصول

Suggested fields:
- `id`
- `product_id`
- `from_status`
- `to_status`
- `changed_by`
- `created_at`

---

### media_upload_sessions
sessionهای آپلود فایل

Suggested fields:
- `id`
- `merchant_id`
- `object_key`
- `mime_type`
- `expected_size`
- `status`
- `expires_at`
- `created_at`
- `completed_at`

---

### media_objects
رکورد فایل‌های media

Suggested fields:
- `id`
- `merchant_id`
- `upload_session_id`
- `object_key`
- `mime_type`
- `size_bytes`
- `width`
- `height`
- `status`
- `created_at`
- `validated_at`
- `deleted_at`

---

### product_media
اتصال محصول به media

Suggested fields:
- `id`
- `product_id`
- `media_id`
- `sort_order`
- `created_at`

---

### audit_events
رخدادهای audit

Suggested fields:
- `id`
- `actor_id`
- `actor_type`
- `event_type`
- `entity_type`
- `entity_id`
- `payload_json`
- `created_at`

---

## Product Status Enum

draft
published
archived

---

## Media Status Enum

text
pending_upload
uploaded
validated
attached
failed
deleted

---

## Indexing Guidelines

حداقل indexها:

- `merchants(phone)` unique
- `merchants(slug)` unique
- `sessions(merchant_id)`
- `sessions(expires_at)`
- `products(merchant_id, status)`
- `products(slug)`
- `media_objects(merchant_id)`
- `media_objects(status)`
- `otp_challenges(phone, created_at)`

---

## Constraints

- phone باید normalized باشد
- slug باید unique و URL-safe باشد
- session token فقط به‌صورت hash ذخیره شود
- OTP فقط به‌صورت hash ذخیره شود
- media attachment فقط برای merchant owner مجاز است
- product ownership باید enforce شود

---

## Migration Policy

### Rules
- all schema changes through migrations
- forward-only preferred
- destructive changes require multi-step rollout
- every migration must be reviewable
- rollback plan required for risky change

### Safe Change Pattern
1. add new column/table
2. deploy compatible code
3. backfill
4. switch reads/writes
5. cleanup old structure later

---

## Backup Requirements

- regular PostgreSQL dump
- restore test mandatory
- retention policy defined
- encrypted backup storage preferred

---

## Non-Goals

- advanced reporting warehouse
- event sourcing
- multi-tenant partition strategy in phase 1


---
