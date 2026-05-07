from app.core.config import get_settings
from app.schemas.ai import AiGenerationRequest


def resolve_model(request: AiGenerationRequest) -> str:
    settings = get_settings()
    if request.type in {"cover_letter", "technical_answer", "why_company"}:
        return settings.openai_model_advanced
    return settings.openai_model_default
