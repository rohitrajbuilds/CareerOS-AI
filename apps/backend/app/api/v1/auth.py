from fastapi import APIRouter

router = APIRouter()


@router.get("/session")
async def get_session() -> dict[str, str]:
    return {"status": "not-implemented"}
