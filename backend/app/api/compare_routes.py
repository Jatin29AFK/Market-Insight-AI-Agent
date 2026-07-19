from fastapi import APIRouter, HTTPException

from app.schemas.compare_schema import CompareStocksRequest
from app.services.compare_service import compare_stocks


router = APIRouter(prefix="/api/compare", tags=["Compare"])


@router.post("/stocks")
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

    try:
        return compare_stocks(symbols)
    except Exception as error:
        return {
            "stocks": [
                {
                    "symbol": symbol.strip().upper(),
                    "error": "Could not load comparison data right now. Please try again shortly.",
                }
                for symbol in symbols
            ],
            "summary": {
                "requested_count": len(symbols),
                "successful_count": 0,
                "failed_count": len(symbols),
                "successful_symbols": [],
                "failed_symbols": [symbol.strip().upper() for symbol in symbols],
                "fields": [],
                "error": f"Unexpected error while comparing stocks: {str(error)}",
            },
        }
