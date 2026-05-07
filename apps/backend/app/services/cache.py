from __future__ import annotations

import json
import time
from typing import Any

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import get_settings


class CacheService:
    def __init__(self) -> None:
        self._client: Redis | None = None
        self._memory_cache: dict[str, tuple[float, Any]] = {}

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

    async def get_json(self, key: str) -> Any | None:
        if self._client is not None:
            try:
                value = await self._client.get(key)
                if value is not None:
                    return json.loads(value)
            except RedisError:
                self._client = None

        cached = self._memory_cache.get(key)
        if not cached:
            return None
        expires_at, payload = cached
        if expires_at < time.time():
            self._memory_cache.pop(key, None)
            return None
        return payload

    async def set_json(self, key: str, value: Any, ttl_seconds: int) -> None:
        if self._client is not None:
            try:
                await self._client.set(key, json.dumps(value), ex=ttl_seconds)
            except RedisError:
                self._client = None
        self._memory_cache[key] = (time.time() + ttl_seconds, value)

    async def delete(self, key: str) -> None:
        if self._client is not None:
            try:
                await self._client.delete(key)
            except RedisError:
                self._client = None
        self._memory_cache.pop(key, None)


cache_service = CacheService()
