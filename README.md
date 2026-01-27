# HardwareExpress

A secure internal hardware ordering system with JWT authentication, role-based access control (RBAC), audit logging, and AI-powered log analysis using Hugging Face model.

## Project Structure

```
HardwareExpress/
├── client/              # React frontend (Vite + TypeScript + Tailwind)
├── server/              # Backend API Server (Express + TypeScript)
│   ├── src/            # Backend API source code
│   │   └── services/   # Shared services (logging, AI analysis)
│   ├── auth-server/    # Authentication Server (Express + TypeScript)
│   │                   # Handles login, password verification, JWT generation
│   │                   # Uses shared logging service from ../src/services/
│   └── ai_service/      # Python AI microservice (FastAPI + Hugging Face)
```

## Prerequisites

- **Node.js**: v18 or higher
- **Python**: 3.11 or 3.12
- **Supabase Account**: For database hosting
---

## Complete Setup Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HardwareExpress
```

### 2. Authentication Server Setup

Create the environment file and install dependencies. See [server/auth-server/README.md](server/auth-server/README.md) for detailed .env configuration.

> ⚠️ **Important**: The `JWT_SECRET` must be **identical** in both `server/auth-server/.env` and `server/.env` files.


### 3. Backend API Setup (Server)

Create the environment file and install dependencies. See [server/README.md](server/README.md) for detailed .env configuration.

### 4. AI Service Setup (Python)

Setup the AI service. See [server/ai_service/README.md](server/ai_service/README.md) for details.

### 5. Frontend Setup (Client)

See [client/README.md](client/README.md) for detailed setup instructions.


## Running the Application

### Run All Services Together

You need to run two services:

**Terminal 1 - Backend API + AI Service + Authentication Server:**
```bash
cd server
npm run dev:all
```
This starts:
- Backend API server on `http://localhost:3000`
- AI service on `http://127.0.0.1:8001`
- Auth server on `http://localhost:3001`


**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
- Frontend runs on `http://localhost:8080`

---

## Architecture Overview

### Authentication Server (Node.js + Express)
- **Purpose**: Dedicated server for user authentication
- **Responsibilities**:
  - User login with email/password
  - Password verification (bcrypt)
  - JWT token generation
  - Authentication event logging (uses shared logging service from Backend API)
- **Port**: 3001
- **Endpoints**: `POST /login`, `GET /health`
- **Location**: `server/auth-server/` (shares logging service with Backend API)

### Backend API (Node.js + Express)
- **Purpose**: Main API server for business logic
- **Responsibilities**:
  - JWT token verification
  - All business logic (orders, catalog, users, dashboard)
  - RBAC authorization
  - Audit logging
- **Port**: 3000
- **Architecture**:
  - **Controllers**: Request/response handling
  - **Services**: Business logic
  - **Repositories**: Database access (Supabase)
  - **Middlewares**: Auth, RBAC, logging

### AI Service (Python + FastAPI)
- Uses **Qwen2.5** for semantic log analysis
- Classifies logs as `NORMAL` or `ANOMALOUS`
- Results stored in `logs` table
- **Port**: 8001

### Frontend (React + Vite)
- TypeScript + Tailwind CSS
- JWT-based authentication
- Role-based UI components
- Connects to Authentication Server for login, Backend API for all other operations

---

## Environment Files Summary

| Location | File | Purpose |
|----------|------|---------|
| `server/auth-server/.env` | Auth Server config | Database, JWT secret (must match server) |
| `server/.env` | Backend API config | Database, JWT secret (must match auth-server), AI service settings |
| `client/.env` | Frontend config | API URLs (Auth Server + Backend API) |

**Critical**: The `JWT_SECRET` must be **identical** in both `server/auth-server/.env` and `server/.env` files for token generation and verification to work.

See individual README files in each folder for detailed configuration options.

---


