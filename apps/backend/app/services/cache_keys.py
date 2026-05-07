from __future__ import annotations

from uuid import UUID


def application_analytics_cache_key(user_id: UUID) -> str:
    return f"application_analytics:{user_id}"
