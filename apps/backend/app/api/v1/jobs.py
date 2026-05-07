from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.jobs import JobAnalysisRequest, JobAnalysisResponse
from app.schemas.jobs_api import JobCreateRequest, JobResponse
from app.api.deps import get_db
from app.services.analytics.job_analysis import analyze_job_fit
from app.services.job_service import create_job, list_jobs

router = APIRouter()


@router.get("/", response_model=list[JobResponse])
async def list_jobs_route(
    db: AsyncSession = Depends(get_db),
) -> list[JobResponse]:
    return await list_jobs(db)


@router.post("/", response_model=JobResponse)
async def create_job_route(
    payload: JobCreateRequest,
    db: AsyncSession = Depends(get_db),
) -> JobResponse:
    return await create_job(db, payload)


@router.post("/analyze", response_model=JobAnalysisResponse)
async def analyze_job(request: JobAnalysisRequest) -> JobAnalysisResponse:
    return analyze_job_fit(request)
