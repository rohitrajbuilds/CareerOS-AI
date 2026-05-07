from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.applications_api import (
    ApplicationAnalyticsResponse,
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationUpdateRequest,
)
from app.services.application_service import (
    create_application,
    get_application_analytics,
    list_applications,
    update_application,
)

router = APIRouter()


@router.get("/", response_model=list[ApplicationResponse])
async def list_applications_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ApplicationResponse]:
    return await list_applications(db, current_user)


@router.post("/", response_model=ApplicationResponse)
async def create_application_route(
    payload: ApplicationCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationResponse:
    return await create_application(db, current_user, payload)


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application_route(
    application_id: str,
    payload: ApplicationUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationResponse:
    return await update_application(db, current_user, application_id, payload)


@router.get("/analytics/summary", response_model=ApplicationAnalyticsResponse)
async def get_application_analytics_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApplicationAnalyticsResponse:
    return await get_application_analytics(db, current_user)
