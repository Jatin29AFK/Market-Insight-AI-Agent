from typing import Any

from pydantic import BaseModel


class CompareStocksRequest(BaseModel):
    symbols: list[str]


class CompareStocksResponse(BaseModel):
    stocks: list[dict[str, Any]]
    summary: dict[str, Any]
