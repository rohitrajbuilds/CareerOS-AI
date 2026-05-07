from app.core.config import get_settings
from app.schemas.ai import AiGenerationRequest
from app.schemas.agents import AgentType


def resolve_model(request: AiGenerationRequest) -> str:
    settings = get_settings()
    if request.type in {"cover_letter", "technical_answer", "why_company"}:
        return settings.openai_model_advanced
    return settings.openai_model_default


def resolve_agent_model(agent_type: AgentType) -> str:
    settings = get_settings()
    if agent_type in {"cover_letter_agent", "job_match_agent", "company_research_agent"}:
        return settings.openai_model_advanced
    return settings.openai_model_default
