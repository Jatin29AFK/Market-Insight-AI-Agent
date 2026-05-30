# Market Insight AI Agent

A full-stack agentic stock research assistant that combines live market data, LangGraph tool calling, streaming AI responses, and a premium Next.js dashboard for educational market analysis.

> Safety: Market Insight AI is for educational research only, not financial advice. It does not provide buy, sell, or hold recommendations or guarantee returns.

## Demo Screenshots

Add screenshots here before publishing the portfolio repo:

- Dashboard overview
- Streaming agent response with trace
- Stock comparison watchlist
- Markdown report export

## Features

- LangGraph agent with financial tool calling
- Groq-powered natural-language responses
- FastAPI backend with modular stock endpoints
- yFinance integration for prices, company profiles, history, financials, dividends, and analyst recommendation data
- Streaming agent responses with transparent tool badges and trace timeline
- Recharts historical price visualization with period selector
- Snapshot cards for price, market cap, PE, EPS, growth, margin, beta, and 52-week range
- Frontend watchlist and backend multi-stock compare API
- Markdown report copy/download for generated analysis
- TTL caching for repeated market data requests
- Friendly empty states, error boundaries, and educational disclaimer

## Tech Stack

Backend:

- FastAPI
- Python
- LangGraph
- LangChain
- Groq
- yFinance
- Pandas
- Pydantic

Frontend:

- Next.js 16
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

## Architecture

```text
User
 ↓
Next.js Frontend
 ↓
FastAPI Backend
 ↓
LangGraph Agent
 ↓
Financial Tools
 ↓
yFinance
 ↓
Groq LLM
```

The frontend sends stock research questions to FastAPI. The backend routes requests either to direct market-data services or to a LangGraph agent. The agent decides which tools to call, receives grounded yFinance data, and asks Groq to produce a structured educational response.

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend runs by default at `http://127.0.0.1:8000`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs by default at `http://localhost:3000`.

## Environment Variables

Backend `backend/.env`:

```env
APP_NAME=Market Insight AI
APP_VERSION=1.0.0
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Frontend `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Do not commit `.env` or `.env.local`. Use the included `.env.example` files as templates.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| GET | `/health/cache` | Cache stats |
| POST | `/api/stocks/price` | Latest price data |
| POST | `/api/stocks/company-info` | Company profile |
| POST | `/api/stocks/history` | Historical prices |
| POST | `/api/stocks/snapshot` | Combined price, company, and key metrics |
| POST | `/api/stocks/financials` | Income statement, balance sheet, and cash flow |
| POST | `/api/stocks/recommendations` | Analyst recommendation data |
| POST | `/api/stocks/dividends` | Dividend history |
| POST | `/api/compare/stocks` | Multi-stock comparison |
| POST | `/api/agent/chat` | LangGraph agent response |
| POST | `/api/agent/chat/stream` | Streaming agent response |

## Agent Workflow

1. The user asks a stock question and may provide a ticker.
2. The LangGraph agent receives a system prompt with tool-use rules and safety constraints.
3. The model chooses tools based on the question, such as price, snapshot, history, financial statements, dividends, or analyst recommendation data.
4. Tool results are returned as structured JSON.
5. The agent produces a response with:
   - Direct Answer
   - Data Used
   - Key Signals
   - Risks / Limitations
   - Educational Note
6. The frontend displays the answer, tools used, trace timeline, and export actions.

## What Makes This Project Strong For Interviews

- Tool-calling agent architecture with LangGraph
- Grounded market data instead of unsupported AI guesses
- Streaming response UX
- Transparent trace and tool usage badges
- Dashboard visualization with Recharts
- Backend TTL caching for market-data performance
- Multi-stock compare and markdown report export
- Clear safety boundaries for financial AI

## Future Improvements

- Deployment with production environment separation
- Optional user accounts and saved watchlists
- More robust quote provider fallback
- PDF export
- Portfolio-level risk and allocation views
- Automated backend and frontend tests
- CI checks for lint, build, and Python compile

## Disclaimer

This project is for educational research only, not financial advice. Market data can be delayed, incomplete, or unavailable. Always verify information from official sources before making financial decisions.
