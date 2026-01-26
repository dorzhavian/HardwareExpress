# HardwareExpress

A secure internal hardware ordering system with JWT authentication, role-based access control (RBAC), audit logging, and AI-powered log analysis using Hugging Face model.

## Project Structure

```
HardwareExpress/
├── client/          # React frontend (Vite + TypeScript + Tailwind)
├── server/          # Node.js backend (Express + TypeScript)
│   └── ai_service/  # Python AI microservice (FastAPI + Hugging Face)
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

### 2. Backend Setup (Server)

Create the environment file and install dependencies. see [server/README.md](server/README.md) for detailed .env configuration.

### 3. AI Service Setup (Python)

```bash
cd server/ai_service
py -[your version] -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# Windows CMD
.\.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Frontend Setup (Client)

see [client/README.md](client/README.md) for detailed.

## Running the Application

### Run All Services Together

```bash
cd server
npm run dev:all
```

This starts:
- Backend server on `http://localhost:3000`
- AI service on `http://127.0.0.1:8001`

Then in a **separate terminal**:
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:8080`
---

## Architecture Overview

### Backend (Node.js + Express)
- **Controllers**: Request/response handling
- **Services**: Business logic
- **Repositories**: Database access (Supabase)
- **Middlewares**: Auth, RBAC, logging

### AI Service (Python + FastAPI)
- Uses **Llama 3.2** for semantic log analysis
- Classifies logs as `NORMAL` or `ANOMALOUS`
- Results stored in `logs_ai` table

### Frontend (React + Vite)
- TypeScript + Tailwind CSS
- JWT-based authentication
- Role-based UI components

---

## Environment Files Summary

| Location | File | Purpose |
|----------|------|---------|
| `server/.env` | Backend config | Database, JWT, AI service settings |
| `client/.env` | Frontend config | API URL |

See individual README files in each folder for detailed configuration options.

---

## Troubleshooting

### AI Service Issues
- Ensure Python venv is activated
- Verify Hugging Face login: `huggingface-cli whoami`
- Check GPU availability for faster inference

### Database Connection
- Verify Supabase credentials in `server/.env`
- Use the **service_role** key (not anon key)

### CORS Errors
- Ensure backend is running on port 3000
- Check `VITE_API_URL` in client `.env`
