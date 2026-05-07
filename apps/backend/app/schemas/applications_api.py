from pydantic import BaseModel, Field


class JobPayload(BaseModel):
    source_platform: str
    company_name: str
    title: str
    canonical_url: str
    location: str | None = None
    salary_text: str | None = None
    description_text: str | None = None
    metadata_json: dict = {}


class ApplicationCreateRequest(BaseModel):
    job: JobPayload
    status: str = "saved"
    priority: str = "medium"
    source_url: str
    notes: str | None = None
    tags: list[str] = []


class ApplicationUpdateRequest(BaseModel):
    status: str | None = None
    priority: str | None = None
    notes: str | None = None
    interview_count: int | None = Field(default=None, ge=0)
    tags: list[str] | None = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    company_name: str
    title: str
    status: str
    priority: str
    source_url: str
    notes: str | None
    interview_count: int
    tags: list[str]
    history: list[dict]
    last_response_at: str | None
    applied_at: str | None
    canonical_url: str
    source_platform: str


class ApplicationAnalyticsResponse(BaseModel):
    total_applications: int
    active_applications: int
    interview_count: int
    rejection_count: int
    offer_count: int
    response_rate: int
    interview_rate: int
    rejection_rate: int
    status_counts: dict[str, int]
