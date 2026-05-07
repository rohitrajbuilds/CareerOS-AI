from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.base import Base
from app.db.session import engine
from app.middleware import RateLimitMiddleware, RequestContextMiddleware
from app.models import Application, Job, Profile, Resume, User
from app.services.cache import cache_service
from app.services.monitoring import monitoring_service
from app.services.rate_limiter import rate_limiter_service

settings = get_settings()
configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await cache_service.connect()
    await rate_limiter_service.connect()
    if settings.enable_db_auto_create:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
    yield
    await cache_service.close()
    await rate_limiter_service.close()
    await engine.dispose()


app = FastAPI(
    title="CareerOS AI API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(RequestContextMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    return {"service": "careeros-backend", "status": "ok"}


@app.get("/metrics", tags=["monitoring"])
async def metrics() -> dict[str, object]:
    snapshot = monitoring_service.snapshot()
    return {
        "request_count": snapshot.request_count,
        "error_count": snapshot.error_count,
        "route_counts": snapshot.route_counts,
    }
