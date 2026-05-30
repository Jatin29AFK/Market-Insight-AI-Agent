from typing import Any

from pydantic import BaseModel, Field


class CompareStocksRequest(BaseModel):
    symbols: list[str] = Field(..., min_length=1, max_length=5)


class CompareStocksResponse(BaseModel):
    stocks: list[dict[str, Any]]
    summary: dict[str, Any]
