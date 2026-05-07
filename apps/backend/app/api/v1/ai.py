from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.ai import AiGenerationRequest
from app.schemas.agents import AgentDescriptor, AgentRunRequest, AgentRunResponse, AgentSessionResponse
from app.services.ai.agent_orchestrator import get_agent_session, run_agent
from app.services.ai.agent_registry import get_agent_registry
from app.services.ai.orchestrator import stream_ai_response

router = APIRouter()


@router.get("/health")
async def ai_health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "ai-orchestrator",
        "agents": ",".join(get_agent_registry().list_agent_types()),
    }


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


@router.post("/agents/run", response_model=AgentRunResponse)
async def run_ai_agent(request: AgentRunRequest) -> AgentRunResponse:
    return run_agent(request)


@router.get("/agents", response_model=list[AgentDescriptor])
async def list_ai_agents() -> list[AgentDescriptor]:
    return get_agent_registry().list_descriptors()


@router.get("/agents/sessions/{session_id}", response_model=AgentSessionResponse)
async def get_ai_agent_session(session_id: str) -> AgentSessionResponse:
    return get_agent_session(session_id)
