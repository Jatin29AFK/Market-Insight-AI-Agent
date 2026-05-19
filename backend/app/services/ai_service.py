import json
from typing import Dict, Any

from groq import Groq

from app.core.config import settings
from app.services.stock_service import (
    normalize_symbol,
    get_stock_snapshot,
    get_historical_data,
    get_financial_statements,
)


def compact_json(data: Dict[str, Any], max_chars: int = 12000) -> str:
    """
    Converts Python dictionary into readable JSON string.

    Why compact?
    Financial data can become very large.
    LLMs have context limits.
    So we send useful but limited data.

    max_chars prevents sending too much data to the LLM.
    """
    text = json.dumps(data, indent=2, default=str)

    if len(text) > max_chars:
        return text[:max_chars] + "\n\n[Data truncated to avoid sending too much context]"

    return text


def calculate_basic_trend(history_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates simple price trend from historical data.

    Example:
    Start price = 100
    End price = 110
    Change = +10%

    This is deterministic calculation.
    Deterministic means:
    same input always gives same output.
    """
    records = history_data.get("records", [])

    if len(records) < 2:
        return {
            "trend_available": False,
            "message": "Not enough historical records to calculate trend."
        }

    first_close = records[0].get("close")
    last_close = records[-1].get("close")

    if first_close is None or last_close is None or first_close == 0:
        return {
            "trend_available": False,
            "message": "Invalid close prices for trend calculation."
        }

    absolute_change = round(last_close - first_close, 2)
    percentage_change = round((absolute_change / first_close) * 100, 2)

    if percentage_change > 0:
        direction = "upward"
    elif percentage_change < 0:
        direction = "downward"
    else:
        direction = "flat"

    return {
        "trend_available": True,
        "start_close": first_close,
        "end_close": last_close,
        "absolute_change": absolute_change,
        "percentage_change": percentage_change,
        "direction": direction,
    }


def build_stock_analysis_prompt(
    symbol: str,
    question: str,
    stock_data: Dict[str, Any]
) -> str:
    """
    Builds the final prompt for the LLM.

    The prompt tells the AI:
    - what role it has
    - what data it can use
    - what output format we want
    - what safety rules it must follow
    """

    return f"""
You are Market Insight AI, an educational stock market analysis assistant.

Your job:
Explain the given stock data in simple, clear language.

Very important rules:
1. Use only the data provided below.
2. Do not invent missing numbers.
3. Do not give buy/sell/hold financial advice.
4. Do not guarantee future returns.
5. Clearly mention risks and limitations.
6. Explain financial terms in beginner-friendly language.
7. Keep the tone professional and practical.

User question:
{question}

Stock symbol:
{symbol}

Structured stock data:
{compact_json(stock_data)}

Now write the answer using this structure:

1. Quick Summary
2. Company Overview
3. Price Movement
4. Key Financial Metrics
5. Financial Statement Signals
6. Risks / Things to Watch
7. Educational Conclusion

Keep it useful for a beginner investor or recruiter reviewing this project.
"""


def generate_llm_response(prompt: str) -> str:
    """
    Sends prompt to Groq LLM and returns response text.
    """

    if not settings.GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY is missing. Add it in your .env file."
        )

    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful AI assistant that explains stock market data safely and clearly."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=1200,
    )

    return response.choices[0].message.content


def analyze_stock_with_ai(
    symbol: str,
    question: str,
    period: str = "1mo"
) -> Dict[str, Any]:
    """
    Main function for AI stock analysis.

    Steps:
    1. Normalize stock symbol
    2. Fetch stock snapshot
    3. Fetch historical price data
    4. Fetch financial statements
    5. Calculate basic trend
    6. Send all structured data to LLM
    7. Return final insight
    """

    symbol = normalize_symbol(symbol)

    snapshot = get_stock_snapshot(symbol)

    history = get_historical_data(
        symbol=symbol,
        period=period
    )

    financials = get_financial_statements(
        symbol=symbol,
        statement_type="all",
        limit=6
    )

    trend = calculate_basic_trend(history)

    stock_data = {
        "snapshot": snapshot,
        "history_period": period,
        "calculated_trend": trend,
        "financials": financials,
    }

    prompt = build_stock_analysis_prompt(
        symbol=symbol,
        question=question,
        stock_data=stock_data
    )

    insight = generate_llm_response(prompt)

    return {
        "symbol": symbol,
        "question": question,
        "insight": insight,
        "data_used": {
            "snapshot_used": True,
            "history_used": True,
            "financials_used": True,
            "history_period": period,
            "trend_calculated": trend.get("trend_available", False),
            "llm_model": settings.GROQ_MODEL,
        }
    }