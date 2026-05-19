# Market Insight AI

Market Insight AI is a full-stack agentic stock market research assistant that combines live market data, financial statements, historical price charts, and an AI agent workflow to generate grounded stock insights.

## Features

- LangGraph-based tool-calling agent
- FastAPI backend with modular stock APIs
- yFinance integration for stock data
- Groq LLM integration for natural-language explanations
- Next.js frontend with premium dashboard UI
- Historical price charts using Recharts
- Stock snapshot cards for price, market cap, PE ratio, EPS, revenue growth, profit margin, and 52-week range
- Streaming AI response using FastAPI StreamingResponse and frontend readable streams
- Tool usage trace for transparent agent behavior
- Educational disclaimer for responsible financial AI usage

## Tech Stack

### Backend
- FastAPI
- Python
- LangGraph
- LangChain
- Groq
- yFinance
- Pandas
- Pydantic

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

## Project Architecture

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
yFinance Market Data
 ↓
Groq LLM Explanation