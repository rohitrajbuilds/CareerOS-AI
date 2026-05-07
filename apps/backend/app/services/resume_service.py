from __future__ import annotations

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Resume, User
from app.schemas.resumes import ResumeCreateRequest, ResumeResponse


def _to_resume_response(resume: Resume) -> ResumeResponse:
    return ResumeResponse(
        id=str(resume.id),
        user_id=str(resume.user_id),
        title=resume.title,
        file_name=resume.file_name,
        storage_url=resume.storage_url,
        raw_text=resume.raw_text,
        parsed_data=resume.parsed_data,
        tags=resume.tags,
        is_primary=resume.is_primary,
    )


async def list_resumes(db: AsyncSession, user: User) -> list[ResumeResponse]:
    result = await db.execute(select(Resume).where(Resume.user_id == user.id).order_by(Resume.created_at.desc()))
    return [_to_resume_response(resume) for resume in result.scalars().all()]


async def create_resume(db: AsyncSession, user: User, payload: ResumeCreateRequest) -> ResumeResponse:
    if payload.is_primary:
        await db.execute(update(Resume).where(Resume.user_id == user.id).values(is_primary=False))

    resume = Resume(
        user_id=user.id,
        title=payload.title,
        file_name=payload.file_name,
        storage_url=payload.storage_url,
        raw_text=payload.raw_text,
        tags=payload.tags,
        is_primary=payload.is_primary,
        parsed_data={"summary": (payload.raw_text or "")[:300]},
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return _to_resume_response(resume)
