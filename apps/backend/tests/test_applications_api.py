from __future__ import annotations

from app.api.v1 import applications as application_routes


def build_application_payload() -> dict[str, object]:
    return {
        "id": "application-1",
        "user_id": "user-1",
        "job_id": "job-1",
        "company_name": "CareerOS",
        "title": "Staff Engineer",
        "status": "applied",
        "priority": "high",
        "source_url": "https://jobs.example.com/staff-engineer",
        "notes": "Strong fit",
        "interview_count": 1,
        "tags": ["remote", "ai"],
        "history": [{"status": "applied"}],
        "last_response_at": None,
        "applied_at": "2026-05-07T00:00:00Z",
        "canonical_url": "https://jobs.example.com/staff-engineer",
        "source_platform": "greenhouse",
    }


async def test_list_applications(
    api_client, override_db, override_current_user, monkeypatch
) -> None:
    async def _list_applications(db, current_user):
        assert db is override_db
        assert current_user.id == override_current_user.id
        return [build_application_payload()]

    monkeypatch.setattr(application_routes, "list_applications", _list_applications)

    response = await api_client.get("/api/v1/applications/")

    assert response.status_code == 200
    assert response.json()[0]["company_name"] == "CareerOS"


async def test_create_application(
    api_client, override_db, override_current_user, monkeypatch
) -> None:
    async def _create_application(db, current_user, payload):
        assert db is override_db
        assert current_user.id == override_current_user.id
        assert payload.job.company_name == "CareerOS"
        return build_application_payload()

    monkeypatch.setattr(application_routes, "create_application", _create_application)

    response = await api_client.post(
        "/api/v1/applications/",
        json={
            "job": {
                "source_platform": "greenhouse",
                "company_name": "CareerOS",
                "title": "Staff Engineer",
                "canonical_url": "https://jobs.example.com/staff-engineer",
                "description_text": "Build AI systems.",
            },
            "status": "applied",
            "priority": "high",
            "source_url": "https://jobs.example.com/staff-engineer",
            "notes": "Strong fit",
            "tags": ["remote", "ai"],
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] == "applied"


async def test_update_application(
    api_client, override_db, override_current_user, monkeypatch
) -> None:
    async def _update_application(db, current_user, application_id, payload):
        assert db is override_db
        assert current_user.id == override_current_user.id
        assert application_id == "application-1"
        assert payload.status == "interviewing"
        updated = build_application_payload()
        updated["status"] = "interviewing"
        updated["interview_count"] = 2
        return updated

    monkeypatch.setattr(application_routes, "update_application", _update_application)

    response = await api_client.patch(
        "/api/v1/applications/application-1",
        json={"status": "interviewing", "interview_count": 2},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "interviewing"


async def test_application_analytics(
    api_client, override_db, override_current_user, monkeypatch
) -> None:
    async def _get_application_analytics(db, current_user):
        assert db is override_db
        assert current_user.id == override_current_user.id
        return {
            "total_applications": 10,
            "active_applications": 5,
            "interview_count": 2,
            "rejection_count": 3,
            "offer_count": 1,
            "response_rate": 60,
            "interview_rate": 20,
            "rejection_rate": 30,
            "status_counts": {"applied": 4, "interviewing": 2, "offer": 1, "rejected": 3},
        }

    monkeypatch.setattr(application_routes, "get_application_analytics", _get_application_analytics)

    response = await api_client.get("/api/v1/applications/analytics/summary")

    assert response.status_code == 200
    assert response.json()["offer_count"] == 1
