from __future__ import annotations

from collections.abc import Mapping
from datetime import datetime, timezone
from uuid import uuid4

from app.models import Application
from app.schemas.applications_api import ApplicationAnalyticsResponse, ApplicationResponse

APPLICATION_STATUSES = (
    "saved",
    "applied",
    "interviewing",
    "offer",
    "rejected",
    "withdrawn",
)
ACTIVE_APPLICATION_STATUSES = ("saved", "applied", "interviewing")
RESPONSE_RECEIVED_STATUSES = ("interviewing", "offer", "rejected")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_history_event(
    status: str,
    note: str | None = None,
    created_at: str | None = None,
) -> dict[str, str | None]:
    """Build a serializable history event for status transitions."""
    return {
        "id": str(uuid4()),
        "status": status,
        "createdAt": created_at or utc_now_iso(),
        "note": note,
    }


def to_application_response(application: Application) -> ApplicationResponse:
    return ApplicationResponse(
        id=str(application.id),
        user_id=str(application.user_id),
        job_id=str(application.job_id),
        company_name=application.job.company_name,
        title=application.job.title,
        status=application.status,
        priority=application.priority,
        source_url=application.source_url,
        notes=application.notes,
        interview_count=application.interview_count,
        tags=application.tags,
        history=application.history,
        last_response_at=application.last_response_at,
        applied_at=application.applied_at,
        canonical_url=application.job.canonical_url,
        source_platform=application.job.source_platform,
    )


def calculate_percentage(numerator: int, denominator: int) -> int:
    return round((numerator / denominator) * 100) if denominator else 0


def build_application_analytics_response(
    status_counts: Mapping[str, int],
) -> ApplicationAnalyticsResponse:
    normalized_counts = {
        status_name: status_counts.get(status_name, 0) for status_name in APPLICATION_STATUSES
    }
    total = sum(normalized_counts.values())
    active = sum(normalized_counts[status_name] for status_name in ACTIVE_APPLICATION_STATUSES)
    interviews = normalized_counts["interviewing"] + normalized_counts["offer"]
    rejections = normalized_counts["rejected"]
    offers = normalized_counts["offer"]
    responded = interviews + rejections

    return ApplicationAnalyticsResponse(
        total_applications=total,
        active_applications=active,
        interview_count=interviews,
        rejection_count=rejections,
        offer_count=offers,
        response_rate=calculate_percentage(responded, total),
        interview_rate=calculate_percentage(interviews, total),
        rejection_rate=calculate_percentage(rejections, total),
        status_counts=normalized_counts,
    )
