from __future__ import annotations

import json
import re
from collections import Counter
from datetime import datetime, timezone
from uuid import uuid4

from openai import APIConnectionError, APITimeoutError, RateLimitError

from app.core.config import get_settings
from app.schemas.jobs import (
    JobAnalysisBreakdown,
    JobAnalysisInsight,
    JobAnalysisRecommendation,
    JobAnalysisRequest,
    JobAnalysisResponse,
    JobRequirement,
    JobSkillSignal,
)
from app.services.ai.client import get_openai_client
from app.services.analytics.skill_taxonomy import SKILL_TAXONOMY

WORD_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9+.#/-]{1,}")
STOP_WORDS = {
    "about",
    "and",
    "are",
    "for",
    "from",
    "have",
    "into",
    "that",
    "the",
    "this",
    "with",
    "your",
    "will",
    "you",
    "our",
    "role",
    "team",
    "work",
    "using",
    "experience",
    "years",
}


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(value.replace("\u2022", " ").replace("\xa0", " ").split()).strip().lower()


def split_job_lines(text: str) -> list[str]:
    lines = [
        normalize_text(chunk)
        for chunk in re.split(r"[\n\r]+|(?<=[.;:])\s+", text)
    ]
    return [line for line in lines if len(line) >= 18]


def contains_phrase(text: str, phrase: str) -> bool:
    escaped = re.escape(normalize_text(phrase)).replace(r"\ ", r"\s+")
    return re.search(rf"(?<![a-z0-9]){escaped}(?![a-z0-9])", text) is not None


def categorize_requirement(text: str) -> str:
    if any(keyword in text for keyword in ("bachelor", "master", "degree", "phd")):
        return "education"
    if any(keyword in text for keyword in ("experience", "years", "led", "managed", "built")):
        return "experience"
    if any(keyword in text for keyword in ("responsible", "own", "collaborate", "deliver")):
        return "responsibility"
    if any(contains_phrase(text, keyword) for keyword in SKILL_TAXONOMY):
        return "skills"
    if any(keyword in text for keyword in ("industry", "domain", "customer", "product", "startup")):
        return "domain"
    return "other"


def extract_requirements(job_description: str) -> list[str]:
    lines = split_job_lines(job_description)
    priority_lines = [
        line
        for line in lines
        if any(
            keyword in line
            for keyword in (
                "required",
                "must",
                "should",
                "need",
                "looking for",
                "responsible",
                "preferred",
                "qualifications",
                "experience with",
            )
        )
    ]
    source = priority_lines or lines[:10]

    deduped: list[str] = []
    seen: set[str] = set()
    for line in source:
        trimmed = line[:220]
        if trimmed not in seen:
            seen.add(trimmed)
            deduped.append(trimmed)
    return deduped[:12]


def detect_skills(text: str) -> list[str]:
    normalized = normalize_text(text)
    found: list[str] = []
    for skill in SKILL_TAXONOMY:
        if contains_phrase(normalized, skill):
            found.append(skill)
    return found


def build_candidate_corpus(request: JobAnalysisRequest) -> str:
    profile = request.profile
    education = " ".join(
        filter(
            None,
            [
                f"{entry.degree} {entry.fieldOfStudy} {entry.institution} {entry.description or ''}"
                for entry in profile.education
            ],
        )
    )
    work_experience = " ".join(
        filter(
            None,
            [
                f"{entry.title} {entry.company} {entry.summary or ''} {entry.location or ''}"
                for entry in profile.workExperience
            ],
        )
    )

    return " ".join(
        filter(
            None,
            [
                request.resumeContext.profileSummary,
                request.resumeContext.resumeText or "",
                education,
                work_experience,
                profile.githubUrl,
                profile.linkedInUrl,
                profile.portfolioUrl,
            ],
        )
    )


def keyword_alignment(job_text: str, candidate_text: str) -> int:
    job_words = [word for word in WORD_RE.findall(normalize_text(job_text)) if word not in STOP_WORDS]
    candidate_words = set(
        word for word in WORD_RE.findall(normalize_text(candidate_text)) if word not in STOP_WORDS
    )
    if not job_words:
        return 50
    top_words = [word for word, _ in Counter(job_words).most_common(20)]
    overlap = sum(1 for word in top_words if word in candidate_words)
    return min(100, round((overlap / max(1, len(top_words))) * 100))


def education_alignment(job_text: str, request: JobAnalysisRequest) -> int:
    normalized_job = normalize_text(job_text)
    if not any(term in normalized_job for term in ("bachelor", "master", "degree", "phd")):
        return 85 if request.profile.education else 60

    education_text = normalize_text(
        " ".join(f"{entry.degree} {entry.fieldOfStudy}" for entry in request.profile.education)
    )
    if not education_text:
        return 20
    if any(term in education_text for term in ("bachelor", "master", "phd", "bs", "ms", "b.tech")):
        return 92
    return 70


def experience_alignment(job_text: str, request: JobAnalysisRequest, matched_skills: set[str]) -> int:
    normalized_job = normalize_text(job_text)
    experience_entries = request.profile.workExperience
    if not experience_entries:
        return 15

    years_match = re.search(r"(\d+)\+?\s+years", normalized_job)
    minimum_years = int(years_match.group(1)) if years_match else 0
    experience_count = len(experience_entries)
    experience_score = min(100, 45 + experience_count * 10)

    if minimum_years:
        experience_score += 10 if experience_count >= max(1, minimum_years // 2) else -10

    leadership_bonus = 10 if any(
        any(keyword in normalize_text(entry.summary or "") for keyword in ("led", "owned", "architected"))
        for entry in experience_entries
    ) else 0
    skill_bonus = min(15, len(matched_skills) * 3)

    return max(0, min(100, experience_score + leadership_bonus + skill_bonus))


def build_requirements(
    requirement_texts: list[str],
    candidate_text: str,
    profile_summary: str,
) -> list[JobRequirement]:
    normalized_candidate = normalize_text(candidate_text)
    normalized_profile = normalize_text(profile_summary)
    requirements: list[JobRequirement] = []

    for text in requirement_texts:
        normalized = normalize_text(text)
        category = categorize_requirement(normalized)
        matched_resume = normalized[:80] in normalized_candidate or any(
            token in normalized_candidate
            for token in [token for token in WORD_RE.findall(normalized) if len(token) > 4][:4]
        )
        matched_profile = normalized[:80] in normalized_profile or any(
            token in normalized_profile
            for token in [token for token in WORD_RE.findall(normalized) if len(token) > 4][:3]
        )
        matched = matched_resume or matched_profile
        confidence = 0.88 if matched_resume else 0.74 if matched_profile else 0.4
        match_source = "resume" if matched_resume else "profile" if matched_profile else "unmatched"
        requirements.append(
            JobRequirement(
                id=f"req_{uuid4().hex[:8]}",
                text=text,
                category=category,
                matched=matched,
                confidence=confidence,
                matchSource=match_source,
            )
        )

    return requirements


def build_recommendations(
    missing_skills: list[str],
    breakdown: JobAnalysisBreakdown,
    request: JobAnalysisRequest,
) -> list[JobAnalysisRecommendation]:
    recommendations: list[JobAnalysisRecommendation] = []
    if missing_skills:
        recommendations.append(
            JobAnalysisRecommendation(
                id=f"rec_{uuid4().hex[:8]}",
                title="Close the top skill gaps",
                detail=f"Add evidence for {', '.join(missing_skills[:4])} in your resume, projects, or application answers.",
                priority="high",
                kind="missing_skill",
            )
        )

    if breakdown.keywordAlignment < 65:
        recommendations.append(
            JobAnalysisRecommendation(
                id=f"rec_{uuid4().hex[:8]}",
                title="Mirror the job language",
                detail="Update your resume summary and recent bullets to reuse the employer's exact phrasing for tools, ownership, and outcomes.",
                priority="high",
                kind="keyword",
            )
        )

    if breakdown.experienceAlignment < 60:
        recommendations.append(
            JobAnalysisRecommendation(
                id=f"rec_{uuid4().hex[:8]}",
                title="Lead with the closest experience",
                detail="Surface the most relevant project or role first so recruiters can map your background to the job in a few seconds.",
                priority="medium",
                kind="experience",
            )
        )

    if breakdown.educationAlignment < 55 and not request.profile.education:
        recommendations.append(
            JobAnalysisRecommendation(
                id=f"rec_{uuid4().hex[:8]}",
                title="Fill in education details",
                detail="Add your degree, field of study, and institution so ATS filters do not read the profile as incomplete.",
                priority="medium",
                kind="education",
            )
        )

    if not recommendations:
        recommendations.append(
            JobAnalysisRecommendation(
                id=f"rec_{uuid4().hex[:8]}",
                title="Lean into fit signals",
                detail="Your profile already aligns well. Tailor your opening summary and include one quantified achievement that matches this role.",
                priority="low",
                kind="general",
            )
        )

    return recommendations[:4]


def fallback_ai_insight(
    request: JobAnalysisRequest,
    matched_skills: list[str],
    missing_skills: list[str],
    breakdown: JobAnalysisBreakdown,
) -> JobAnalysisInsight:
    role = request.jobContext.roleTitle or "this role"
    summary = (
        f"You show the strongest alignment for {role} through {', '.join(matched_skills[:3]) or 'your recent experience'}, "
        f"but the main pressure points are {', '.join(missing_skills[:3]) or 'keyword coverage and specificity'}."
    )
    strengths = matched_skills[:4] or ["Profile and resume context are available for tailoring."]
    risks = (
        [f"Missing evidence for {skill}." for skill in missing_skills[:3]]
        if missing_skills
        else ["No critical hard-skill gaps were detected, but ATS phrasing can still be improved."]
    )
    next_steps = [recommendation.detail for recommendation in build_recommendations(missing_skills, breakdown, request)]

    return JobAnalysisInsight(
        generated=False,
        summary=summary,
        strengths=strengths,
        risks=risks,
        nextSteps=next_steps[:3],
    )


def try_generate_ai_insight(
    request: JobAnalysisRequest,
    matched_skills: list[str],
    missing_skills: list[str],
    breakdown: JobAnalysisBreakdown,
) -> JobAnalysisInsight:
    settings = get_settings()
    if not settings.openai_api_key:
        return fallback_ai_insight(request, matched_skills, missing_skills, breakdown)

    prompt = {
        "role_title": request.jobContext.roleTitle,
        "company_name": request.jobContext.companyName,
        "matched_skills": matched_skills[:8],
        "missing_skills": missing_skills[:8],
        "breakdown": breakdown.model_dump(),
        "profile_summary": request.resumeContext.profileSummary[:1200],
        "resume_excerpt": (request.resumeContext.resumeText or "")[:1600],
        "job_description_excerpt": (request.jobContext.jobDescription or "")[:1600],
    }

    schema_example = {
        "summary": "One concise paragraph.",
        "strengths": ["bullet 1", "bullet 2"],
        "risks": ["bullet 1", "bullet 2"],
        "next_steps": ["bullet 1", "bullet 2"],
    }

    client = get_openai_client()
    for _attempt in range(3):
        try:
            response = client.responses.create(
                model=settings.openai_model_default,
                input=[
                    {
                        "role": "system",
                        "content": [
                            {
                                "type": "input_text",
                                "text": (
                                    "You are an expert recruiting analyst. Return strict JSON only. "
                                    "Do not wrap the JSON in markdown."
                                ),
                            }
                        ],
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": (
                                    f"Analyze this candidate-job match and return JSON matching this shape: {json.dumps(schema_example)}. "
                                    f"Data: {json.dumps(prompt)}"
                                ),
                            }
                        ],
                    },
                ],
                max_output_tokens=500,
            )
            raw_output = response.output_text
            start = raw_output.find("{")
            end = raw_output.rfind("}")
            if start == -1 or end == -1:
                raise ValueError("AI insight response did not contain JSON")
            payload = json.loads(raw_output[start : end + 1])
            return JobAnalysisInsight(
                generated=True,
                summary=str(payload.get("summary", "")).strip() or fallback_ai_insight(
                    request,
                    matched_skills,
                    missing_skills,
                    breakdown,
                ).summary,
                strengths=[str(item).strip() for item in payload.get("strengths", []) if str(item).strip()][:4],
                risks=[str(item).strip() for item in payload.get("risks", []) if str(item).strip()][:4],
                nextSteps=[str(item).strip() for item in payload.get("next_steps", []) if str(item).strip()][:4],
            )
        except (APIConnectionError, APITimeoutError, RateLimitError, ValueError, json.JSONDecodeError):
            continue
        except Exception:
            break

    return fallback_ai_insight(request, matched_skills, missing_skills, breakdown)


def round_score(value: float) -> int:
    return max(0, min(100, int(round(value))))


def analyze_job_fit(request: JobAnalysisRequest) -> JobAnalysisResponse:
    job_text = request.jobContext.jobDescription or ""
    candidate_text = build_candidate_corpus(request)

    requirement_texts = extract_requirements(job_text)
    job_skills = detect_skills(job_text)
    candidate_skills = set(detect_skills(candidate_text))
    matched_skills = sorted(skill for skill in job_skills if skill in candidate_skills)
    missing_skills = sorted(skill for skill in job_skills if skill not in candidate_skills)

    requirements = build_requirements(
        requirement_texts=requirement_texts,
        candidate_text=candidate_text,
        profile_summary=request.resumeContext.profileSummary,
    )

    skill_coverage = 70 if not job_skills else round_score((len(matched_skills) / max(1, len(set(job_skills)))) * 100)
    requirement_coverage = (
        round_score((sum(1 for requirement in requirements if requirement.matched) / max(1, len(requirements))) * 100)
        if requirements
        else 65
    )
    keyword_score = keyword_alignment(job_text, candidate_text)
    education_score = education_alignment(job_text, request)
    experience_score = experience_alignment(job_text, request, set(matched_skills))

    breakdown = JobAnalysisBreakdown(
        skillCoverage=skill_coverage,
        requirementCoverage=requirement_coverage,
        keywordAlignment=keyword_score,
        experienceAlignment=experience_score,
        educationAlignment=education_score,
    )

    ats_score = round_score(
        breakdown.skillCoverage * 0.4
        + breakdown.requirementCoverage * 0.25
        + breakdown.keywordAlignment * 0.2
        + breakdown.educationAlignment * 0.15
    )
    match_penalty = min(18, len(missing_skills) * 4)
    match_score = round_score(
        breakdown.skillCoverage * 0.35
        + breakdown.experienceAlignment * 0.25
        + breakdown.requirementCoverage * 0.2
        + breakdown.keywordAlignment * 0.2
        - match_penalty
    )
    indicator = "strong" if match_score >= 78 else "moderate" if match_score >= 55 else "weak"

    detected_skills = [
        JobSkillSignal(
            name=skill.title() if skill.islower() else skill,
            normalizedName=skill,
            required=True,
            matched=skill in candidate_skills,
            weight=round(min(1, 0.45 + (0.08 * (len(requirement_texts) / max(1, len(job_skills) or 1)))), 2),
        )
        for skill in sorted(set(job_skills))
    ]

    recommendations = build_recommendations(missing_skills, breakdown, request)
    ai_insights = try_generate_ai_insight(request, matched_skills, missing_skills, breakdown)

    return JobAnalysisResponse(
        analyzedAt=datetime.now(timezone.utc).isoformat(),
        atsScore=ats_score,
        matchScore=match_score,
        matchIndicator=indicator,
        requirements=requirements,
        detectedSkills=detected_skills,
        matchedSkills=[skill.title() if skill.islower() else skill for skill in matched_skills],
        missingSkills=[skill.title() if skill.islower() else skill for skill in missing_skills],
        breakdown=breakdown,
        recommendations=recommendations,
        aiInsights=ai_insights,
        jobContext=request.jobContext,
    )
