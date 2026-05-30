from typing import Any, Dict, List

from app.core.logger import get_logger
from app.services.stock_service import get_stock_snapshot, normalize_symbol


logger = get_logger(__name__)


COMPARE_FIELDS = [
    "symbol",
    "company_name",
    "current_price",
    "currency",
    "market_cap",
    "trailing_pe",
    "eps",
    "revenue_growth",
    "profit_margins",
    "beta",
    "fifty_two_week_high",
    "fifty_two_week_low",
]


def _build_compare_record(symbol: str) -> Dict[str, Any]:
    snapshot = get_stock_snapshot(symbol)
    company = snapshot.get("company", {})
    price = snapshot.get("price", {})
    key_metrics = snapshot.get("key_metrics", {})

    return {
        "symbol": snapshot.get("symbol", symbol),
        "company_name": company.get("name"),
        "current_price": price.get("current_price"),
        "currency": price.get("currency"),
        "market_cap": key_metrics.get("market_cap") or price.get("market_cap"),
        "trailing_pe": key_metrics.get("trailing_pe"),
        "eps": key_metrics.get("eps"),
        "revenue_growth": key_metrics.get("revenue_growth"),
        "profit_margins": key_metrics.get("profit_margins"),
        "beta": key_metrics.get("beta"),
        "fifty_two_week_high": key_metrics.get("fifty_two_week_high"),
        "fifty_two_week_low": key_metrics.get("fifty_two_week_low"),
    }


def compare_stocks(symbols: List[str]) -> Dict[str, Any]:
    normalized_symbols = []

    for symbol in symbols:
        normalized = normalize_symbol(symbol)

        if normalized and normalized not in normalized_symbols:
            normalized_symbols.append(normalized)

    logger.info("compare requested symbols=%s", normalized_symbols)

    stocks = []
    successful_symbols = []
    failed_symbols = []

    for symbol in normalized_symbols:
        try:
            record = _build_compare_record(symbol)
            stocks.append(record)
            successful_symbols.append(symbol)
        except Exception as error:
            logger.exception("compare failed symbol=%s error=%s", symbol, error)
            stocks.append({
                "symbol": symbol,
                "error": str(error),
            })
            failed_symbols.append(symbol)

    summary = {
        "requested_count": len(normalized_symbols),
        "successful_count": len(successful_symbols),
        "failed_count": len(failed_symbols),
        "successful_symbols": successful_symbols,
        "failed_symbols": failed_symbols,
        "fields": COMPARE_FIELDS,
    }

    logger.info(
        "compare completed requested=%s success=%s failed=%s",
        len(normalized_symbols),
        len(successful_symbols),
        len(failed_symbols),
    )

    return {
        "stocks": stocks,
        "summary": summary,
    }
