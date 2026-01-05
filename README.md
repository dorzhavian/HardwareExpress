# HardwareExpress
A secure internal hardware ordering system with JWT auth, RBAC, audit logging, and AI log analysis powered by Hugging Face.

## Quick Start

1. Install backend dependencies:
```bash
cd server
npm install
```

2. Create `server/.env` (see `server/ENV_SETUP.md`).

3. Set up the AI microservice:
```bash
cd server/ai_service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

4. Run both services:
```bash
cd server
npm run dev:all
```

## Notes

- The AI service runs on `http://127.0.0.1:8001` by default.
- Update `HF_MODEL_NAME` in `server/.env` to switch models.
