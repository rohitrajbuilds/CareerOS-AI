from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime, timezone

from app.schemas.agents import AgentExecutionContext, AgentMemoryEntry, AgentSharedMemory, AgentType
from app.services.ai.pipeline import PromptBundle


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class BaseAgent(ABC):
    agent_type: AgentType
    display_name: str

    @abstractmethod
    def build_prompt_bundle(
        self,
        *,
        context: AgentExecutionContext,
        memory: AgentSharedMemory,
    ) -> PromptBundle:
        raise NotImplementedError

    def build_memory_entries(
        self,
        *,
        output: str,
        context: AgentExecutionContext,
    ) -> list[AgentMemoryEntry]:
        return [
            AgentMemoryEntry(
                role="agent",
                content=output,
                source=self.agent_type,
                createdAt=utc_now_iso(),
                metadata={
                    "roleTitle": context.jobContext.roleTitle,
                    "companyName": context.jobContext.companyName,
                },
            )
        ]

    def update_memory_facts(
        self,
        *,
        memory: AgentSharedMemory,
        output: str,
        context: AgentExecutionContext,
    ) -> AgentSharedMemory:
        memory.facts[self.agent_type] = {
            "lastOutput": output[:2400],
            "roleTitle": context.jobContext.roleTitle,
            "companyName": context.jobContext.companyName,
            "updatedAt": utc_now_iso(),
        }
        return memory
