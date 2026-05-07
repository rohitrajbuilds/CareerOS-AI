from pydantic import BaseModel, Field

from app.schemas.ai import JobPageContext, ResumeContext, UserProfilePayload


class CompanyInterviewPrepItem(BaseModel):
    question: str
    rationale: str
    talkingPoints: list[str] = Field(default_factory=list)


class TailoredMotivationAnswers(BaseModel):
    whyThisCompany: str
    whyThisRole: str
    valueAlignment: str


class CompanyResearchRequest(BaseModel):
    sessionId: str | None = None
    profile: UserProfilePayload
    resumeContext: ResumeContext
    jobContext: JobPageContext


class CompanyResearchResponse(BaseModel):
    analyzedAt: str
    sessionId: str | None = None
    companyName: str
    summary: str
    mission: str
    techStack: list[str] = Field(default_factory=list)
    cultureSignals: list[str] = Field(default_factory=list)
    companyInsights: list[str] = Field(default_factory=list)
    interviewPrep: list[CompanyInterviewPrepItem] = Field(default_factory=list)
    tailoredMotivationAnswers: TailoredMotivationAnswers
    generated: bool
