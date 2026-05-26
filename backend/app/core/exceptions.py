class StockAppError(Exception):
    """
    Base error for our application.
    """

    status_code = 400
    user_message = "Something went wrong."


class InvalidSymbolError(StockAppError):
    """
    Raised when stock symbol is invalid or data is unavailable.
    """

    status_code = 404
    user_message = "Stock symbol was not found. Please check the ticker symbol."


class ExternalDataError(StockAppError):
    """
    Raised when yFinance or external data source fails.
    """

    status_code = 502
    user_message = "Market data provider is temporarily unavailable."


class AIServiceError(StockAppError):
    """
    Raised when LLM/agent service fails.
    """

    status_code = 502
    user_message = "AI service is temporarily unavailable."