from __future__ import annotations

from app.schemas.agents import AgentExecutionContext, AgentSharedMemory
from app.services.ai.agents.base import BaseAgent
from app.services.ai.agents.prompt_utils import (
    build_candidate_context,
    build_job_context,
    build_memory_context,
    join_sections,
)
from app.services.ai.pipeline import PromptBundle


class CoverLetterAgent(BaseAgent):
    agent_type = "cover_letter_agent"
    display_name = "Cover Letter Agent"

    def build_prompt_bundle(
        self,
        *,
        context: AgentExecutionContext,
        memory: AgentSharedMemory,
    ) -> PromptBundle:
        system_prompt = (
            "You are CareerOS Cover Letter Agent. Write tailored, concise, factual cover letters. "
            "Stay specific to the candidate and role, and avoid generic filler."
        )
        user_prompt = join_sections(
            [
                "Task: write a polished, role-specific cover letter.",
                "Keep the tone modern and direct. Use only verifiable candidate details.",
                build_candidate_context(context),
                build_job_context(context),
                build_memory_context(memory),
            ]
        )
        return PromptBundle(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            metadata={"agentType": self.agent_type},
        )
