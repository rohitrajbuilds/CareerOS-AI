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


class JobMatchAgent(BaseAgent):
    agent_type = "job_match_agent"
    display_name = "Job Match Agent"

    def build_prompt_bundle(
        self,
        *,
        context: AgentExecutionContext,
        memory: AgentSharedMemory,
    ) -> PromptBundle:
        system_prompt = (
            "You are CareerOS Job Match Agent. Evaluate fit between the candidate and the role. "
            "Surface strengths, gaps, ATS concerns, and pragmatic next steps without exaggeration."
        )
        user_prompt = join_sections(
            [
                "Task: assess candidate-job fit.",
                "Return a structured narrative covering alignment, risks, notable strengths, and missing skills.",
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
