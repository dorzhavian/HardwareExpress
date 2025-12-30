# Frontend Environment Setup

## Environment Variables

Create a `.env` file in the project root (same level as `package.json`) with:

```env
# Backend API URL
# Default: http://localhost:3000/api (if not set)
VITE_API_URL=http://localhost:3000/api
```

## Development Setup

1. **Backend must be running first:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Frontend will run on:** http://localhost:8080 (or port specified in vite.config.ts)

## Production Setup

For production, set `VITE_API_URL` to your production backend URL:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Notes

- Environment variables prefixed with `VITE_` are exposed to the frontend code
- Never put sensitive data (like API keys) in frontend environment variables
- The API URL defaults to `http://localhost:3000/api` if not set

