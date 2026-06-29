import time
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

_store: dict[str, tuple[Any, float]] = {}


def get(key: str) -> Optional[Any]:
    entry = _store.get(key)
    if entry is None:
        return None
    value, expires_at = entry
    if time.time() > expires_at:
        del _store[key]
        return None
    return value


def set(key: str, value: Any, ttl: int) -> None:
    _store[key] = (value, time.time() + ttl)
    logger.debug("Cache SET key=%s ttl=%ds", key, ttl)


def delete(key: str) -> None:
    _store.pop(key, None)


def clear() -> None:
    _store.clear()
    logger.info("Cache cleared")


def stats() -> dict:
    now = time.time()
    total = len(_store)
    expired = sum(1 for _, (_, exp) in _store.items() if now > exp)
    return {"total_keys": total, "expired_keys": expired, "live_keys": total - expired}
