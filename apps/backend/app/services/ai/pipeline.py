from __future__ import annotations

import time
from dataclasses import dataclass, field
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


def run_text_generation_pipeline(
    *,
    model: str,
    prompt_bundle: PromptBundle,
    max_output_tokens: int,
) -> PipelineResult:
    client = get_openai_client()
    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            response = client.responses.create(
                model=model,
                input=[
                    {"role": "system", "content": prompt_bundle.system_prompt},
                    {"role": "user", "content": prompt_bundle.user_prompt},
                ],
                max_output_tokens=max_output_tokens,
            )

            usage = getattr(response, "usage", None)
            return PipelineResult(
                text=response.output_text,
                model=model,
                usage={
                    "inputTokens": getattr(usage, "input_tokens", None),
                    "outputTokens": getattr(usage, "output_tokens", None),
                },
                metadata=prompt_bundle.metadata,
            )
        except RETRYABLE_EXCEPTIONS:
            if attempt == max_attempts - 1:
                raise
            time.sleep(0.5 * (attempt + 1))
