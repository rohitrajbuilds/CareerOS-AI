from __future__ import annotations

import time

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings


class RateLimiterService:
    def __init__(self) -> None:
        self._client: Redis | None = None
        self._counters: dict[str, tuple[int, float]] = {}

    async def connect(self) -> None:
        settings = get_settings()
        try:
            self._client = Redis.from_url(settings.redis_url, decode_responses=True)
            await self._client.ping()
        except RedisError:
            self._client = None

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def allow(self, key: str, limit: int, window_seconds: int) -> bool:
        now = time.time()
        if self._client is not None:
            counter_key = f"rate_limit:{key}"
            try:
                current = await self._client.incr(counter_key)
                if current == 1:
                    await self._client.expire(counter_key, window_seconds)
                return current <= limit
            except RedisError:
                self._client = None

        current_count, expires_at = self._counters.get(key, (0, now + window_seconds))
        if expires_at <= now:
            current_count = 0
            expires_at = now + window_seconds
        current_count += 1
        self._counters[key] = (current_count, expires_at)
        return current_count <= limit


rate_limiter_service = RateLimiterService()
