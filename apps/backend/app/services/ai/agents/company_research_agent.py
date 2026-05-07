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


class CompanyResearchAgent(BaseAgent):
    agent_type = "company_research_agent"
    display_name = "Company Research Agent"

    def build_prompt_bundle(
        self,
        *,
        context: AgentExecutionContext,
        memory: AgentSharedMemory,
    ) -> PromptBundle:
        system_prompt = (
            "You are CareerOS Company Research Agent. Synthesize provided company context into useful "
            "application positioning. Never claim you verified facts beyond the supplied context. "
            "Return strict JSON only with this shape: "
            '{"summary":"","mission":"","techStack":[],"cultureSignals":[],"companyInsights":[],"interviewPrep":[{"question":"","rationale":"","talkingPoints":[]}],"tailoredMotivationAnswers":{"whyThisCompany":"","whyThisRole":"","valueAlignment":""}}'
        )
        user_prompt = join_sections(
            [
                "Task: summarize the most relevant company signals for the candidate's application.",
                "Highlight mission, likely product and engineering context, probable tech stack, culture signals, interview prep, and tailored motivation answers.",
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
