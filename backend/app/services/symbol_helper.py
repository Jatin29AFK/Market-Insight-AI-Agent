from app.services.symbol_helper import suggest_symbol

suggestion = suggest_symbol(symbol)

if suggestion:
    raise InvalidSymbolError(
        f"No price data found for '{symbol}'. Did you mean '{suggestion}'?"
    )

COMMON_SYMBOL_FIXES = {
    "TESLA": "TSLA",
    "GOOGLE": "GOOGL",
    "ALPHABET": "GOOGL",
    "APPLE": "AAPL",
    "MICROSOFT": "MSFT",
    "NVIDIA": "NVDA",
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFC": "HDFCBANK.NS",
}


def suggest_symbol(symbol: str) -> str | None:
    clean_symbol = symbol.strip().upper()
    return COMMON_SYMBOL_FIXES.get(clean_symbol)