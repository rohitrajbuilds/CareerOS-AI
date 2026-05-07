from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Job
from app.schemas.jobs_api import JobCreateRequest, JobResponse


def _to_job_response(job: Job) -> JobResponse:
    return JobResponse(
        id=str(job.id),
        external_job_key=job.external_job_key,
        source_platform=job.source_platform,
        company_name=job.company_name,
        title=job.title,
        location=job.location,
        salary_text=job.salary_text,
        description_text=job.description_text,
        metadata_json=job.metadata_json,
        canonical_url=job.canonical_url,
    )


async def upsert_job(db: AsyncSession, payload: JobCreateRequest) -> Job:
    result = await db.execute(select(Job).where(Job.canonical_url == payload.canonical_url))
    job = result.scalar_one_or_none()
    if job is None:
        job = Job(
            source_platform=payload.source_platform,
            company_name=payload.company_name,
            title=payload.title,
            canonical_url=payload.canonical_url,
            location=payload.location,
            salary_text=payload.salary_text,
            description_text=payload.description_text,
            metadata_json=payload.metadata_json,
        )
        db.add(job)
    else:
        job.source_platform = payload.source_platform
        job.company_name = payload.company_name
        job.title = payload.title
        job.location = payload.location
        job.salary_text = payload.salary_text
        job.description_text = payload.description_text
        job.metadata_json = payload.metadata_json

    await db.flush()
    return job


async def list_jobs(db: AsyncSession) -> list[JobResponse]:
    result = await db.execute(select(Job).order_by(Job.created_at.desc()).limit(50))
    return [_to_job_response(job) for job in result.scalars().all()]


async def create_job(db: AsyncSession, payload: JobCreateRequest) -> JobResponse:
    job = await upsert_job(db, payload)
    await db.commit()
    await db.refresh(job)
    return _to_job_response(job)
