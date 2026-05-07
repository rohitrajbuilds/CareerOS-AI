from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Application, Job, Resume, User
from app.schemas.analytics_api import AnalyticsSummaryResponse


async def get_analytics_summary(db: AsyncSession) -> AnalyticsSummaryResponse:
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_resumes = await db.scalar(select(func.count(Resume.id))) or 0
    total_jobs = await db.scalar(select(func.count(Job.id))) or 0
    total_applications = await db.scalar(select(func.count(Application.id))) or 0
    active_applications = await db.scalar(
        select(func.count(Application.id)).where(Application.status.in_(["saved", "applied", "interviewing"]))
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
        response_rate=round((responded / total_applications) * 100) if total_applications else 0,
        interview_rate=round((interviews / total_applications) * 100) if total_applications else 0,
    )
