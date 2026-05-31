# Demo Checklist

Use this checklist before a local demo, live deployment demo, or recruiter walkthrough.

## Local Demo Checklist

- Start backend:
  `cd backend && source venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8057`
- Start frontend:
  `cd frontend && npm run dev`
- Test `AAPL`.
- Test `NVDA`.
- Test `TCS.NS`.
- Test compare stocks with `AAPL`, `MSFT`, and `NVDA`.
- Test report copy and markdown download.
- Test an invalid symbol and confirm the error is friendly.

## Live Deployment Checklist

- Backend `/health` works.
- Backend `/health/cache` works.
- Frontend loads.
- Frontend can call backend through `/api/backend/...`.
- Browser console has no CORS errors.
- Agent streaming works.
- Compare API works.
- Report export works.

## Best Demo Prompts

1. Symbol: `AAPL`
   Question: `Give me a simple overview of business, price and risks.`

2. Symbol: `NVDA`
   Question: `Explain the financial health based on revenue, profit and cash flow.`

3. Symbol: `TSLA`
   Question: `Does this company pay dividends?`

4. Symbol: `TCS.NS`
   Question: `Give me a simple overview of business, price and dividend history.`

## If Live Backend Is Slow

Explain that Render free tier services may cold start after inactivity. The first request can be slower than later requests.

## If CORS Fails

- Check backend `ALLOWED_ORIGINS`.
- Add the exact Vercel frontend URL.
- Redeploy or restart the backend.
- Confirm the frontend is using `/api/backend/...` unless direct backend mode is intentionally enabled.

## If Groq Fails

- Check `GROQ_API_KEY` in Render environment variables.
- Check `GROQ_MODEL` availability.
- Review backend logs in Render.
