from __future__ import annotations


async def test_root_health(api_client) -> None:
    response = await api_client.get("/")

    assert response.status_code == 200
    assert response.json() == {"service": "careeros-backend", "status": "ok"}


async def test_metrics_snapshot(api_client) -> None:
    response = await api_client.get("/metrics")

    assert response.status_code == 200
    payload = response.json()
    assert "request_count" in payload
    assert "error_count" in payload
    assert isinstance(payload["route_counts"], dict)


async def test_extension_health(api_client) -> None:
    response = await api_client.get("/api/v1/extension/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "careeros-backend"
    assert "environment" in payload


async def test_ai_agent_catalog(api_client) -> None:
    response = await api_client.get("/api/v1/ai/agents")

    assert response.status_code == 200
    agent_types = {entry["agentType"] for entry in response.json()}
    assert {
        "resume_agent",
        "cover_letter_agent",
        "job_match_agent",
        "company_research_agent",
        "form_filling_agent",
    }.issubset(agent_types)
