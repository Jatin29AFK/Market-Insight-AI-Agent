from fastapi import APIRouter, HTTPException

from app.schemas.ai_schema import (
    StockAnalysisRequest,
    StockAnalysisResponse,
)

from app.services.ai_service import analyze_stock_with_ai


router = APIRouter(prefix="/api/ai", tags=["AI Analysis"])


@router.post("/analyze", response_model=StockAnalysisResponse)
def analyze_stock(request: StockAnalysisRequest):
    try:
        return analyze_stock_with_ai(
            symbol=request.symbol,
            question=request.question,
            period=request.period
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during AI analysis: {str(error)}"
        )