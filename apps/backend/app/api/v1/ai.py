from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def ai_health() -> dict[str, str]:
    return {"status": "ok", "service": "ai-orchestrator"}
