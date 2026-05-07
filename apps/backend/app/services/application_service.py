from __future__ import annotations

from uuid import UUID

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
from app.services.application_domain import (
    RESPONSE_RECEIVED_STATUSES,
    build_application_analytics_response,
    create_history_event,
    to_application_response,
    utc_now_iso,
)
from app.services.cache import cache_service
from app.services.cache_keys import application_analytics_cache_key
from app.services.job_service import upsert_job


async def list_applications(db: AsyncSession, user: User) -> list[ApplicationResponse]:
    result = await db.execute(
        select(Application)
        .where(Application.user_id == user.id)
        .options(selectinload(Application.job))
        .order_by(Application.updated_at.desc())
    )
    applications = result.scalars().unique().all()
    return [to_application_response(application) for application in applications]


async def create_application(
    db: AsyncSession,
    user: User,
    payload: ApplicationCreateRequest,
) -> ApplicationResponse:
    job = await upsert_job(db, payload.job)
    now = utc_now_iso()
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
        history=[create_history_event(payload.status, payload.notes, created_at=now)],
    )
    db.add(application)
    await db.commit()
    refreshed = await db.execute(
        select(Application).where(Application.id == application.id).options(selectinload(Application.job))
    )
    created = refreshed.scalar_one()
    await cache_service.delete(application_analytics_cache_key(user.id))
    return to_application_response(created)


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
            create_history_event(payload.status, payload.notes),
        ]
        if payload.status in RESPONSE_RECEIVED_STATUSES:
            application.last_response_at = utc_now_iso()
        if application.applied_at is None and payload.status != "saved":
            application.applied_at = utc_now_iso()
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
    await cache_service.delete(application_analytics_cache_key(user.id))
    return to_application_response(application)


async def get_application_analytics(db: AsyncSession, user: User) -> ApplicationAnalyticsResponse:
    cache_key = application_analytics_cache_key(user.id)
    cached = await cache_service.get_json(cache_key)
    if cached is not None:
        return ApplicationAnalyticsResponse(**cached)

    result = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.user_id == user.id)
        .group_by(Application.status)
    )
    status_counts = {status_name: count for status_name, count in result.all()}
    response = build_application_analytics_response(status_counts)
    await cache_service.set_json(
        cache_key,
        response.model_dump(),
        ttl_seconds=get_settings().analytics_cache_ttl_seconds,
    )
    return response
