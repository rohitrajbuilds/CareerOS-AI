from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.models import Application, User
from app.schemas.applications_api import (
    ApplicationAnalyticsResponse,
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationUpdateRequest,
)
from app.services.cache import cache_service
from app.services.job_service import upsert_job


def _to_application_response(application: Application) -> ApplicationResponse:
    return ApplicationResponse(
        id=str(application.id),
        user_id=str(application.user_id),
        job_id=str(application.job_id),
        company_name=application.job.company_name,
        title=application.job.title,
        status=application.status,
        priority=application.priority,
        source_url=application.source_url,
        notes=application.notes,
        interview_count=application.interview_count,
        tags=application.tags,
        history=application.history,
        last_response_at=application.last_response_at,
        applied_at=application.applied_at,
        canonical_url=application.job.canonical_url,
        source_platform=application.job.source_platform,
    )


async def list_applications(db: AsyncSession, user: User) -> list[ApplicationResponse]:
    result = await db.execute(
        select(Application)
        .where(Application.user_id == user.id)
        .options(selectinload(Application.job))
        .order_by(Application.updated_at.desc())
    )
    applications = result.scalars().unique().all()
    return [_to_application_response(application) for application in applications]


async def create_application(
    db: AsyncSession,
    user: User,
    payload: ApplicationCreateRequest,
) -> ApplicationResponse:
    job = await upsert_job(db, payload.job)
    now = datetime.now(timezone.utc).isoformat()
    application = Application(
        user_id=user.id,
        job_id=job.id,
        status=payload.status,
        priority=payload.priority,
        source_url=payload.source_url,
        notes=payload.notes,
        tags=payload.tags,
        interview_count=1 if payload.status == "interviewing" else 0,
        applied_at=now if payload.status != "saved" else None,
        history=[
            {
                "id": str(uuid4()),
                "status": payload.status,
                "createdAt": now,
                "note": payload.notes,
            }
        ],
    )
    db.add(application)
    await db.commit()
    refreshed = await db.execute(
        select(Application).where(Application.id == application.id).options(selectinload(Application.job))
    )
    created = refreshed.scalar_one()
    await cache_service.delete(f"application_analytics:{user.id}")
    return _to_application_response(created)


async def update_application(
    db: AsyncSession,
    user: User,
    application_id: str,
    payload: ApplicationUpdateRequest,
) -> ApplicationResponse:
    result = await db.execute(
        select(Application)
        .where(Application.user_id == user.id, Application.id == UUID(application_id))
    )
    application = result.scalar_one_or_none()
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if payload.status:
        application.status = payload.status
        application.history = [
            *application.history,
            {
                "id": str(uuid4()),
                "status": payload.status,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "note": payload.notes,
            },
        ]
        if payload.status in {"interviewing", "offer", "rejected"}:
            application.last_response_at = datetime.now(timezone.utc).isoformat()
        if application.applied_at is None and payload.status != "saved":
            application.applied_at = datetime.now(timezone.utc).isoformat()
    if payload.priority:
        application.priority = payload.priority
    if payload.notes is not None:
        application.notes = payload.notes
    if payload.interview_count is not None:
        application.interview_count = payload.interview_count
    if payload.tags is not None:
        application.tags = payload.tags

    await db.commit()
    refreshed = await db.execute(
        select(Application).where(Application.id == application.id).options(selectinload(Application.job))
    )
    application = refreshed.scalar_one()
    await cache_service.delete(f"application_analytics:{user.id}")
    return _to_application_response(application)


async def get_application_analytics(db: AsyncSession, user: User) -> ApplicationAnalyticsResponse:
    cache_key = f"application_analytics:{user.id}"
    cached = await cache_service.get_json(cache_key)
    if cached is not None:
        return ApplicationAnalyticsResponse(**cached)

    result = await db.execute(select(Application.status, func.count(Application.id)).where(Application.user_id == user.id).group_by(Application.status))
    status_counts = {status: count for status, count in result.all()}
    total = sum(status_counts.values())
    active = sum(status_counts.get(status, 0) for status in ("saved", "applied", "interviewing"))
    interviews = status_counts.get("interviewing", 0) + status_counts.get("offer", 0)
    rejections = status_counts.get("rejected", 0)
    offers = status_counts.get("offer", 0)
    responded = interviews + rejections

    response = ApplicationAnalyticsResponse(
        total_applications=total,
        active_applications=active,
        interview_count=interviews,
        rejection_count=rejections,
        offer_count=offers,
        response_rate=round((responded / total) * 100) if total else 0,
        interview_rate=round((interviews / total) * 100) if total else 0,
        rejection_rate=round((rejections / total) * 100) if total else 0,
        status_counts={
            status_name: status_counts.get(status_name, 0)
            for status_name in ("saved", "applied", "interviewing", "offer", "rejected", "withdrawn")
        },
    )
    await cache_service.set_json(
        cache_key,
        response.model_dump(),
        ttl_seconds=get_settings().analytics_cache_ttl_seconds,
    )
    return response
