from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.ai import AiGenerationRequest
from app.services.ai.orchestrator import stream_ai_response

router = APIRouter()


@router.get("/health")
async def ai_health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-orchestrator"}


@router.post("/generate/stream")
async def generate_ai_response_stream(
    request: AiGenerationRequest,
) -> StreamingResponse:
    return StreamingResponse(
        stream_ai_response(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
