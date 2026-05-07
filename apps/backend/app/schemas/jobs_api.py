from pydantic import BaseModel


class JobCreateRequest(BaseModel):
    source_platform: str
    company_name: str
    title: str
    canonical_url: str
    location: str | None = None
    salary_text: str | None = None
    description_text: str | None = None
    metadata_json: dict = {}


class JobResponse(BaseModel):
    id: str
    external_job_key: str | None
    source_platform: str
    company_name: str
    title: str
    location: str | None
    salary_text: str | None
    description_text: str | None
    metadata_json: dict
    canonical_url: str
