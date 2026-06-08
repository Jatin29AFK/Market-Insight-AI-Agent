# Deployment Guide

Market Insight AI is designed to deploy as two services:

- Backend: FastAPI on Render
- Frontend: Next.js on Vercel

Do not put real API keys in the repository. Add production secrets only in the Render and Vercel dashboards.

## Fresh Deploy Order

If you want the cleanest setup, create brand-new services in this order:

1. Create a fresh Render backend first.
2. Copy the new Render backend URL.
3. Create a fresh Vercel frontend that points to that Render URL.
4. Copy the final Vercel production URL.
5. Go back to Render and update `ALLOWED_ORIGINS` with the exact Vercel URL.
6. Redeploy Render once more.

This order avoids the most common problem: Vercel is deployed, but Render is still allowing the wrong frontend origin.

## Backend On Render

Recommended service type:

- Type: Web Service
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`
- Python version: `3.12.3`

Required environment variables:

```env
PYTHON_VERSION=3.12.3
GROQ_API_KEY=<set in Render dashboard only>
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

This repo also includes `backend/render.yaml` for Render Blueprint setup. It uses safe placeholders and marks secrets as dashboard-managed.

### Render Fresh Setup Step By Step

1. Push your latest working code to GitHub.
2. Log in to Render and click `New +`.
3. Choose one of these:
   - `Web Service` if you want to enter settings manually.
   - `Blueprint` if you want Render to read `backend/render.yaml`.
4. Connect the GitHub repository that contains this project.
5. If you picked `Web Service`, enter these values:
   - Name: `market-insight-ai-backend` or any name you prefer
   - Runtime: `Python 3`
   - Branch: your deploy branch, usually `main`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Health Check Path: `/health`
6. In the Render environment variables section, add:
   - `PYTHON_VERSION=3.12.3`
   - `GROQ_API_KEY=your_real_key`
   - `GROQ_MODEL=llama-3.3-70b-versatile`
   - `ALLOWED_ORIGINS=https://placeholder.vercel.app`
7. Create the service and wait for the first deploy to finish.
8. Open the new Render service URL in the browser:
   - `https://your-service-name.onrender.com/health`
9. Confirm it returns:

```json
{"status":"healthy"}
```

10. Save the base backend URL. Example:
    - `https://market-insight-ai-backend.onrender.com`

If the deploy fails before the service starts, the first things to re-check are `Root Directory`, `Build Command`, `Start Command`, and `PYTHON_VERSION`.

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

### Vercel Fresh Setup Step By Step

1. Log in to Vercel and click `Add New... -> Project`.
2. Import the same GitHub repository.
3. During import, make sure the project points to the Next.js app inside `frontend/`.
4. Set these project values:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Install Command: `npm install`
   - Build Command: `npm run build`
5. Add these environment variables before the first deploy:

```env
BACKEND_API_BASE_URL=https://your-render-backend-url.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://your-render-backend-url.onrender.com
NEXT_PUBLIC_DIRECT_BACKEND=false
```

6. Replace the example URL with the real backend URL you saved from Render.
7. Click `Deploy`.
8. After the deploy finishes, open the Vercel production URL.
9. Confirm the home page loads and the app is not showing `404 Not Found`.
10. Copy the exact Vercel production URL. Example:
    - `https://market-insight-ai-agent.vercel.app`

After Vercel deploys, copy the exact production frontend URL and add it to Render:

```env
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
```

Then redeploy Render so the new CORS value is active.

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
- Confirm the exact protocol and host match, for example `https://my-app.vercel.app`.
- Redeploy or restart the Render service after changing environment variables.

### Backend Health Fails

- Check Render build logs.
- Confirm root directory is `backend`.
- Confirm start command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Confirm all dependencies are installed from `backend/requirements.txt`.
- Confirm `PYTHON_VERSION=3.12.3` is set if Render picked a newer default Python version.

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
- `GET /api/backend/health` on the Vercel domain returns a healthy backend response.
- Dashboard and chart render for `AAPL`.
- Streaming answer appears.
- Tool badges and trace timeline appear.
- Compare stocks works for `AAPL`, `MSFT`, and `NVDA`.
- Markdown report copy/download works.
- Browser console has no CORS errors.
