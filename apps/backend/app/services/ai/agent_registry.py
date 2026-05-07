from __future__ import annotations

from app.schemas.agents import AgentDescriptor, AgentType
from app.services.ai.agents import (
    BaseAgent,
    CompanyResearchAgent,
    CoverLetterAgent,
    FormFillingAgent,
    JobMatchAgent,
    ResumeAgent,
)


class AgentRegistry:
    def __init__(self) -> None:
        self._agents: dict[AgentType, BaseAgent] = {
            "resume_agent": ResumeAgent(),
            "cover_letter_agent": CoverLetterAgent(),
            "job_match_agent": JobMatchAgent(),
            "company_research_agent": CompanyResearchAgent(),
            "form_filling_agent": FormFillingAgent(),
        }

    def get(self, agent_type: AgentType) -> BaseAgent:
        return self._agents[agent_type]

    def list_agent_types(self) -> list[AgentType]:
        return list(self._agents.keys())

    def list_descriptors(self) -> list[AgentDescriptor]:
        return [
            AgentDescriptor(agentType=agent_type, displayName=agent.display_name)
            for agent_type, agent in self._agents.items()
        ]


_registry = AgentRegistry()


def get_agent_registry() -> AgentRegistry:
    return _registry
