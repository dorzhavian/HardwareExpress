#  Database Schema – HardwareExpress (Updated)

**Database:** PostgreSQL (Supabase)  
**UUIDs:** gen_random_uuid()  
**Enums:** PostgreSQL ENUM types  
**Security:** Passwords stored as hashed values (password_hash)

---

##  Extensions

create extension if not exists pgcrypto;
```

---

##  users

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

##  catalog_items

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

##  orders

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

##  order_items

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

##  logs

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