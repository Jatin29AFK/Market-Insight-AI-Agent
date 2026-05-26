import yfinance as yf
import pandas as pd
from typing import Dict, Any, List, Optional
from app.services.market_data_cache import get_or_set_cache
from app.core.exceptions import InvalidSymbolError, ExternalDataError


def normalize_symbol(symbol: str) -> str:
    """
    Cleans user input and converts it to Yahoo Finance ticker format.

    Example:
    ' aapl ' -> 'AAPL'
    ' tsla ' -> 'TSLA'
    ' reliance.ns ' -> 'RELIANCE.NS'
    """
    return symbol.strip().upper()


def safe_float(value) -> Optional[float]:
    """
    Safely converts a value into float.

    Why needed?
    Sometimes yfinance returns:
    - None
    - NaN
    - empty value
    - numpy number

    We don't want our backend to crash because of one bad value.
    """
    try:
        if value is None:
            return None

        if pd.isna(value):
            return None

        return float(value)

    except Exception:
        return None


def safe_int(value) -> Optional[int]:
    """
    Safely converts a value into int.
    Useful for volume, market cap, number of shares, etc.
    """
    try:
        if value is None:
            return None

        if pd.isna(value):
            return None

        return int(value)

    except Exception:
        return None


def safe_round(value, digits: int = 2) -> Optional[float]:
    """
    Rounds a number safely.

    Example:
    123.4567 -> 123.46
    """
    number = safe_float(value)

    if number is None:
        return None

    return round(number, digits)


def get_fast_info_value(fast_info, *keys):
    """
    Reads values from yfinance fast_info safely.

    Different versions of yfinance may expose keys slightly differently.
    So we try more than one way.
    """
    for key in keys:
        try:
            value = fast_info.get(key)
            if value is not None:
                return value
        except Exception:
            pass

        try:
            value = fast_info[key]
            if value is not None:
                return value
        except Exception:
            pass

    return None


def dataframe_to_records(dataframe: pd.DataFrame, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Converts a pandas DataFrame into JSON-friendly records.

    Why do we need this?

    yfinance returns financial statements as a pandas DataFrame.
    But APIs return JSON.
    Browser/frontend cannot directly understand pandas DataFrame.

    So we convert:

    DataFrame:
        Metric              2024       2023
        Total Revenue       1000       900
        Net Income          200        150

    Into JSON:
        [
          {
            "metric": "Total Revenue",
            "2024": 1000,
            "2023": 900
          },
          {
            "metric": "Net Income",
            "2024": 200,
            "2023": 150
          }
        ]
    """
    if dataframe is None or dataframe.empty:
        return []

    df = dataframe.copy()

    # Keep only limited rows, otherwise response becomes too large
    df = df.head(limit)

    # Financial statement rows are usually index values
    df = df.reset_index()

    # Rename first column to metric for readability
    first_column = df.columns[0]
    df = df.rename(columns={first_column: "metric"})

    records = []

    for _, row in df.iterrows():
        item = {}

        for column in df.columns:
            key = str(column)

            value = row[column]

            if isinstance(value, pd.Timestamp):
                item[key] = value.strftime("%Y-%m-%d")
            elif pd.isna(value):
                item[key] = None
            elif isinstance(value, float):
                item[key] = round(value, 2)
            elif isinstance(value, int):
                item[key] = value
            else:
                item[key] = str(value)

        records.append(item)

    return records


def _fetch_stock_price(symbol: str) -> Dict[str, Any]:
    """
    Fetches current stock price data.

    We use history(period='5d') first because it is more stable.
    Then we use fast_info for extra details like currency.
    """
    symbol = normalize_symbol(symbol)
    ticker = yf.Ticker(symbol)

    try:
        history = ticker.history(
            period="5d",
            interval="1d",
            auto_adjust=False,
            raise_errors=False
        )

        if history is None or history.empty:
            raise InvalidSymbolError(
                f"No price data found for '{symbol}'. "
                f"Please check the ticker symbol. "
                f"Examples: AAPL, MSFT, TSLA, RELIANCE.NS, TCS.NS"
        )

        latest_row = history.iloc[-1]

        current_price = safe_float(latest_row.get("Close"))
        day_high = safe_float(latest_row.get("High"))
        day_low = safe_float(latest_row.get("Low"))

        previous_close = None

        if len(history) >= 2:
            previous_close = safe_float(history.iloc[-2].get("Close"))

        currency = None
        market_cap = None

        try:
            fast_info = ticker.fast_info

            currency = get_fast_info_value(fast_info, "currency")
            market_cap = get_fast_info_value(fast_info, "market_cap", "marketCap")

            fast_price = get_fast_info_value(fast_info, "last_price", "lastPrice")

            if fast_price is not None:
                current_price = safe_float(fast_price)

            fast_previous_close = get_fast_info_value(
                fast_info,
                "previous_close",
                "previousClose"
            )

            if fast_previous_close is not None:
                previous_close = safe_float(fast_previous_close)

        except Exception:
            pass

        return {
            "symbol": symbol,
            "current_price": safe_round(current_price),
            "currency": currency,
            "previous_close": safe_round(previous_close),
            "day_high": safe_round(day_high),
            "day_low": safe_round(day_low),
            "market_cap": safe_int(market_cap)
        }

    except ValueError:
        raise

    except InvalidSymbolError:
        raise

    except Exception as error:
        raise ExternalDataError(
            f"Unable to fetch price data for symbol: {symbol}. Error: {str(error)}"
        ) from error 

def get_stock_price(symbol: str) -> Dict[str, Any]:
    symbol = normalize_symbol(symbol)

    return get_or_set_cache(
        key=f"stock_price:{symbol}",
        fetch_function=lambda: _fetch_stock_price(symbol),
        ttl_seconds=60,
    )

def _fetch_company_info(symbol: str) -> Dict[str, Any]:
    """
    Fetches company profile information.

    Example output:
    - Company name
    - Sector
    - Industry
    - Website
    - Business summary
    """
    symbol = normalize_symbol(symbol)
    ticker = yf.Ticker(symbol)

    try:
        info = ticker.info

        return {
            "symbol": symbol,
            "name": info.get("longName"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "website": info.get("website"),
            "summary": info.get("longBusinessSummary"),
        }

    except Exception as error:
        raise ValueError(
            f"Unable to fetch company info for symbol: {symbol}. Error: {str(error)}"
        ) from error

def get_company_info(symbol: str) -> Dict[str, Any]:
    symbol = normalize_symbol(symbol)

    return get_or_set_cache(
        key=f"company_info:{symbol}",
        fetch_function=lambda: _fetch_company_info(symbol),
        ttl_seconds=3600,
    )

def _fetch_key_metrics(symbol: str) -> Dict[str, Any]:
    """
    Fetches important business/stock metrics.

    These are the numbers recruiters/interviewers understand easily:
    - Market Cap
    - PE Ratio
    - EPS
    - Dividend Yield
    - 52 Week High/Low
    - Profit Margins
    - Revenue Growth

    This makes your project look more like a real analysis product.
    """
    symbol = normalize_symbol(symbol)
    ticker = yf.Ticker(symbol)

    try:
        info = ticker.info

        return {
            "market_cap": safe_int(info.get("marketCap")),
            "trailing_pe": safe_round(info.get("trailingPE")),
            "forward_pe": safe_round(info.get("forwardPE")),
            "eps": safe_round(info.get("trailingEps")),
            "dividend_yield": safe_round(info.get("dividendYield")),
            "profit_margins": safe_round(info.get("profitMargins")),
            "revenue_growth": safe_round(info.get("revenueGrowth")),
            "fifty_two_week_high": safe_round(info.get("fiftyTwoWeekHigh")),
            "fifty_two_week_low": safe_round(info.get("fiftyTwoWeekLow")),
            "average_volume": safe_int(info.get("averageVolume")),
            "beta": safe_round(info.get("beta")),
        }

    except Exception as error:
        raise ValueError(
            f"Unable to fetch key metrics for symbol: {symbol}. Error: {str(error)}"
        ) from error

def get_key_metrics(symbol: str) -> Dict[str, Any]:
    symbol = normalize_symbol(symbol)

    return get_or_set_cache(
        key=f"key_metrics:{symbol}",
        fetch_function=lambda: _fetch_key_metrics(symbol),
        ttl_seconds=300,
    )

def get_stock_snapshot(symbol: str) -> Dict[str, Any]:
    """
    Creates a combined stock snapshot.

    This is useful because frontend or AI agent can get
    important information in one API call.

    Snapshot includes:
    - company info
    - price data
    - key financial metrics
    """
    symbol = normalize_symbol(symbol)

    company = get_company_info(symbol)
    price = get_stock_price(symbol)
    key_metrics = get_key_metrics(symbol)

    return {
        "symbol": symbol,
        "company": company,
        "price": price,
        "key_metrics": key_metrics,
    }


def _fetch_historical_data(symbol: str, period: str = "1mo") -> Dict[str, Any]:
    """
    Fetches historical stock price data.

    Common periods:
    - 1d
    - 5d
    - 1mo
    - 3mo
    - 6mo
    - 1y
    - 5y
    """
    symbol = normalize_symbol(symbol)
    ticker = yf.Ticker(symbol)

    try:
        data = ticker.history(
            period=period,
            interval="1d",
            auto_adjust=False,
            raise_errors=False
        )

        if data is None or data.empty:
            raise ValueError(
                f"No historical data found for '{symbol}'. "
                f"Please check the ticker symbol or period."
            )

        data = data.reset_index()

        records: List[Dict[str, Any]] = []

        for _, row in data.iterrows():
            records.append({
                "date": str(row["Date"]),
                "open": safe_round(row["Open"]),
                "high": safe_round(row["High"]),
                "low": safe_round(row["Low"]),
                "close": safe_round(row["Close"]),
                "volume": safe_int(row["Volume"]),
            })

        return {
            "symbol": symbol,
            "period": period,
            "records": records
        }

    except ValueError:
        raise

    except Exception as error:
        raise ValueError(
            f"Unable to fetch historical data for symbol: {symbol}. Error: {str(error)}"
        ) from error

def get_historical_data(symbol: str, period: str = "1mo") -> Dict[str, Any]:
    symbol = normalize_symbol(symbol)

    return get_or_set_cache(
        key=f"history:{symbol}:{period}",
        fetch_function=lambda: _fetch_historical_data(symbol, period),
        ttl_seconds=600,
    )

def get_financial_statements(
    symbol: str,
    statement_type: str = "all",
    limit: int = 5
) -> Dict[str, Any]:
    """
    Fetches financial statements.

    statement_type options:
    - income
    - balance
    - cashflow
    - all

    Income statement tells:
    "How much money company earned and spent?"

    Balance sheet tells:
    "What company owns and owes?"

    Cash flow tells:
    "How cash is moving inside company?"
    """
    symbol = normalize_symbol(symbol)
    statement_type = statement_type.strip().lower()
    ticker = yf.Ticker(symbol)

    allowed_types = {"income", "balance", "cashflow", "all"}

    if statement_type not in allowed_types:
        raise ValueError(
            "Invalid statement_type. Use one of: income, balance, cashflow, all"
        )

    limit = max(1, min(limit, 20))

    try:
        result = {}

        if statement_type in ["income", "all"]:
            income_statement = ticker.income_stmt
            result["income_statement"] = dataframe_to_records(
                income_statement,
                limit=limit
            )

        if statement_type in ["balance", "all"]:
            balance_sheet = ticker.balance_sheet
            result["balance_sheet"] = dataframe_to_records(
                balance_sheet,
                limit=limit
            )

        if statement_type in ["cashflow", "all"]:
            cashflow = ticker.cashflow
            result["cashflow"] = dataframe_to_records(
                cashflow,
                limit=limit
            )

        return {
            "symbol": symbol,
            "statement_type": statement_type,
            "data": result,
        }

    except Exception as error:
        raise ValueError(
            f"Unable to fetch financial statements for symbol: {symbol}. Error: {str(error)}"
        ) from error


def get_recommendations(symbol: str, limit: int = 10) -> Dict[str, Any]:
    """
    Fetches analyst recommendations if available.

    Not every stock has recommendation data.
    So if data is empty, we return an empty list instead of crashing.
    """
    symbol = normalize_symbol(symbol)
    ticker = yf.Ticker(symbol)

    limit = max(1, min(limit, 50))

    try:
        recommendations = ticker.recommendations

        if recommendations is None or recommendations.empty:
            return {
                "symbol": symbol,
                "records": []
            }

        recommendations = recommendations.tail(limit).reset_index()

        records = []

        for _, row in recommendations.iterrows():
            item = {}

            for column in recommendations.columns:
                value = row[column]

                if isinstance(value, pd.Timestamp):
                    item[str(column)] = value.strftime("%Y-%m-%d")
                elif pd.isna(value):
                    item[str(column)] = None
                elif isinstance(value, float):
                    item[str(column)] = round(value, 2)
                else:
                    item[str(column)] = str(value)

            records.append(item)

        return {
            "symbol": symbol,
            "records": records
        }

    except Exception as error:
        raise ValueError(
            f"Unable to fetch recommendations for symbol: {symbol}. Error: {str(error)}"
        ) from error


def get_dividends(symbol: str, limit: int = 10) -> Dict[str, Any]:
    """
    Fetches dividend history.

    Dividend means company shares some profit with shareholders.
    Not every company pays dividends.
    Growth companies often pay no dividend.
    """
    symbol = normalize_symbol(symbol)
    ticker = yf.Ticker(symbol)

    limit = max(1, min(limit, 100))

    try:
        dividends = ticker.dividends

        if dividends is None or dividends.empty:
            return {
                "symbol": symbol,
                "records": []
            }

        dividends = dividends.tail(limit).reset_index()

        records = []

        for _, row in dividends.iterrows():
            date_value = row.iloc[0]
            dividend_value = row.iloc[1]

            records.append({
                "date": str(date_value),
                "dividend": safe_round(dividend_value, 4)
            })

        return {
            "symbol": symbol,
            "records": records
        }

    except Exception as error:
        raise ValueError(
            f"Unable to fetch dividends for symbol: {symbol}. Error: {str(error)}"
        ) from error