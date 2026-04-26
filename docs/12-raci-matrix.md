# RACI Matrix

## Purpose

این سند مسئولیت نقش‌ها را برای تصمیم‌گیری، اجرا و عملیات مشخص می‌کند.

---

## Roles

- `Product Manager`
- `Tech Lead`
- `Backend Engineer`
- `Frontend Engineer`
- `Platform/DevOps`
- `QA`
- `Security Owner`

---

## Legend

- `R` = Responsible
- `A` = Accountable
- `C` = Consulted
- `I` = Informed

---

## Product Scope and Prioritization

| Area | PM | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|
| Scope definition | A | C | I | I | I | I | I |
| MVP prioritization | A | C | I | I | I | I | I |
| Non-goal enforcement | A | C | I | I | I | I | I |

---

## Architecture and Technical Decisions

| Area | PM | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|
| System architecture | I | A | R | R | C | I | C |
| Module boundaries | I | A | R | I | I | I | C |
| External dependency approval | I | A | C | C | C | I | C |
| DB change policy | I | A | R | I | C | C | C |

---

## Backend Delivery

| Area | PM | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|
| Auth module | I | A | R | I | I | C | C |
| Product module | I | A | R | I | I | C | I |
| Media module | I | A | R | C | C | C | C |
| Storefront API | I | A | R | C | I | C | I |

---

## Frontend Delivery

| Area | PM | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|
| Merchant dashboard | I | C | C | A/R | I | C | I |
| Public storefront | I | C | C | A/R | I | C | I |
| RTL / Persian UX | C | I | I | A/R | I | C | I |

---

## Security and Compliance

| Area | PM | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|
| OTP security policy | I | A | R | I | I | C | C |
| Session security | I | A | R | I | I | C | C |
| Secret management | I | C | I | I | R | I | A |
| Security review | I | C | C | C | C | I | A/R |

---

## Deployment and Operations

| Area | PM | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|
| CI/CD | I | C | I | I | A/R | C | I |
| Production deployment | I | C | I | I | A/R | C | I |
| Backup/restore | I | I | I | I | A/R | C | C |
| Monitoring and alerting | I | C | C | I | A/R | C | C |
| Incident coordination | I | A | R | R | R | C | C |

---

## Quality Assurance

| Area | PM | Tech Lead | Backend | Frontend | DevOps | QA | Security |
|---|---|---|---|---|---|---|---|
| Test strategy | I | C | C | C | I | A/R | I |
| Regression validation | I | I | C | C | I | A/R | I |
| Release signoff input | I | C | C | C | C | A/R | C |

---

## Operational Rule

برای هر area باید دقیقاً یک `A` وجود داشته باشد.  
اگر area بدون `A` باشد، تصمیم‌گیری و پاسخ‌گویی مبهم خواهد شد.
