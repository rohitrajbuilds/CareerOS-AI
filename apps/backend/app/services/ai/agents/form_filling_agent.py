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


class FormFillingAgent(BaseAgent):
    agent_type = "form_filling_agent"
    display_name = "Form Filling Agent"

    def build_prompt_bundle(
        self,
        *,
        context: AgentExecutionContext,
        memory: AgentSharedMemory,
    ) -> PromptBundle:
        system_prompt = (
            "You are CareerOS Form Filling Agent. Produce concise application-ready answers for forms. "
            "Optimize for brevity, relevance, truthfulness, and clean direct language."
        )
        user_prompt = join_sections(
            [
                "Task: generate a best-fit answer for the active form question or section.",
                "Respect the field context and nearby page text if present.",
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
