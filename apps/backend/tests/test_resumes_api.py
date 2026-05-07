from __future__ import annotations

from app.api.v1 import resumes as resume_routes


def build_resume_payload() -> dict[str, object]:
    return {
        "id": "resume-1",
        "user_id": "user-1",
        "title": "Senior SWE Resume",
        "file_name": "resume.pdf",
        "storage_url": None,
        "raw_text": "Senior engineer with AI experience",
        "parsed_data": {},
        "tags": ["ai", "backend"],
        "is_primary": True,
    }


async def test_list_resumes(api_client, override_db, override_current_user, monkeypatch) -> None:
    async def _list_resumes(db, current_user):
        assert db is override_db
        assert current_user.id == override_current_user.id
        return [build_resume_payload()]

    monkeypatch.setattr(resume_routes, "list_resumes", _list_resumes)

    response = await api_client.get("/api/v1/resumes/")

    assert response.status_code == 200
    assert response.json()[0]["file_name"] == "resume.pdf"


async def test_create_resume(api_client, override_db, override_current_user, monkeypatch) -> None:
    async def _create_resume(db, current_user, payload):
        assert db is override_db
        assert current_user.id == override_current_user.id
        assert payload.file_name == "resume.pdf"
        return build_resume_payload()

    monkeypatch.setattr(resume_routes, "create_resume", _create_resume)

    response = await api_client.post(
        "/api/v1/resumes/",
        json={
            "title": "Senior SWE Resume",
            "file_name": "resume.pdf",
            "raw_text": "Senior engineer with AI experience",
            "tags": ["ai", "backend"],
            "is_primary": True,
        },
    )

    assert response.status_code == 200
    assert response.json()["is_primary"] is True
