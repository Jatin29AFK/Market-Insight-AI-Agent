from fastapi import APIRouter, HTTPException

from app.schemas.stock_schema import (
    StockRequest,
    HistoricalRequest,
    FinancialStatementRequest,
    DividendRequest,
    RecommendationRequest,
    StockPriceResponse,
    CompanyInfoResponse,
    HistoricalDataResponse,
    StockSnapshotResponse,
    FinancialStatementResponse,
    DividendResponse,
    RecommendationResponse,
)

from app.services.stock_service import (
    get_stock_price,
    get_company_info,
    get_historical_data,
    get_stock_snapshot,
    get_financial_statements,
    get_recommendations,
    get_dividends,
)


router = APIRouter(prefix="/api/stocks", tags=["Stocks"])


@router.post("/price", response_model=StockPriceResponse)
def fetch_stock_price(request: StockRequest):
    try:
        return get_stock_price(request.symbol)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/company-info", response_model=CompanyInfoResponse)
def fetch_company_info(request: StockRequest):
    try:
        return get_company_info(request.symbol)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/history", response_model=HistoricalDataResponse)
def fetch_stock_history(request: HistoricalRequest):
    try:
        return get_historical_data(request.symbol, request.period)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/snapshot", response_model=StockSnapshotResponse)
def fetch_stock_snapshot(request: StockRequest):
    try:
        return get_stock_snapshot(request.symbol)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/financials", response_model=FinancialStatementResponse)
def fetch_financial_statements(request: FinancialStatementRequest):
    try:
        return get_financial_statements(
            symbol=request.symbol,
            statement_type=request.statement_type,
            limit=request.limit
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/recommendations", response_model=RecommendationResponse)
def fetch_recommendations(request: RecommendationRequest):
    try:
        return get_recommendations(
            symbol=request.symbol,
            limit=request.limit
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/dividends", response_model=DividendResponse)
def fetch_dividends(request: DividendRequest):
    try:
        return get_dividends(
            symbol=request.symbol,
            limit=request.limit
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))