COMMON_SYMBOL_FIXES = {
    "TESLA": "TSLA",
    "GOOGLE": "GOOGL",
    "ALPHABET": "GOOGL",
    "APPLE": "AAPL",
    "MICROSOFT": "MSFT",
    "NVIDIA": "NVDA",
    "META": "META",
    "AMAZON": "AMZN",

    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFC": "HDFCBANK.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "SBIN": "SBIN.NS",
    "ICICI": "ICICIBANK.NS",
}


def suggest_symbol(symbol: str) -> str | None:
    clean_symbol = symbol.strip().upper()
    return COMMON_SYMBOL_FIXES.get(clean_symbol)