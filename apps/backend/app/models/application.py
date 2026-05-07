from __future__ import annotations

import uuid

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("jobs.id"), index=True)
    status: Mapped[str] = mapped_column(String(64), default="saved", index=True)
    priority: Mapped[str] = mapped_column(String(32), default="medium")
    source_url: Mapped[str] = mapped_column(String(1024))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    interview_count: Mapped[int] = mapped_column(Integer, default=0)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    history: Mapped[list[dict]] = mapped_column(JSON, default=list)
    last_response_at: Mapped[str | None] = mapped_column(String(64), nullable=True)
    applied_at: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
