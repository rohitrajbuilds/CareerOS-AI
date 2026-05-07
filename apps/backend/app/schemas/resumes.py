from pydantic import BaseModel, Field


class ResumeCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    file_name: str = Field(min_length=1, max_length=255)
    raw_text: str | None = None
    storage_url: str | None = None
    tags: list[str] = []
    is_primary: bool = False


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    file_name: str
    storage_url: str | None
    raw_text: str | None
    parsed_data: dict
    tags: list[str]
    is_primary: bool
