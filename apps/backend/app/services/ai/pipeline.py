from __future__ import annotations

import time
from dataclasses import dataclass, field
import json
from typing import Any

from openai import APIConnectionError, APITimeoutError, RateLimitError

from app.services.ai.client import get_openai_client


RETRYABLE_EXCEPTIONS = (APIConnectionError, APITimeoutError, RateLimitError)


@dataclass(slots=True)
class PromptBundle:
    system_prompt: str
    user_prompt: str
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class PipelineResult:
    text: str
    model: str
    usage: dict[str, int | None]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class JsonPipelineResult(PipelineResult):
    payload: dict[str, Any] = field(default_factory=dict)


def _extract_usage(response: Any) -> dict[str, int | None]:
    usage = getattr(response, "usage", None)
    return {
        "inputTokens": getattr(usage, "input_tokens", None),
        "outputTokens": getattr(usage, "output_tokens", None),
    }


def _run_response_request(
    *,
    model: str,
    prompt_bundle: PromptBundle,
    max_output_tokens: int,
) -> Any:
    client = get_openai_client()
    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            return client.responses.create(
                model=model,
                input=[
                    {"role": "system", "content": prompt_bundle.system_prompt},
                    {"role": "user", "content": prompt_bundle.user_prompt},
                ],
                max_output_tokens=max_output_tokens,
            )
        except RETRYABLE_EXCEPTIONS:
            if attempt == max_attempts - 1:
                raise
            time.sleep(0.5 * (attempt + 1))


def _extract_json_payload(text: str) -> dict[str, Any]:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Pipeline response did not contain a JSON object")
    return json.loads(text[start : end + 1])


def run_text_generation_pipeline(
    *,
    model: str,
    prompt_bundle: PromptBundle,
    max_output_tokens: int,
) -> PipelineResult:
    response = _run_response_request(
        model=model,
        prompt_bundle=prompt_bundle,
        max_output_tokens=max_output_tokens,
    )

    return PipelineResult(
        text=response.output_text,
        model=model,
        usage=_extract_usage(response),
        metadata=prompt_bundle.metadata,
    )


def run_json_generation_pipeline(
    *,
    model: str,
    prompt_bundle: PromptBundle,
    max_output_tokens: int,
) -> JsonPipelineResult:
    response = _run_response_request(
        model=model,
        prompt_bundle=prompt_bundle,
        max_output_tokens=max_output_tokens,
    )
    text = response.output_text
    payload = _extract_json_payload(text)

    return JsonPipelineResult(
        text=text,
        model=model,
        usage=_extract_usage(response),
        metadata=prompt_bundle.metadata,
        payload=payload,
    )
