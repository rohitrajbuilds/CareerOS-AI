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


class ResumeAgent(BaseAgent):
    agent_type = "resume_agent"
    display_name = "Resume Agent"

    def build_prompt_bundle(
        self,
        *,
        context: AgentExecutionContext,
        memory: AgentSharedMemory,
    ) -> PromptBundle:
        system_prompt = (
            "You are CareerOS Resume Agent. Improve resume positioning for a specific job. "
            "Focus on ATS alignment, bullet relevance, keyword gaps, and section-level recommendations. "
            "Do not invent achievements, employers, tools, or metrics."
        )
        user_prompt = join_sections(
            [
                "Task: analyze the candidate resume against the target role and return:",
                "1. Resume fit summary",
                "2. Missing evidence or weak sections",
                "3. Suggested bullet rewrites or emphasis areas",
                "4. ATS keyword recommendations",
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
