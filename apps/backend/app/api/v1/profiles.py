from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.profiles import ProfileResponse, ProfileUpsertRequest
from app.services.profile_service import get_profile, upsert_profile

router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
async def get_profile_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    return await get_profile(db, current_user)


@router.put("/me", response_model=ProfileResponse)
async def upsert_profile_route(
    payload: ProfileUpsertRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileResponse:
    return await upsert_profile(db, current_user, payload)
