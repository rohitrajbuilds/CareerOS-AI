from typing import Literal

from pydantic import BaseModel, Field


AiResponseType = Literal[
    "cover_letter",
    "why_company",
    "short_answer",
    "experience_summary",
    "technical_answer",
]


class JobPageContext(BaseModel):
    provider: str
    url: str
    companyName: str | None = None
    roleTitle: str | None = None
    questionLabel: str | None = None
    jobDescription: str | None = None
    nearbyText: list[str] = Field(default_factory=list)


class ResumeContext(BaseModel):
    primaryResumeFileName: str | None = None
    primaryResumeTags: list[str] = Field(default_factory=list)
    profileSummary: str
    resumeText: str | None = None


class EducationEntry(BaseModel):
    institution: str
    degree: str
    fieldOfStudy: str
    startDate: str | None = None
    endDate: str | None = None
    description: str | None = None


class WorkExperienceEntry(BaseModel):
    company: str
    title: str
    startDate: str | None = None
    endDate: str | None = None
    location: str | None = None
    summary: str | None = None


class UserProfilePayload(BaseModel):
    fullName: str
    email: str
    phone: str
    linkedInUrl: str
    githubUrl: str
    portfolioUrl: str
    sponsorshipStatus: str
    education: list[EducationEntry]
    workExperience: list[WorkExperienceEntry]


class AiGenerationRequest(BaseModel):
    type: AiResponseType
    promptHint: str | None = None
    profile: UserProfilePayload
    resumeContext: ResumeContext
    jobContext: JobPageContext
    maxOutputTokens: int | None = Field(default=700, ge=64, le=2400)
