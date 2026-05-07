from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def extension_health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", service="careeros-backend", environment=settings.environment)
