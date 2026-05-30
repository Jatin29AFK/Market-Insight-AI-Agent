from typing import Any, Callable

from app.core.logger import get_logger
from app.services.cache_service import cache


logger = get_logger(__name__)


def get_or_set_cache(
    key: str,
    fetch_function: Callable[[], Any],
    ttl_seconds: int,
) -> Any:
    """
    Generic cache wrapper.

    1. Check cache.
    2. If cached value exists, return it.
    3. If not, call fetch_function.
    4. Store fresh value in cache.
    5. Return fresh value.
    """

    cached_value = cache.get(key)

    if cached_value is not None:
        logger.info("cache hit key=%s", key)
        return cached_value

    logger.info("cache miss key=%s", key)
    fresh_value = fetch_function()

    cache.set(
        key=key,
        value=fresh_value,
        ttl_seconds=ttl_seconds,
    )

    logger.info("cache set key=%s ttl_seconds=%s", key, ttl_seconds)
    return fresh_value
