from fastapi import APIRouter

from app.schemas.jobs import JobAnalysisRequest, JobAnalysisResponse
from app.services.analytics.job_analysis import analyze_job_fit

router = APIRouter()


@router.get("/")
async def list_jobs() -> dict[str, str]:
    return {"status": "not-implemented"}


@router.post("/analyze", response_model=JobAnalysisResponse)
async def analyze_job(request: JobAnalysisRequest) -> JobAnalysisResponse:
    return analyze_job_fit(request)
