from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.resumes import ResumeCreateRequest, ResumeResponse
from app.services.resume_service import create_resume, list_resumes

router = APIRouter()


@router.get("/", response_model=list[ResumeResponse])
async def list_resumes_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ResumeResponse]:
    return await list_resumes(db, current_user)


@router.post("/", response_model=ResumeResponse)
async def create_resume_route(
    payload: ResumeCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeResponse:
    return await create_resume(db, current_user, payload)
