from typing import Any, Callable

from app.services.cache_service import cache


def get_or_set_cache(
    key: str,
    fetch_function: Callable[[], Any],
    ttl_seconds: int,
) -> Any:
    """
    Generic cache wrapper.

    Step 1:
    Check if key exists in cache.

    Step 2:
    If yes, return cached value.

    Step 3:
    If no, call fetch_function.

    Step 4:
    Store result in cache.

    Step 5:
    Return result.
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