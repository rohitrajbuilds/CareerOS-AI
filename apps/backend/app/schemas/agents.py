from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.ai import JobPageContext, ResumeContext, UserProfilePayload


AgentType = Literal[
    "resume_agent",
    "cover_letter_agent",
    "job_match_agent",
    "company_research_agent",
    "form_filling_agent",
]

AgentSource = Literal["user", "system", "agent", "memory"]
MemoryStrategy = Literal["append", "replace", "none"]


class AgentMemoryEntry(BaseModel):
    role: AgentSource
    content: str
    source: str
    createdAt: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class AgentSharedMemory(BaseModel):
    sessionId: str
    summary: str = ""
    entries: list[AgentMemoryEntry] = Field(default_factory=list)
    facts: dict[str, Any] = Field(default_factory=dict)
    updatedAt: str


class AgentExecutionContext(BaseModel):
    profile: UserProfilePayload
    resumeContext: ResumeContext
    jobContext: JobPageContext
    companyContext: dict[str, Any] = Field(default_factory=dict)
    promptHint: str | None = None
    contextOverrides: dict[str, Any] = Field(default_factory=dict)


class AgentRunRequest(BaseModel):
    agentType: AgentType
    sessionId: str | None = None
    context: AgentExecutionContext
    maxOutputTokens: int | None = Field(default=900, ge=64, le=3200)
    memoryStrategy: MemoryStrategy = "append"


class AgentRunResponse(BaseModel):
    sessionId: str
    agentType: AgentType
    model: str
    output: str
    memory: AgentSharedMemory
    metadata: dict[str, Any] = Field(default_factory=dict)


class AgentDescriptor(BaseModel):
    agentType: AgentType
    displayName: str


class AgentSessionResponse(BaseModel):
    sessionId: str
    memory: AgentSharedMemory
