from pydantic import BaseModel
from typing import Dict, Any, Optional


class StockAnalysisRequest(BaseModel):
    symbol: str
    question: Optional[str] = "Analyze this stock in simple language"
    period: str = "1mo"


class StockAnalysisResponse(BaseModel):
    symbol: str
    question: str
    insight: str
    data_used: Dict[str, Any]