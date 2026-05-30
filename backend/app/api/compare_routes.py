from fastapi import APIRouter, HTTPException

from app.schemas.compare_schema import CompareStocksRequest, CompareStocksResponse
from app.services.compare_service import compare_stocks


router = APIRouter(prefix="/api/compare", tags=["Compare"])


@router.post("/stocks", response_model=CompareStocksResponse)
def compare_stock_snapshots(request: CompareStocksRequest):
    symbols = [symbol for symbol in request.symbols if symbol.strip()]

    if not symbols:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one stock symbol.",
        )

    if len(symbols) > 5:
        raise HTTPException(
            status_code=400,
            detail="You can compare up to 5 stocks at a time.",
        )

    return compare_stocks(symbols)
