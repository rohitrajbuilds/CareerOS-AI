from __future__ import annotations

from app.schemas.agents import (
    AgentExecutionContext,
    AgentMemoryEntry,
    AgentRunRequest,
    AgentRunResponse,
    AgentSessionResponse,
)
from app.services.ai.agent_context import optimize_agent_context
from app.services.ai.agent_memory import get_agent_memory_store, utc_now_iso
from app.services.ai.agent_registry import get_agent_registry
from app.services.ai.model_router import resolve_agent_model
from app.services.ai.pipeline import run_text_generation_pipeline


def _build_user_memory_entry(request: AgentRunRequest, context: AgentExecutionContext) -> AgentMemoryEntry:
    summary_parts = [
        f"Agent requested: {request.agentType}",
        f"Role: {context.jobContext.roleTitle or 'Unknown'}",
        f"Company: {context.jobContext.companyName or 'Unknown'}",
    ]
    if context.promptHint:
        summary_parts.append(f"Prompt hint: {context.promptHint}")
    if context.jobContext.questionLabel:
        summary_parts.append(f"Field label: {context.jobContext.questionLabel}")

    return AgentMemoryEntry(
        role="user",
        content="\n".join(summary_parts),
        source="orchestrator",
        createdAt=utc_now_iso(),
        metadata={
            "agentType": request.agentType,
            "jobUrl": context.jobContext.url,
        },
    )


def _summarize_memory(memory_entries: list[AgentMemoryEntry]) -> str:
    if not memory_entries:
        return ""
    recent = memory_entries[-4:]
    return " | ".join(f"{entry.source}: {entry.content[:140]}" for entry in recent)[:1200]


def run_agent(request: AgentRunRequest) -> AgentRunResponse:
    registry = get_agent_registry()
    memory_store = get_agent_memory_store()

    optimized_context = optimize_agent_context(request.context)
    memory = memory_store.get_or_create(request.sessionId)
    agent = registry.get(request.agentType)
    model = resolve_agent_model(request.agentType)

    prompt_bundle = agent.build_prompt_bundle(
        context=optimized_context,
        memory=memory,
    )
    pipeline_result = run_text_generation_pipeline(
        model=model,
        prompt_bundle=prompt_bundle,
        max_output_tokens=request.maxOutputTokens or 900,
    )

    user_entry = _build_user_memory_entry(request, optimized_context)
    agent_entries = agent.build_memory_entries(output=pipeline_result.text, context=optimized_context)

    if request.memoryStrategy != "none":
        if request.memoryStrategy == "replace":
            memory.entries = []
        memory.entries.append(user_entry)
        memory.entries.extend(agent_entries)

    memory = agent.update_memory_facts(
        memory=memory,
        output=pipeline_result.text,
        context=optimized_context,
    )
    memory.summary = _summarize_memory(memory.entries)
    persisted_memory = memory_store.save(memory)

    return AgentRunResponse(
        sessionId=persisted_memory.sessionId,
        agentType=request.agentType,
        model=pipeline_result.model,
        output=pipeline_result.text,
        memory=persisted_memory,
        metadata={
            **pipeline_result.metadata,
            "usage": pipeline_result.usage,
        },
    )


def get_agent_session(session_id: str) -> AgentSessionResponse:
    memory = get_agent_memory_store().get_or_create(session_id)
    return AgentSessionResponse(sessionId=memory.sessionId, memory=memory)
