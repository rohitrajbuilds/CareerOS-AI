from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_applications() -> dict[str, str]:
    return {"status": "not-implemented"}
