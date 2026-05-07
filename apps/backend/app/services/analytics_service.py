from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application, Job, Resume, User
from app.schemas.analytics_api import AnalyticsSummaryResponse
from app.services.application_domain import ACTIVE_APPLICATION_STATUSES, calculate_percentage


async def get_analytics_summary(db: AsyncSession) -> AnalyticsSummaryResponse:
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_resumes = await db.scalar(select(func.count(Resume.id))) or 0
    total_jobs = await db.scalar(select(func.count(Job.id))) or 0
    total_applications = await db.scalar(select(func.count(Application.id))) or 0
    active_applications = await db.scalar(
        select(func.count(Application.id)).where(Application.status.in_(ACTIVE_APPLICATION_STATUSES))
    ) or 0
    interviews = await db.scalar(
        select(func.count(Application.id)).where(Application.status.in_(["interviewing", "offer"]))
    ) or 0
    rejections = await db.scalar(
        select(func.count(Application.id)).where(Application.status == "rejected")
    ) or 0
    responded = interviews + rejections

    return AnalyticsSummaryResponse(
        total_users=total_users,
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        total_applications=total_applications,
        active_applications=active_applications,
        response_rate=calculate_percentage(responded, total_applications),
        interview_rate=calculate_percentage(interviews, total_applications),
    )
