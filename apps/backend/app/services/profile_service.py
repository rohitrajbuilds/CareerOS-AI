from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Profile, User
from app.schemas.profiles import ProfileResponse, ProfileUpsertRequest


async def get_or_create_profile(db: AsyncSession, user: User) -> Profile:
    result = await db.execute(select(Profile).where(Profile.user_id == user.id))
    profile = result.scalar_one_or_none()
    if profile is None:
        profile = Profile(user_id=user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def get_profile(db: AsyncSession, user: User) -> ProfileResponse:
    profile = await get_or_create_profile(db, user)
    return ProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        phone=profile.phone,
        linkedInUrl=profile.linked_in_url,
        githubUrl=profile.github_url,
        portfolioUrl=profile.portfolio_url,
        sponsorshipStatus=profile.sponsorship_status,
        education=profile.education,
        workExperience=profile.work_experience,
    )


async def upsert_profile(db: AsyncSession, user: User, payload: ProfileUpsertRequest) -> ProfileResponse:
    profile = await get_or_create_profile(db, user)
    profile.phone = payload.phone
    profile.linked_in_url = str(payload.linkedInUrl) if payload.linkedInUrl else None
    profile.github_url = str(payload.githubUrl) if payload.githubUrl else None
    profile.portfolio_url = str(payload.portfolioUrl) if payload.portfolioUrl else None
    profile.sponsorship_status = payload.sponsorshipStatus
    profile.education = [entry.model_dump() for entry in payload.education]
    profile.work_experience = [entry.model_dump() for entry in payload.workExperience]
    await db.commit()
    await db.refresh(profile)
    return await get_profile(db, user)
