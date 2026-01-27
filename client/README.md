# HardwareExpress Frontend

React frontend application for the HardwareExpress equipment ordering system.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components

---

## Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Create Environment File

Create a `.env` file in the `client/` directory (optional - defaults provided):

```env
# ===========================================
# Backend API Configuration
# ===========================================
VITE_API_URL=http://localhost:3000/api

# ===========================================
# Authentication Server Configuration
# ===========================================
VITE_AUTH_URL=http://localhost:3001
```

> ⚠️ **Important**: The `VITE_AUTH_URL` points to the Authentication Server (port 3001) for login.
> All other API calls go to Backend API (port 3000).