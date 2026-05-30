from typing import Any, Callable

from app.services.cache_service import cache


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
        return cached_value

    fresh_value = fetch_function()

    cache.set(
        key=key,
        value=fresh_value,
        ttl_seconds=ttl_seconds,
    )

    return fresh_value