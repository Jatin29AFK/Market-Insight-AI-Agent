import json
from typing import Literal

from pydantic import BaseModel, Field
from langchain_core.tools import tool

from app.services.stock_service import (
    get_stock_price,
    get_company_info,
    get_historical_data,
    get_stock_snapshot,
    get_financial_statements,
    get_recommendations,
    get_dividends,
)


def to_pretty_json(data) -> str:
    """
    Convert Python dict/list data into readable JSON string.

    Tools return strings because LLMs can easily read text.
    """
    return json.dumps(data, indent=2, default=str)


class SymbolInput(BaseModel):
    symbol: str = Field(
        description="Yahoo Finance ticker symbol. Examples: AAPL, MSFT, TSLA, RELIANCE.NS"
    )


class HistoricalInput(BaseModel):
    symbol: str = Field(
        description="Yahoo Finance ticker symbol. Examples: AAPL, TSLA, RELIANCE.NS"
    )
    period: str = Field(
        default="1mo",
        description="Historical period. Examples: 5d, 1mo, 3mo, 6mo, 1y, 5y"
    )


class FinancialInput(BaseModel):
    symbol: str = Field(
        description="Yahoo Finance ticker symbol. Examples: AAPL, TSLA, TCS.NS"
    )
    statement_type: Literal["income", "balance", "cashflow", "all"] = Field(
        default="all",
        description="Financial statement type"
    )
    limit: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Number of rows to return from each financial statement"
    )


class LimitInput(BaseModel):
    symbol: str = Field(
        description="Yahoo Finance ticker symbol. Examples: AAPL, TSLA, INFY.NS"
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=30,
        description="Number of records to return"
    )


@tool(args_schema=SymbolInput)
def get_stock_price_tool(symbol: str) -> str:
    """
    Use this tool when the user asks about latest stock price, current price,
    previous close, day high, day low, currency, or market cap.
    """
    return to_pretty_json(get_stock_price(symbol))


@tool(args_schema=SymbolInput)
def get_company_info_tool(symbol: str) -> str:
    """
    Use this tool when the user asks about company overview, business summary,
    sector, industry, website, or what the company does.
    """
    return to_pretty_json(get_company_info(symbol))


@tool(args_schema=HistoricalInput)
def get_historical_data_tool(symbol: str, period: str = "1mo") -> str:
    """
    Use this tool when the user asks about price movement, trend, historical prices,
    past performance, recent movement, or stock movement over a time period.
    """
    return to_pretty_json(get_historical_data(symbol=symbol, period=period))


@tool(args_schema=SymbolInput)
def get_stock_snapshot_tool(symbol: str) -> str:
    """
    Use this tool when the user asks for a general stock overview, quick analysis,
    valuation overview, key metrics, PE ratio, EPS, revenue growth, profit margin,
    52-week high/low, or combined company and price snapshot.
    """
    return to_pretty_json(get_stock_snapshot(symbol))


@tool(args_schema=FinancialInput)
def get_financial_statements_tool(
    symbol: str,
    statement_type: str = "all",
    limit: int = 5
) -> str:
    """
    Use this tool when the user asks about financial health, revenue, profit,
    net income, balance sheet, assets, liabilities, debt, cash flow, or company fundamentals.
    """
    return to_pretty_json(
        get_financial_statements(
            symbol=symbol,
            statement_type=statement_type,
            limit=limit
        )
    )


@tool(args_schema=LimitInput)
def get_recommendations_tool(symbol: str, limit: int = 10) -> str:
    """
    Use this tool when the user asks about analyst recommendations, analyst rating,
    strong buy, buy, hold, sell, or market opinion.
    """
    return to_pretty_json(get_recommendations(symbol=symbol, limit=limit))


@tool(args_schema=LimitInput)
def get_dividends_tool(symbol: str, limit: int = 10) -> str:
    """
    Use this tool when the user asks about dividend history, dividend payments,
    income from stock, payout, or whether a company pays dividends.
    """
    return to_pretty_json(get_dividends(symbol=symbol, limit=limit))


STOCK_AGENT_TOOLS = [
    get_stock_price_tool,
    get_company_info_tool,
    get_historical_data_tool,
    get_stock_snapshot_tool,
    get_financial_statements_tool,
    get_recommendations_tool,
    get_dividends_tool,
]