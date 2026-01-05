# 📦 Database Schema – HardwareExpress (Updated)

מסד הנתונים נבנה עבור מערכת להזמנת ציוד מחשבים ארגונית, עם ניהול משתמשים, הזמנות, קטלוג, לוגים + ניתוח AI ללוגים.

**Database:** PostgreSQL (Supabase)  
**UUIDs:** gen_random_uuid()  
**Enums:** PostgreSQL ENUM types  
**Indexes:** B-tree  
**Security:** Passwords stored as hashed values (password_hash)

---

## 🧩 Extensions

### pgcrypto
משמש ליצירת UUID ברמת ה־DB באמצעות `gen_random_uuid()`.

```sql
create extension if not exists pgcrypto;
```

---

## 🧑‍💼 users

| Column | Type | Nullable | Default |
|------|------|----------|---------|
| user_id | uuid | NO | gen_random_uuid() |
| full_name | text | NO | |
| email | text | NO | |
| password_hash | text | NO | |
| department | text | YES | |
| role | user_role_enum | NO | |
| created_at | timestamp | YES | now() |

Primary Key: user_id  
Indexes: users_pkey, users_email_key (UNIQUE)

---

## 📦 catalog_items

| Column | Type | Nullable | Default |
|------|------|----------|---------|
| item_id | uuid | NO | gen_random_uuid() |
| item_name | text | NO | |
| quantity | integer | NO | |
| price | integer | NO | |
| category | item_category_enum | NO | |
| description | text | YES | |
| specification | text | YES | |
| image_url | text | YES | |
| in_stock | boolean | YES | |

Primary Key: item_id  
Indexes: catalog_items_pkey

---

## 🛒 orders

| Column | Type | Nullable | Default |
|------|------|----------|---------|
| order_id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | |
| total_price | integer | NO | |
| justify_msg | text | YES | |
| is_active | boolean | YES | true |
| status | order_status_enum | YES | pending |
| created_at | timestamp | YES | now() |

Primary Key: order_id  
Foreign Key: user_id → users(user_id)

---

## 📑 order_items

| Column | Type | Nullable | Default |
|------|------|----------|---------|
| order_id | uuid | NO | |
| item_id | uuid | NO | |
| item_name | text | NO | |
| quantity | integer | NO | |
| price | integer | NO | |
| category | item_category_enum | YES | |

Primary Key: (order_id, item_id)  
Foreign Keys:  
- order_id → orders(order_id)  
- item_id → catalog_items(item_id)

---

## 🧾 logs

| Column | Type | Nullable | Default |
|------|------|----------|---------|
| log_id | uuid | NO | gen_random_uuid() |
| timestamp | timestamp | YES | now() |
| user_id | uuid | YES | |
| user_role | user_role_enum | YES | |
| action | log_action_enum | NO | |
| resource | log_resource_enum | NO | |
| status | log_status_enum | NO | |
| ip_address | text | YES | |
| description | text | YES | |
| severity | log_severity_enum | NO | |

Primary Key: log_id

---

## 🤖 logs_ai
תוצאות ניתוח AI לכל לוג (anomaly detection וכו׳).  
הטבלה מקושרת ל־`logs` באמצעות `log_id`, ומאפשרת לשמור תוצאות מודל (score/label), סיכום, ו־raw output (JSON) מבלי “ללכלך” את הלוג המקורי.

| Column | Type | Nullable | Default |
|------|------|----------|---------|
| ai_id | uuid | NO | gen_random_uuid() |
| log_id | uuid | NO | |
| model_name | text | NO | |
| label | text | NO | |
| score | float4 | NO | |
| threshold | float4 | NO | |
| is_suspicious | boolean | NO | |
| ai_summary | text | YES | |
| raw | jsonb | YES | |
| created_at | timestamptz | NO | now() |

Primary Key: ai_id  
Foreign Key: log_id → logs(log_id)  
Indexes: logs_ai_pkey

**Recommended indexes (optional but useful):**
- UNIQUE(log_id, model_name) — למניעת ניתוח כפול של אותו לוג עם אותו מודל.
- (is_suspicious, created_at DESC) — שליפה מהירה של התרעות/אירועים חשודים האחרונים.

---

## 🔐 ENUM Types

### user_role_enum
- admin
- procurement_manager
- employee

### item_category_enum
- Laptops
- Monitors
- Peripherals
- Printers
- Components
- Storage

### order_status_enum
- pending
- approved
- rejected
- completed

### log_action_enum
- login
- logout
- create
- update
- delete
- approve

### log_resource_enum
- user
- order
- item
- auth

### log_status_enum
- success
- failure

### log_severity_enum
- low
- medium
- high
- critical
