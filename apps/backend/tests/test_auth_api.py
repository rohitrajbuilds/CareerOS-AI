from __future__ import annotations

from app.api.v1 import auth as auth_routes


async def test_register_returns_tokens(api_client, monkeypatch) -> None:
    async def _register_user(_, payload):
        assert payload.email == "person@example.com"
        return {
            "access_token": "access-token",
            "refresh_token": "refresh-token",
            "token_type": "bearer",
        }

    monkeypatch.setattr(auth_routes, "register_user", _register_user)

    response = await api_client.post(
        "/api/v1/auth/register",
        json={
            "email": "person@example.com",
            "password": "password123",
            "full_name": "Career OS",
        },
    )

    assert response.status_code == 200
    assert response.json()["access_token"] == "access-token"


async def test_login_returns_tokens(api_client, monkeypatch) -> None:
    async def _login_user(_, payload):
        assert payload.email == "person@example.com"
        return {
            "access_token": "access-token",
            "refresh_token": "refresh-token",
            "token_type": "bearer",
        }

    monkeypatch.setattr(auth_routes, "login_user", _login_user)

    response = await api_client.post(
        "/api/v1/auth/login",
        json={"email": "person@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    assert response.json()["refresh_token"] == "refresh-token"


async def test_session_uses_authenticated_user(api_client, override_current_user) -> None:
    response = await api_client.get("/api/v1/auth/session")

    assert response.status_code == 200
    payload = response.json()
    assert payload == {
        "user_id": str(override_current_user.id),
        "email": override_current_user.email,
        "full_name": override_current_user.full_name,
    }
