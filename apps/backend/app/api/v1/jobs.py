from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_jobs() -> dict[str, str]:
    return {"status": "not-implemented"}
