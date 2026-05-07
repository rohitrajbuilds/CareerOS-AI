from __future__ import annotations

from collections.abc import AsyncGenerator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.api.deps import get_current_user, get_db
from app.main import app
from app.models import User


class DummySession:
    pass


@pytest.fixture(autouse=True)
def clear_dependency_overrides() -> None:
    app.dependency_overrides = {}


@pytest_asyncio.fixture
async def api_client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


@pytest.fixture
def fake_user() -> User:
    return User(
        id=uuid4(),
        email="tester@example.com",
        hashed_password="hashed",
        full_name="Test User",
        is_active=True,
    )


@pytest.fixture
def override_current_user(fake_user: User) -> User:
    async def _override() -> User:
        return fake_user

    app.dependency_overrides[get_current_user] = _override
    return fake_user


@pytest.fixture
def override_db() -> DummySession:
    session = DummySession()

    async def _override() -> AsyncGenerator[DummySession, None]:
        yield session

    app.dependency_overrides[get_db] = _override
    return session
