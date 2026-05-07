from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user() -> dict[str, str]:
    return {"status": "not-implemented"}
