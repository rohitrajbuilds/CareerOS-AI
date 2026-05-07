from __future__ import annotations

from app.schemas.agents import AgentExecutionContext
from app.services.ai.text_utils import trim_dict_text_values, trim_text, trim_text_list


def optimize_agent_context(context: AgentExecutionContext) -> AgentExecutionContext:
    optimized = context.model_copy(deep=True)
    optimized.resumeContext.profileSummary = trim_text(optimized.resumeContext.profileSummary, 6000)
    if optimized.resumeContext.resumeText:
        optimized.resumeContext.resumeText = trim_text(optimized.resumeContext.resumeText, 9000)
    if optimized.jobContext.jobDescription:
        optimized.jobContext.jobDescription = trim_text(optimized.jobContext.jobDescription, 9000)
    optimized.jobContext.nearbyText = trim_text_list(optimized.jobContext.nearbyText, 12)
    if optimized.promptHint:
        optimized.promptHint = trim_text(optimized.promptHint, 1200)
    optimized.companyContext = trim_dict_text_values(optimized.companyContext, 2000)

    return optimized
