from __future__ import annotations

from app.api.v1 import analytics as analytics_routes


async def test_analytics_summary(api_client, override_db, monkeypatch) -> None:
    async def _get_summary(db):
        assert db is override_db
        return {
            "total_users": 12,
            "total_resumes": 18,
            "total_jobs": 47,
            "total_applications": 31,
            "active_applications": 14,
            "response_rate": 42,
            "interview_rate": 19,
        }

    monkeypatch.setattr(analytics_routes, "get_analytics_summary", _get_summary)

    response = await api_client.get("/api/v1/analytics/summary")

    assert response.status_code == 200
    assert response.json()["total_jobs"] == 47
