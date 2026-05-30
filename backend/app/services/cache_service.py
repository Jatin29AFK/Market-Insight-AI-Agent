import time
from typing import Any, Dict, Optional


class SimpleTTLCache:
    """
    Simple in-memory TTL cache.

    In-memory means:
    Data is stored inside the running FastAPI server.

    TTL means:
    Time To Live. After this time, cached data expires.
    """

    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        item = self._store.get(key)

        if item is None:
            return None

        if time.time() > item["expires_at"]:
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

    def stats(self) -> Dict[str, int]:
        active_items = 0
        expired_items = 0
        now = time.time()

        for item in self._store.values():
            if now <= item["expires_at"]:
                active_items += 1
            else:
                expired_items += 1

        return {
            "total_items": len(self._store),
            "active_items": active_items,
            "expired_items": expired_items,
        }


cache = SimpleTTLCache()