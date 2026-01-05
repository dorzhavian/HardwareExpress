# HardwareExpress Backend

Backend API server for the HardwareExpress equipment ordering system.

## Architecture

Following CURSOR_RULES.md, the backend follows strict separation of concerns:

- **Controllers**: Request/response handling only
- **Services**: Business logic and transformations
- **Repositories**: Database access only
- **Middlewares**: Authentication, authorization, validation, logging

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables:
- Create `server/.env` using `server/ENV_SETUP.md`.
- Set `HF_MODEL_NAME` to your Hugging Face model.

3. Set up the AI microservice (Python):
```bash
cd server/ai_service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

4. Run the backend only:
```bash
npm run dev
```

5. Run the AI service only:
```bash
npm run ai
```

6. Run both together:
```bash
npm run dev:all
```

7. Check health endpoints:
```bash
curl http://localhost:3000/health
curl http://127.0.0.1:8001/health
```

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (bypasses RLS)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `AI_SERVICE_URL`: AI microservice URL (default: http://127.0.0.1:8001)
- `AI_SERVICE_TIMEOUT_MS`: AI request timeout in milliseconds
- `AI_SCORE_THRESHOLD`: Score threshold for suspicious classification
- `AI_SERVICE_HOST`: AI microservice host
- `AI_SERVICE_PORT`: AI microservice port
- `HF_MODEL_NAME`: Hugging Face model name or path
- `AI_SUSPICIOUS_LABELS`: Comma-separated labels treated as suspicious

## Database Connection

The backend uses `@supabase/supabase-js` client library for PostgreSQL access.

**Decision**: Using Supabase client instead of raw `pg` library  
**Reason**: Built-in connection pooling, retry logic, TypeScript support  
**Alternative**: `pg` (node-postgres) - rejected due to more boilerplate

## AI Log Analysis

Every log created by the backend is sent to the Python microservice.
The AI service returns a label/score that is stored in `logs_ai`.
