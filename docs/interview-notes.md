# Market Insight AI Interview Notes

## 30-Second Project Pitch

Market Insight AI is a full-stack stock research assistant that uses FastAPI, LangGraph, Groq, yFinance, and Next.js. Users can ask natural-language questions about a stock, the agent chooses the right financial tools, streams a grounded response, and shows exactly which tools and data were used.

## 2-Minute Technical Explanation

The frontend is a Next.js 16 TypeScript dashboard with Tailwind styling, Recharts visualizations, streaming response rendering, tool badges, trace timeline, watchlist comparison, and markdown report export. The backend is a FastAPI service with modular stock routes, Pydantic schemas, yFinance data services, TTL caching, and a LangGraph agent endpoint.

The agent follows a graph flow of `START -> agent -> tools condition -> tools -> agent -> END`. It receives a strict system prompt that tells it when to use price, company info, historical data, snapshots, financial statements, dividends, and analyst recommendation tools. Tool errors are returned as structured JSON, so the agent can explain unavailable data instead of hallucinating.

## Architecture Explanation

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

The frontend handles interaction and visualization. FastAPI exposes clean APIs and owns market data retrieval. LangGraph orchestrates the agent loop. yFinance provides market data, and Groq generates the final educational explanation.

## LangGraph Explanation

LangGraph is used to model the agent workflow as a state machine. The agent node calls the LLM, the conditional edge decides whether tools are needed, the tools node executes the selected financial tool, and the graph loops back to the agent so it can answer with grounded data.

## Tool-Calling Explanation

The agent has separate tools for price, company overview, historical data, snapshots, financial statements, dividends, and analyst recommendation data. The system prompt maps user intent to these tools, which improves consistency and reduces hallucinated financial numbers.

## Caching Explanation

The backend uses a simple TTL cache around market-data service calls. Short-lived data such as prices has a shorter TTL, while slower-changing data such as financial statements has a longer TTL. This reduces repeated yFinance calls and makes the dashboard feel faster during demos.

## Streaming Explanation

The streaming endpoint returns NDJSON events. The frontend reads the response stream, processes status/tool/token/done events, and progressively renders the answer. This makes the app feel responsive while still using the same LangGraph result under the hood.

## Frontend Explanation

The frontend is built with Next.js, TypeScript, Tailwind CSS, Recharts, and Lucide icons. It includes a premium dashboard, stock snapshot cards, historical price chart, prompt templates, tool badges, trace timeline, compare cards, error states, and markdown export actions.

## Challenges Faced And Solutions

- Tool choice consistency: strengthened the system prompt and tool descriptions.
- Financial safety: enforced educational-only language and avoided direct buy/sell/hold advice.
- Data gaps from yFinance: added safe conversions, structured tool errors, and user-friendly empty states.
- Repeated API calls: added TTL caching around market data services.
- Streaming UX: used NDJSON events so status, tool usage, tokens, and final metadata can arrive progressively.

## Resume Bullets

- Built an agentic stock research assistant using FastAPI, LangGraph, Groq, yFinance, and Next.js, enabling users to query real-time market data through dynamic financial tools.
- Implemented tool-calling workflow across price, company profile, historical trend, financial statements, dividends, and analyst recommendations with transparent trace output.
- Added streaming AI responses, Recharts-based historical price visualization, TTL caching, and markdown report export to improve performance and user experience.
