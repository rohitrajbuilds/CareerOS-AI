from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.ai import JobPageContext, ResumeContext, UserProfilePayload


RequirementCategory = Literal["skills", "experience", "education", "responsibility", "domain", "other"]
RequirementMatchSource = Literal["resume", "profile", "job_context", "unmatched"]
RecommendationPriority = Literal["high", "medium", "low"]
RecommendationKind = Literal["missing_skill", "keyword", "experience", "education", "general"]
MatchIndicator = Literal["strong", "moderate", "weak"]


class JobAnalysisRequest(BaseModel):
    profile: UserProfilePayload
    resumeContext: ResumeContext
    jobContext: JobPageContext


class JobRequirement(BaseModel):
    id: str
    text: str
    category: RequirementCategory
    matched: bool
    confidence: float = Field(ge=0, le=1)
    matchSource: RequirementMatchSource


class JobSkillSignal(BaseModel):
    name: str
    normalizedName: str
    required: bool
    matched: bool
    weight: float = Field(ge=0, le=1)


class JobAnalysisBreakdown(BaseModel):
    skillCoverage: int = Field(ge=0, le=100)
    requirementCoverage: int = Field(ge=0, le=100)
    keywordAlignment: int = Field(ge=0, le=100)
    experienceAlignment: int = Field(ge=0, le=100)
    educationAlignment: int = Field(ge=0, le=100)


class JobAnalysisRecommendation(BaseModel):
    id: str
    title: str
    detail: str
    priority: RecommendationPriority
    kind: RecommendationKind


class JobAnalysisInsight(BaseModel):
    generated: bool
    summary: str
    strengths: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    nextSteps: list[str] = Field(default_factory=list)


class JobAnalysisResponse(BaseModel):
    analyzedAt: str
    atsScore: int = Field(ge=0, le=100)
    matchScore: int = Field(ge=0, le=100)
    matchIndicator: MatchIndicator
    requirements: list[JobRequirement] = Field(default_factory=list)
    detectedSkills: list[JobSkillSignal] = Field(default_factory=list)
    matchedSkills: list[str] = Field(default_factory=list)
    missingSkills: list[str] = Field(default_factory=list)
    breakdown: JobAnalysisBreakdown
    recommendations: list[JobAnalysisRecommendation] = Field(default_factory=list)
    aiInsights: JobAnalysisInsight
    jobContext: JobPageContext
