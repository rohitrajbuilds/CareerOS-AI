from app.schemas.ai import AiGenerationRequest


def optimize_request_context(request: AiGenerationRequest) -> AiGenerationRequest:
    optimized = request.model_copy(deep=True)
    optimized.resumeContext.profileSummary = optimized.resumeContext.profileSummary[:6000]
    if optimized.resumeContext.resumeText:
        optimized.resumeContext.resumeText = optimized.resumeContext.resumeText[:8000]
    if optimized.jobContext.jobDescription:
        optimized.jobContext.jobDescription = optimized.jobContext.jobDescription[:8000]
    optimized.jobContext.nearbyText = optimized.jobContext.nearbyText[:10]
    if optimized.promptHint:
        optimized.promptHint = optimized.promptHint[:1000]
    return optimized
