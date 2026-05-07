from app.schemas.ai import AiGenerationRequest
from app.services.ai.text_utils import trim_text, trim_text_list


def optimize_request_context(request: AiGenerationRequest) -> AiGenerationRequest:
    optimized = request.model_copy(deep=True)
    optimized.resumeContext.profileSummary = trim_text(optimized.resumeContext.profileSummary, 6000)
    if optimized.resumeContext.resumeText:
        optimized.resumeContext.resumeText = trim_text(optimized.resumeContext.resumeText, 8000)
    if optimized.jobContext.jobDescription:
        optimized.jobContext.jobDescription = trim_text(optimized.jobContext.jobDescription, 8000)
    optimized.jobContext.nearbyText = trim_text_list(optimized.jobContext.nearbyText, 10)
    if optimized.promptHint:
        optimized.promptHint = trim_text(optimized.promptHint, 1000)
    return optimized
