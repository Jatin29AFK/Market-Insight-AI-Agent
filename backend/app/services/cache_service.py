import time
from typing import Any, Dict, Optional


class SimpleTTLCache:
    """
    A small in-memory cache with TTL.

    In-memory means:
    Data is stored inside the running Python process.

    TTL means:
    Cached data expires after a fixed number of seconds.

    This is not Redis.
    This is a simple beginner-friendly cache for local/demo use.
    """

    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        item = self._store.get(key)

        if not item:
            return None

        expires_at = item["expires_at"]

        if time.time() > expires_at:
            self._store.pop(key, None)
            return None

        return item["value"]

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        self._store[key] = {
            "value": value,
            "expires_at": time.time() + ttl_seconds,
        }

    def clear(self) -> None:
        self._store.clear()

    def stats(self) -> Dict[str, Any]:
        active_items = 0
        expired_items = 0
        current_time = time.time()

        for item in self._store.values():
            if current_time <= item["expires_at"]:
                active_items += 1
            else:
                expired_items += 1

        return {
            "total_items": len(self._store),
            "active_items": active_items,
            "expired_items": expired_items,
        }


cache = SimpleTTLCache()