from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_profile() -> dict[str, str]:
    return {"status": "not-implemented"}
