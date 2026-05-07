from __future__ import annotations

from app.api.v1 import jobs as job_routes


async def test_list_jobs(api_client, override_db, monkeypatch) -> None:
    async def _list_jobs(db):
        assert db is override_db
        return [
            {
                "id": "job-1",
                "external_job_key": "gh-001",
                "source_platform": "greenhouse",
                "company_name": "CareerOS",
                "title": "AI Engineer",
                "location": "Remote",
                "salary_text": None,
                "description_text": "Build AI products.",
                "metadata_json": {},
                "canonical_url": "https://jobs.example.com/ai-engineer",
            }
        ]

    monkeypatch.setattr(job_routes, "list_jobs", _list_jobs)

    response = await api_client.get("/api/v1/jobs/")

    assert response.status_code == 200
    assert response.json()[0]["title"] == "AI Engineer"


async def test_create_job(api_client, override_db, monkeypatch) -> None:
    async def _create_job(db, payload):
        assert db is override_db
        assert payload.company_name == "CareerOS"
        return {
            "id": "job-1",
            "external_job_key": None,
            "source_platform": payload.source_platform,
            "company_name": payload.company_name,
            "title": payload.title,
            "location": payload.location,
            "salary_text": payload.salary_text,
            "description_text": payload.description_text,
            "metadata_json": payload.metadata_json,
            "canonical_url": payload.canonical_url,
        }

    monkeypatch.setattr(job_routes, "create_job", _create_job)

    response = await api_client.post(
        "/api/v1/jobs/",
        json={
            "source_platform": "greenhouse",
            "company_name": "CareerOS",
            "title": "AI Engineer",
            "canonical_url": "https://jobs.example.com/ai-engineer",
            "description_text": "Build AI products.",
        },
    )

    assert response.status_code == 200
    assert response.json()["company_name"] == "CareerOS"


async def test_analyze_job(api_client) -> None:
    response = await api_client.post(
        "/api/v1/jobs/analyze",
        json={
            "profile": {
                "fullName": "Rohit Raj",
                "email": "rohit@example.com",
                "phone": "+91-9000000000",
                "linkedInUrl": "https://linkedin.com/in/rohit",
                "githubUrl": "https://github.com/rohitrajbuilds",
                "portfolioUrl": "https://careeros.ai",
                "sponsorshipStatus": "No sponsorship required",
                "education": [],
                "workExperience": [],
            },
            "resumeContext": {
                "profileSummary": "AI engineer with React and Python experience.",
                "resumeText": "TypeScript React Python FastAPI SQL"
            },
            "jobContext": {
                "provider": "greenhouse",
                "url": "https://jobs.example.com/ai-engineer",
                "companyName": "CareerOS",
                "roleTitle": "AI Engineer",
                "jobDescription": "We need React, Python, SQL, and FastAPI experience."
            }
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["atsScore"] >= 0
    assert payload["matchScore"] >= 0
    assert "breakdown" in payload
