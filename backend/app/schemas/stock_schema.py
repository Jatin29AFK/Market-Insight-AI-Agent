from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class StockRequest(BaseModel):
    symbol: str


class HistoricalRequest(BaseModel):
    symbol: str
    period: str = "1mo"


class FinancialStatementRequest(BaseModel):
    symbol: str
    statement_type: str = "all"
    limit: int = 5


class DividendRequest(BaseModel):
    symbol: str
    limit: int = 10


class RecommendationRequest(BaseModel):
    symbol: str
    limit: int = 10


class StockPriceResponse(BaseModel):
    symbol: str
    current_price: Optional[float]
    currency: Optional[str]
    previous_close: Optional[float]
    day_high: Optional[float]
    day_low: Optional[float]


class CompanyInfoResponse(BaseModel):
    symbol: str
    name: Optional[str]
    sector: Optional[str]
    industry: Optional[str]
    website: Optional[str]
    summary: Optional[str]


class HistoricalDataResponse(BaseModel):
    symbol: str
    period: str
    records: List[Dict[str, Any]]


class StockSnapshotResponse(BaseModel):
    symbol: str
    company: Dict[str, Any]
    price: Dict[str, Any]
    key_metrics: Dict[str, Any]


class FinancialStatementResponse(BaseModel):
    symbol: str
    statement_type: str
    data: Dict[str, Any]


class DividendResponse(BaseModel):
    symbol: str
    records: List[Dict[str, Any]]


class RecommendationResponse(BaseModel):
    symbol: str
    records: List[Dict[str, Any]]