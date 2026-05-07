from __future__ import annotations

from app.schemas.agents import AgentExecutionContext
from app.schemas.agents import AgentSharedMemory


def join_sections(sections: list[str]) -> str:
    return "\n\n".join(section for section in sections if section)


def build_candidate_context(context: AgentExecutionContext) -> str:
    profile = context.profile
    return join_sections(
        [
            f"Name: {profile.fullName}",
            f"Email: {profile.email}",
            f"Phone: {profile.phone}",
            f"LinkedIn: {profile.linkedInUrl}",
            f"GitHub: {profile.githubUrl}",
            f"Portfolio: {profile.portfolioUrl}",
            f"Sponsorship status: {profile.sponsorshipStatus}",
            "Profile summary:",
            context.resumeContext.profileSummary,
            "Resume excerpt:",
            context.resumeContext.resumeText or "No resume text available.",
        ]
    )


def build_job_context(context: AgentExecutionContext) -> str:
    job = context.jobContext
    company_details = "\n".join(
        f"{key}: {value}" for key, value in context.companyContext.items() if value
    ) or "No additional company context."
    return join_sections(
        [
            f"Role title: {job.roleTitle or 'Unknown'}",
            f"Company: {job.companyName or 'Unknown'}",
            f"Job URL: {job.url}",
            f"Question label: {job.questionLabel or 'Not provided'}",
            "Job description:",
            job.jobDescription or "No job description extracted.",
            "Nearby text:",
            "\n".join(job.nearbyText[:10]) or "None",
            "Company context:",
            company_details,
            "Prompt hint:",
            context.promptHint or "None",
        ]
    )


def build_memory_context(memory: AgentSharedMemory) -> str:
    recent_entries = memory.entries[-6:]
    entry_text = "\n".join(
        f"[{entry.role}:{entry.source}] {entry.content[:500]}"
        for entry in recent_entries
    ) or "No shared memory yet."
    return join_sections(
        [
            f"Shared memory summary: {memory.summary or 'No summary yet.'}",
            "Recent shared memory entries:",
            entry_text,
        ]
    )
