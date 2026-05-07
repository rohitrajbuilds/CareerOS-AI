from pydantic import BaseModel, HttpUrl


class EducationEntryPayload(BaseModel):
    institution: str
    degree: str
    fieldOfStudy: str
    startDate: str | None = None
    endDate: str | None = None
    description: str | None = None


class WorkExperienceEntryPayload(BaseModel):
    company: str
    title: str
    startDate: str | None = None
    endDate: str | None = None
    location: str | None = None
    summary: str | None = None


class ProfileUpsertRequest(BaseModel):
    phone: str | None = None
    linkedInUrl: HttpUrl | None = None
    githubUrl: HttpUrl | None = None
    portfolioUrl: HttpUrl | None = None
    sponsorshipStatus: str = "other"
    education: list[EducationEntryPayload] = []
    workExperience: list[WorkExperienceEntryPayload] = []


class ProfileResponse(ProfileUpsertRequest):
    id: str
    user_id: str
