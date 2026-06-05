# Deployment Guide

Market Insight AI is designed to deploy as two services:

- Backend: FastAPI on Render
- Frontend: Next.js on Vercel

Do not put real API keys in the repository. Add production secrets only in the Render and Vercel dashboards.

## Backend On Render

Recommended service type:

- Type: Web Service
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Required environment variables:

```env
GROQ_API_KEY=<set in Render dashboard only>
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

This repo also includes `backend/render.yaml` for Render Blueprint setup. It uses safe placeholders and marks secrets as dashboard-managed.

### Render Notes

- Render free tier may sleep after inactivity, so the first request in a demo can be slow.
- If the frontend domain changes, update `ALLOWED_ORIGINS` with the exact Vercel URL and restart/redeploy the backend.
- Keep `GROQ_API_KEY` private. Never commit it to git.

## Frontend On Vercel

Recommended project settings:

- Framework: Next.js
- Root directory: `frontend`
- Install command: `npm install`
- Build command: `npm run build`
- Output: Vercel auto-detects Next.js

Required environment variables:

```env
BACKEND_API_BASE_URL=https://your-render-backend-url.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://your-render-backend-url.onrender.com
NEXT_PUBLIC_DIRECT_BACKEND=false
```

The app uses a same-origin Next.js proxy route at `/api/backend/...` by default. This keeps browser CORS out of the main app flow. `NEXT_PUBLIC_API_BASE_URL` is kept for compatibility and can be used for direct browser-to-backend calls only when `NEXT_PUBLIC_DIRECT_BACKEND=true`.

After Vercel deploys, copy the exact production frontend URL and add it to Render:

```env
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

### Important Monorepo Note

This repository keeps the deployable Next.js app inside `frontend/`.

If the Vercel project is pointed at the repository root instead of `frontend/`, the live site can return `404 Not Found` at `/` even when the app works locally. Fix that in Vercel:

1. Open the Vercel project
2. Go to `Settings -> General`
3. Set `Root Directory` to `frontend`
4. Redeploy the latest commit

A root-level `vercel.json` is included in this repo as a safety net for repo-root imports, but the preferred Vercel setup is still `Root Directory = frontend`.
When `Root Directory` is `frontend`, the Vercel commands should stay plain:

- Install command: `npm install`
- Build command: `npm run build`

They should not include `cd frontend && ...`, because Vercel already runs them from inside the `frontend` directory.

## Common Errors

### Browser Shows A CORS Error

- Confirm the frontend is using the same-origin proxy and requests look like `/api/backend/...`.
- If using direct backend calls, confirm Render `ALLOWED_ORIGINS` includes the exact Vercel URL.
- Redeploy or restart the Render service after changing environment variables.

### Backend Health Fails

- Check Render build logs.
- Confirm root directory is `backend`.
- Confirm start command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Confirm all dependencies are installed from `backend/requirements.txt`.

### Vercel Root Returns 404

- Confirm the Vercel project `Root Directory` is `frontend`.
- If the project was imported before that setting was corrected, trigger a fresh redeploy.
- Confirm the deployment logs show the Next.js app from `frontend/` being built instead of the repository root.

### Agent Fails Or Streams Errors

- Confirm `GROQ_API_KEY` exists in Render environment variables.
- Confirm `GROQ_MODEL` is available for your Groq account.
- Check Render logs for backend exceptions.

### Market Data Is Slow Or Missing

- Render free tier cold starts can delay the first request.
- yFinance data can occasionally be unavailable or rate limited.
- Try a common symbol such as `AAPL`, `NVDA`, or `MSFT`.

## Final Verification Checklist

Backend:

- `GET /health` returns `{"status":"healthy"}`.
- `GET /health/cache` returns cache stats.
- `POST /api/stocks/snapshot` works for `AAPL`.
- `POST /api/agent/chat/stream` emits NDJSON events.

Frontend:

- Home page loads on Vercel.
- Dashboard and chart render for `AAPL`.
- Streaming answer appears.
- Tool badges and trace timeline appear.
- Compare stocks works for `AAPL`, `MSFT`, and `NVDA`.
- Markdown report copy/download works.
- Browser console has no CORS errors.
