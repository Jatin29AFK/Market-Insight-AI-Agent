class StockAppError(Exception):
    """
    Base exception for our stock app.
    """

    status_code = 400
    user_message = "Something went wrong."


class InvalidSymbolError(StockAppError):
    """
    Used when stock symbol is invalid or no data is found.
    """

    status_code = 404
    user_message = "Stock symbol was not found. Please check the ticker symbol."


class ExternalDataError(StockAppError):
    """
    Used when yFinance or external market data provider fails.
    """

    status_code = 502
    user_message = "Market data provider is temporarily unavailable."


class AIServiceError(StockAppError):
    """
    Used when Groq / LLM / agent service fails.
    """

    status_code = 502
    user_message = "AI service is temporarily unavailable."