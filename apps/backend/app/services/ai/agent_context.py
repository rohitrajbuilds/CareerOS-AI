from __future__ import annotations

from app.schemas.agents import AgentExecutionContext


def trim_text(value: str | None, max_chars: int) -> str:
    if not value:
        return ""
    return value[:max_chars]


def optimize_agent_context(context: AgentExecutionContext) -> AgentExecutionContext:
    optimized = context.model_copy(deep=True)
    optimized.resumeContext.profileSummary = trim_text(optimized.resumeContext.profileSummary, 6000)
    if optimized.resumeContext.resumeText:
        optimized.resumeContext.resumeText = trim_text(optimized.resumeContext.resumeText, 9000)
    if optimized.jobContext.jobDescription:
        optimized.jobContext.jobDescription = trim_text(optimized.jobContext.jobDescription, 9000)
    optimized.jobContext.nearbyText = optimized.jobContext.nearbyText[:12]
    if optimized.promptHint:
        optimized.promptHint = trim_text(optimized.promptHint, 1200)

    trimmed_company_context: dict[str, object] = {}
    for key, value in optimized.companyContext.items():
        if isinstance(value, str):
            trimmed_company_context[key] = trim_text(value, 2000)
        else:
            trimmed_company_context[key] = value
    optimized.companyContext = trimmed_company_context

    return optimized
