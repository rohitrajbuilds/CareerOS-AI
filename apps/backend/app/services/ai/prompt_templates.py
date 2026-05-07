from app.schemas.ai import AiGenerationRequest


def trim_text(value: str | None, max_chars: int) -> str:
    if not value:
        return ""
    return value[:max_chars]


def build_template_instructions(request: AiGenerationRequest) -> str:
    prompt_map = {
        "cover_letter": (
            "Write a concise, modern cover letter tailored to the role. "
            "Avoid clichés, be specific, and stay factual."
        ),
        "why_company": (
            "Answer why the candidate wants to work at this company. "
            "Use the job description and company context when available, and keep it personal."
        ),
        "short_answer": (
            "Write a short application answer. Be direct, tailored, and under the implied field length."
        ),
        "experience_summary": (
            "Summarize the candidate's relevant experience for this role in a polished but truthful way."
        ),
        "technical_answer": (
            "Draft a technical answer grounded in the candidate's stated experience. "
            "Do not fabricate tools, systems, or years of experience."
        ),
    }

    return prompt_map[request.type]


def build_system_prompt(request: AiGenerationRequest) -> str:
    return (
        "You are CareerOS AI, an expert job application writing assistant. "
        "You must write truthful, role-relevant, polished application content using only the provided candidate and job context. "
        "Never invent employers, skills, degrees, certifications, metrics, or immigration/work authorization facts. "
        "Optimize for clarity, specificity, and professional tone. "
        f"Task: {build_template_instructions(request)}"
    )


def build_user_prompt(request: AiGenerationRequest) -> str:
    profile = request.profile
    job = request.jobContext
    resume = request.resumeContext

    sections = [
        f"Requested answer type: {request.type}",
        f"Field/question label: {job.questionLabel or 'Not provided'}",
        f"Role title: {job.roleTitle or 'Unknown'}",
        f"Company: {job.companyName or 'Unknown'}",
        f"Job URL: {job.url}",
        "Candidate profile summary:",
        trim_text(resume.profileSummary, 6000),
        "Candidate structured details:",
        (
            f"Name: {profile.fullName}\n"
            f"Email: {profile.email}\n"
            f"Phone: {profile.phone}\n"
            f"LinkedIn: {profile.linkedInUrl}\n"
            f"GitHub: {profile.githubUrl}\n"
            f"Portfolio: {profile.portfolioUrl}\n"
            f"Sponsorship status: {profile.sponsorshipStatus}"
        ),
        "Resume text excerpt:",
        trim_text(resume.resumeText, 8000) or "No text resume available; rely on structured profile summary.",
        "Job description excerpt:",
        trim_text(job.jobDescription, 8000) or "No job description extracted.",
        "Nearby field text:",
        "\n".join(job.nearbyText[:10]) or "None",
        "Additional user hint:",
        request.promptHint or "None",
        (
            "Write only the final answer content. Do not add preamble, labels, bullet headings, or markdown unless the task clearly needs them."
        ),
    ]

    return "\n\n".join(section for section in sections if section)
