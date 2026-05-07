from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    total_users: int
    total_resumes: int
    total_jobs: int
    total_applications: int
    active_applications: int
    response_rate: int
    interview_rate: int
