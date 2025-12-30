# Mock Data Usage Analysis

## Overview
This document lists all places where `mockData.ts` is used in the frontend codebase, which need to be replaced with real HTTP API calls.

---

## Direct Imports from `mockData.ts`

### 1. `src/services/api.ts`
**File:** `src/services/api.ts`  
**Imports:**
- `mockUsers` - Used in `authApi.login()`, `usersApi.getAll()`, `usersApi.getById()`, `usersApi.create()`, `usersApi.update()`, `usersApi.delete()`
- `mockEquipment` - Used in `equipmentApi.getAll()`, `equipmentApi.getById()`, `equipmentApi.getByCategory()`, `equipmentApi.search()`
- `mockOrders` - Used in `ordersApi.getAll()`, `ordersApi.getByUserId()`, `ordersApi.getById()`, `ordersApi.create()`, `ordersApi.updateStatus()`
- `mockDashboardStats` - Used in `dashboardApi.getStats()`, `dashboardApi.getRecentOrders()`

**Status:** This entire file needs to be replaced with real HTTP API calls using Axios/Fetch.

### 2. `src/pages/Equipment.tsx`
**File:** `src/pages/Equipment.tsx`  
**Imports:**
- `equipmentCategories` - Used for category filter buttons (line 6, 88)

**Status:** Categories should be fetched from API or derived from equipment data.

---

## Indirect Usage via `api.ts`

All the following files use mock data indirectly through the `api.ts` service:

### 3. `src/context/AuthContext.tsx`
**File:** `src/context/AuthContext.tsx`  
**Usage:**
- `authApi.login()` - Line 23
- `authApi.logout()` - Line 37

**API Endpoints Needed:**
- `POST /api/auth/login` - Authenticate user and return JWT token
- `POST /api/auth/logout` - Logout (client-side token removal, server-side logging)

### 4. `src/pages/Login.tsx`
**File:** `src/pages/Login.tsx`  
**Usage:**
- Uses `AuthContext.login()` which calls `authApi.login()`

**Note:** Currently accepts any password for demo accounts. Must be updated to require real passwords.

### 5. `src/pages/Dashboard.tsx`
**File:** `src/pages/Dashboard.tsx`  
**Usage:**
- `dashboardApi.getStats()` - Line 32
- `dashboardApi.getRecentOrders()` - Line 33

**API Endpoints Needed:**
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-orders?limit=5` - Get recent orders

### 6. `src/pages/Equipment.tsx`
**File:** `src/pages/Equipment.tsx`  
**Usage:**
- `equipmentApi.getAll()` - Line 23

**API Endpoints Needed:**
- `GET /api/equipment` - Get all equipment items
- `GET /api/equipment?category={category}` - Filter by category (optional)
- `GET /api/equipment?search={query}` - Search equipment (optional)

### 7. `src/pages/MyOrders.tsx`
**File:** `src/pages/MyOrders.tsx`  
**Usage:**
- `ordersApi.getAll()` - Line 55 (for managers)
- `ordersApi.getByUserId()` - Line 56 (for employees)
- `ordersApi.updateStatus()` - Line 76 (for managers)

**API Endpoints Needed:**
- `GET /api/orders` - Get all orders (admin/procurement_manager only)
- `GET /api/orders?userId={userId}` - Get user's orders (employees)
- `PATCH /api/orders/:orderId/status` - Update order status (admin/procurement_manager only)

### 8. `src/pages/CreateOrder.tsx`
**File:** `src/pages/CreateOrder.tsx`  
**Usage:**
- `ordersApi.create()` - Line 49

**API Endpoints Needed:**
- `POST /api/orders` - Create new order

### 9. `src/pages/AdminUsers.tsx`
**File:** `src/pages/AdminUsers.tsx`  
**Usage:**
- `usersApi.getAll()` - Line 71
- `usersApi.update()` - Line 120
- `usersApi.create()` - Line 129
- `usersApi.delete()` - Line 142

**API Endpoints Needed:**
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PATCH /api/users/:userId` - Update user (admin only)
- `DELETE /api/users/:userId` - Delete user (admin only)

---

## Data Structure Mismatches

### User Model
**Mock Data (`mockData.ts`):**
```typescript
{
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  createdAt: string;
  // NO password field
}
```

**Database Schema (`DATABASE_SCHEMA.md`):**
```sql
{
  user_id: uuid,
  full_name: text,
  email: text,
  password_hash: text,  // EXISTS in DB
  department: text,
  role: user_role_enum,
  created_at: timestamp
}
```

**Required Changes:**
1. Frontend `User` type uses `name` but DB uses `full_name`
2. Frontend `User` type uses `id` but DB uses `user_id`
3. Frontend `User` type uses `createdAt` but DB uses `created_at`
4. Database has `password_hash` which must NEVER be returned to frontend
5. Login flow must send password, backend must hash and verify

### Equipment Model
**Mock Data:**
```typescript
{
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: string;
  unitPrice: number;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
}
```

**Database Schema:**
```sql
{
  item_id: uuid,
  item_name: text,
  quantity: integer,  // stock quantity
  price: integer,     // stored as cents/integer
  category: item_category_enum,
  description: text,
  specification: text,  // singular
  image_url: text,
  in_stock: boolean
}
```

**Required Changes:**
1. Frontend uses `id` but DB uses `item_id`
2. Frontend uses `name` but DB uses `item_name`
3. Frontend uses `unitPrice` (number) but DB uses `price` (integer, likely in cents)
4. Frontend uses `specifications` (plural) but DB uses `specification` (singular)
5. Frontend uses `imageUrl` but DB uses `image_url`
6. Frontend uses `stockQuantity` but DB uses `quantity`
7. Frontend uses `inStock` but DB uses `in_stock`

### Order Model
**Mock Data:**
```typescript
{
  id: string;
  userId: string;
  userName: string;
  department: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  justification: string;
  createdAt: string;
  updatedAt: string;
}
```

**Database Schema:**
```sql
-- orders table
{
  order_id: uuid,
  user_id: uuid,
  total_price: integer,  // stored as cents/integer
  justify_msg: text,
  is_active: boolean,
  status: order_status_enum,
  created_at: timestamp
}

-- order_items table
{
  order_id: uuid,
  item_id: uuid,
  item_name: text,
  quantity: integer,
  price: integer,  // stored as cents/integer
  category: item_category_enum
}
```

**Required Changes:**
1. Frontend uses `id` but DB uses `order_id`
2. Frontend uses `userId` but DB uses `user_id`
3. Frontend uses `totalAmount` (number) but DB uses `total_price` (integer, likely in cents)
4. Frontend uses `justification` but DB uses `justify_msg`
5. Frontend uses `createdAt` but DB uses `created_at`
6. Frontend has `updatedAt` but DB doesn't have this field (may need to add or derive)
7. Frontend has `userName` and `department` which must be joined from users table
8. Frontend `OrderItem` has full `equipment` object, but DB only stores `item_id`, `item_name`, `quantity`, `price`, `category`
9. Frontend `OrderStatus` includes `'ordered'` and `'delivered'` but DB enum only has `'pending'`, `'approved'`, `'rejected'`, `'completed'`

### Order Status Mismatch
**Frontend Type:**
```typescript
type OrderStatus = 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered';
```

**Database Enum:**
```sql
order_status_enum: 'pending' | 'approved' | 'rejected' | 'completed'
```

**Required Changes:**
- Map `'ordered'` and `'delivered'` to `'completed'` or update database enum
- Decision needed: Should we add these statuses to DB or map them?

---

## Summary

### Files Requiring Changes:
1. ✅ `src/services/api.ts` - Complete rewrite with HTTP calls
2. ✅ `src/pages/Equipment.tsx` - Remove direct `equipmentCategories` import
3. ✅ `src/types/index.ts` - Update types to match database schema
4. ✅ `src/context/AuthContext.tsx` - Update to handle JWT tokens
5. ✅ `src/pages/Login.tsx` - Update to require real passwords

### API Endpoints to Implement:

#### Authentication
- `POST /api/auth/login` - Login with email/password, return JWT
- `POST /api/auth/logout` - Logout (logging only)
- `GET /api/auth/me` - Get current user from JWT

#### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:userId` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:userId` - Update user
- `DELETE /api/users/:userId` - Delete user

#### Equipment
- `GET /api/equipment` - List all equipment (with optional filters)
- `GET /api/equipment/:itemId` - Get equipment by ID
- `GET /api/equipment/categories` - Get list of categories

#### Orders
- `GET /api/orders` - List orders (filtered by role)
- `GET /api/orders/:orderId` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:orderId/status` - Update order status (managers only)

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-orders` - Get recent orders

---

## Next Steps

1. ✅ Complete this analysis
2. Create backend structure (Express.js)
3. Implement database connection (Supabase PostgreSQL)
4. Implement authentication (JWT + bcrypt)
5. Implement RBAC middleware
6. Implement all API endpoints
7. Implement logging service
8. Update frontend API service
9. Update frontend types
10. Test end-to-end flow



