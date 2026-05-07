from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models import User
from app.schemas.auth import LoginRequest, RegisterRequest, SessionResponse, TokenResponse
from app.services.auth_service import build_session_response, login_user, register_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await login_user(db, payload)


@router.get("/session", response_model=SessionResponse)
async def get_session(current_user: User = Depends(get_current_user)) -> SessionResponse:
    return build_session_response(current_user)
