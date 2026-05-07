from __future__ import annotations

import json
import re
from datetime import datetime, timezone

from app.schemas.agents import AgentExecutionContext, AgentRunRequest
from app.schemas.company_research import (
    CompanyInterviewPrepItem,
    CompanyResearchRequest,
    CompanyResearchResponse,
    TailoredMotivationAnswers,
)
from app.services.ai.agent_orchestrator import run_agent

TECH_STACK_TERMS = (
    "python",
    "typescript",
    "javascript",
    "react",
    "node.js",
    "node",
    "java",
    "go",
    "aws",
    "gcp",
    "azure",
    "docker",
    "kubernetes",
    "sql",
    "postgresql",
    "graphql",
    "rest api",
    "fastapi",
    "redis",
    "microservices",
    "machine learning",
    "ai",
    "llm",
    "openai",
)

CULTURE_TERMS = (
    "collaborative",
    "ownership",
    "fast-paced",
    "customer-focused",
    "inclusive",
    "mission-driven",
    "high-performing",
    "cross-functional",
    "remote-first",
    "startup",
    "innovation",
    "bias for action",
    "autonomy",
    "curiosity",
)


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(value.replace("\u2022", " ").replace("\xa0", " ").split()).strip()


def lower_text(value: str | None) -> str:
    return normalize_text(value).lower()


def extract_mission(job_description: str) -> str:
    text = normalize_text(job_description)
    sentences = re.split(r"(?<=[.!?])\s+", text)
    for sentence in sentences:
        lowered = sentence.lower()
        if any(token in lowered for token in ("mission", "we are building", "our goal", "our vision", "we believe")):
            return sentence[:320]
    return sentences[0][:320] if sentences else "Mission details were not explicitly stated in the current job page."


def extract_terms(text: str, vocabulary: tuple[str, ...]) -> list[str]:
    normalized = lower_text(text)
    results: list[str] = []
    for term in vocabulary:
        pattern = re.escape(term).replace(r"\ ", r"\s+")
        if re.search(rf"(?<![a-z0-9]){pattern}(?![a-z0-9])", normalized):
            results.append(term.title() if term.islower() else term)
    return results


def extract_company_insights(job_description: str, company_name: str, role_title: str) -> list[str]:
    insights: list[str] = []
    if company_name:
        insights.append(f"{company_name} is hiring for a role centered on {role_title or 'this opportunity'}.")
    if "customer" in lower_text(job_description):
        insights.append("The role appears to have a strong customer or end-user impact orientation.")
    if any(term in lower_text(job_description) for term in ("scale", "distributed", "performance", "platform")):
        insights.append("The team likely cares about scale, reliability, or platform maturity.")
    if any(term in lower_text(job_description) for term in ("partner", "cross-functional", "stakeholder")):
        insights.append("Cross-functional collaboration looks important for success in this role.")
    return insights[:4]


def build_heuristic_interview_prep(
    mission: str,
    tech_stack: list[str],
    culture_signals: list[str],
) -> list[CompanyInterviewPrepItem]:
    questions = [
        CompanyInterviewPrepItem(
            question="What draws you to our mission and product?",
            rationale="Interviewers often test whether the candidate understands and connects with the company's purpose.",
            talkingPoints=[mission[:180]],
        ),
        CompanyInterviewPrepItem(
            question="How would your past work transfer to our stack and engineering environment?",
            rationale="This helps link the candidate's experience to the company's likely technical priorities.",
            talkingPoints=tech_stack[:4] or ["Map your past systems work to the tools and responsibilities mentioned in the role."],
        ),
        CompanyInterviewPrepItem(
            question="How do you operate in a team culture like ours?",
            rationale="This surfaces alignment with collaboration, ownership, and communication expectations.",
            talkingPoints=culture_signals[:4] or ["Prepare examples that show ownership, collaboration, and clear execution."],
        ),
    ]
    return questions


def build_heuristic_answers(company_name: str, role_title: str, mission: str) -> TailoredMotivationAnswers:
    company = company_name or "the company"
    role = role_title or "this role"
    return TailoredMotivationAnswers(
        whyThisCompany=(
            f"I'm interested in {company} because the mission and product direction described in the role feel concrete and meaningful. "
            f"What stands out most is {mission[:180].rstrip('.')}, which aligns with the kind of work I want to contribute to."
        ),
        whyThisRole=(
            f"I'm drawn to {role} because it sits close to the problems I enjoy solving most, especially where product impact, technical depth, and execution come together."
        ),
        valueAlignment=(
            "My background is strongest when I can turn ambiguity into shipped outcomes, partner cross-functionally, and bring structured thinking to high-priority work."
        ),
    )


def build_company_research_response(
    request: CompanyResearchRequest,
) -> CompanyResearchResponse:
    context = AgentExecutionContext(
        profile=request.profile,
        resumeContext=request.resumeContext,
        jobContext=request.jobContext,
        companyContext={},
        promptHint="Return structured company research focused on application positioning and interview preparation.",
    )
    agent_result = run_agent(
        AgentRunRequest(
            agentType="company_research_agent",
            sessionId=request.sessionId,
            context=context,
            maxOutputTokens=1200,
            memoryStrategy="append",
        )
    )

    payload = {}
    try:
        start = agent_result.output.find("{")
        end = agent_result.output.rfind("}")
        if start != -1 and end != -1 and end > start:
            payload = json.loads(agent_result.output[start : end + 1])
    except Exception:
        payload = {}

    company_name = request.jobContext.companyName or "Target Company"
    role_title = request.jobContext.roleTitle or "the role"
    job_description = request.jobContext.jobDescription or ""

    mission = str(payload.get("mission") or "").strip() or extract_mission(job_description)
    tech_stack = [str(item).strip() for item in payload.get("techStack", []) if str(item).strip()] or extract_terms(job_description, TECH_STACK_TERMS)
    culture_signals = [str(item).strip() for item in payload.get("cultureSignals", []) if str(item).strip()] or extract_terms(job_description, CULTURE_TERMS)
    company_insights = [str(item).strip() for item in payload.get("companyInsights", []) if str(item).strip()] or extract_company_insights(job_description, company_name, role_title)

    interview_prep_payload = payload.get("interviewPrep", [])
    interview_prep = [
        CompanyInterviewPrepItem(
            question=str(item.get("question", "")).strip(),
            rationale=str(item.get("rationale", "")).strip(),
            talkingPoints=[str(point).strip() for point in item.get("talkingPoints", []) if str(point).strip()],
        )
        for item in interview_prep_payload
        if isinstance(item, dict)
    ]
    if not interview_prep:
        interview_prep = build_heuristic_interview_prep(mission, tech_stack, culture_signals)

    motivation_payload = payload.get("tailoredMotivationAnswers", {}) if isinstance(payload.get("tailoredMotivationAnswers", {}), dict) else {}
    heuristic_answers = build_heuristic_answers(company_name, role_title, mission)
    tailored_answers = TailoredMotivationAnswers(
        whyThisCompany=str(motivation_payload.get("whyThisCompany", "")).strip() or heuristic_answers.whyThisCompany,
        whyThisRole=str(motivation_payload.get("whyThisRole", "")).strip() or heuristic_answers.whyThisRole,
        valueAlignment=str(motivation_payload.get("valueAlignment", "")).strip() or heuristic_answers.valueAlignment,
    )

    summary = str(payload.get("summary", "")).strip() or (
        f"{company_name} appears to be hiring for {role_title} with emphasis on {', '.join(tech_stack[:3]) or 'the priorities described in the job posting'}."
    )

    return CompanyResearchResponse(
        analyzedAt=datetime.now(timezone.utc).isoformat(),
        sessionId=agent_result.sessionId,
        companyName=company_name,
        summary=summary,
        mission=mission,
        techStack=tech_stack[:8],
        cultureSignals=culture_signals[:8],
        companyInsights=company_insights[:6],
        interviewPrep=interview_prep[:4],
        tailoredMotivationAnswers=tailored_answers,
        generated=bool(payload),
    )
