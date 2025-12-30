# Cursor Rules – HardwareExpress Project

This document defines the **Cursor Rules** for the HardwareExpress project.  
Its goal is to enforce **consistency, clarity, traceability, and engineering justification** throughout development.

---

## 1. Project Context & Description

### Project Name
HardwareExpress – Internal Equipment Ordering System

### Project Description
HardwareExpress is an internal organizational system for ordering computer and IT equipment.

The system supports:
- Role-Based Access Control (RBAC)
- Equipment catalog management
- Order creation and approval workflows
- Full audit logging of system actions
- Custom backend implementation (Supabase used as DB only)

The architecture follows a **SPA + Backend API** model with strict separation of concerns.

---

## 2. Tech Stack & Architecture

### Frontend
- React (SPA)
- TypeScript
- Axios / Fetch API
- Local state management (Hooks / Context)

**Why this choice:**  
React SPA was chosen for simplicity, flexibility, and full control over client-side state.  
Next.js was intentionally not selected since SSR, SEO, and server components are not required.

---

### Backend
- Node.js
- Express.js
- JWT Authentication
- RBAC Middleware
- bcrypt / PBKDF2 for password hashing

**Why this choice:**  
Express provides full control over request flow and middleware without unnecessary abstraction.  
Frameworks such as NestJS were avoided to prevent over-engineering in a learning-focused project.

---

### Database
- PostgreSQL
- Supabase (Database only)
- UUID Primary Keys
- ENUM types
- Constraints and Indexes

**Why this choice:**  
PostgreSQL provides strong data integrity, native ENUM support, and enterprise-level reliability.  
Supabase Auth and Policies are intentionally not used to retain backend ownership.

---

### Architecture Flow

Frontend → Backend API → JWT Authentication → RBAC → Database → Logs

---

## 3. Coding Style & Development Behavior

### General Rules
- Readability over cleverness
- One function = one responsibility
- No business logic inside controllers

---

### Backend Structure
- Controllers: request/response handling only
- Services: business logic
- Repositories: database access only
- Middlewares: authentication, authorization, validation

---

### Frontend Rules
- Small, focused components
- No API calls directly inside JSX
- Strict typing (no `any`)

---

## 4. Decision Justification Rule (Mandatory)

**Every implementation decision must be justified.**

Whenever more than one valid solution exists:
- Clearly explain why the chosen solution was selected
- Explicitly state why alternatives were rejected

### Example
> JWT with HS256 was chosen instead of RS256  
> Reason: single-backend architecture without key distribution needs  
> Alternative rejected: RS256 adds complexity suitable for microservices, not required here

---

## 5. Project Memory & Status Protocol (Always Updated)

### Project Memory
The project must always maintain:
- Current system status
- Architectural decisions already taken
- Explicit list of excluded technologies (e.g., Supabase Auth)

---

### Status Update Format
Any significant change must be documented using the following format:

```text
[STATUS UPDATE]
Date:
Component:
Change:
Reason:
Impact:
```

### Example
```text
[STATUS UPDATE]
Date: 2025-01-30
Component: Authentication
Change: JWT authentication with RBAC middleware added
Reason: Role-based access control required
Impact: All protected routes now require a valid token
```

---

## 6. Non-Negotiable Rules

- No critical logic on the client side only
- No plain-text passwords
- No direct database access from frontend
- Every significant action must be logged

---

## 7. Purpose of These Rules

- Ensure long-term maintainability
- Enable reviewers to understand architectural decisions
- Provide consistent guidance for human developers and AI tools (Cursor, Copilot, etc.)

---

✅ This document is mandatory and must remain updated throughout the project lifecycle.
