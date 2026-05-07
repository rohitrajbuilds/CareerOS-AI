from __future__ import annotations

import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.logging import get_logger
from app.services.monitoring import monitoring_service

logger = get_logger(__name__)


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-Id", str(uuid.uuid4()))
        request.state.request_id = request_id
        started_at = time.perf_counter()
        errored = False

        try:
            response = await call_next(request)
            return response
        except Exception:
            errored = True
            raise
        finally:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            route = request.url.path
            monitoring_service.record_request(route, errored=errored)
            logger.info(
                "request_completed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": route,
                    "duration_ms": duration_ms,
                    "errored": errored,
                },
            )
            if "response" in locals():
                response.headers["X-Request-Id"] = request_id
