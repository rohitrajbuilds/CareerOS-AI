from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_resumes() -> dict[str, str]:
    return {"status": "not-implemented"}
