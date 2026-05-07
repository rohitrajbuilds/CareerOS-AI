import time
from collections.abc import Generator

from openai import APIConnectionError, APITimeoutError, RateLimitError

from app.schemas.ai import AiGenerationRequest
from app.services.ai.client import get_openai_client
from app.services.ai.context_manager import optimize_request_context
from app.services.ai.model_router import resolve_model
from app.services.ai.prompt_templates import build_system_prompt, build_user_prompt
from app.services.ai.streaming import sse_event


RETRYABLE_EXCEPTIONS = (APIConnectionError, APITimeoutError, RateLimitError)


def stream_ai_response(request: AiGenerationRequest) -> Generator[str, None, None]:
    optimized_request = optimize_request_context(request)
    model = resolve_model(optimized_request)
    client = get_openai_client()

    system_prompt = build_system_prompt(optimized_request)
    user_prompt = build_user_prompt(optimized_request)

    yield sse_event(
        "started",
        {
            "type": "started",
            "requestType": optimized_request.type,
            "model": model,
        },
    )

    collected_text = ""
    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            stream = client.responses.create(
                model=model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_output_tokens=optimized_request.maxOutputTokens or 700,
                stream=True,
            )

            usage: dict[str, int] | None = None
            for event in stream:
                event_type = getattr(event, "type", "")
                if event_type == "response.output_text.delta":
                    delta = getattr(event, "delta", "")
                    if delta:
                        collected_text += delta
                        yield sse_event("delta", {"type": "delta", "text": delta})
                elif event_type == "response.completed":
                    response = getattr(event, "response", None)
                    response_usage = getattr(response, "usage", None)
                    if response_usage:
                        usage = {
                            "inputTokens": getattr(response_usage, "input_tokens", None),
                            "outputTokens": getattr(response_usage, "output_tokens", None),
                        }

            yield sse_event(
                "completed",
                {
                    "type": "completed",
                    "text": collected_text,
                    "usage": usage,
                },
            )
            return
        except RETRYABLE_EXCEPTIONS as error:
            if attempt == max_attempts - 1:
                yield sse_event(
                    "error",
                    {
                        "type": "error",
                        "message": str(error),
                        "retryable": True,
                    },
                )
                return
            time.sleep(0.5 * (attempt + 1))
        except Exception as error:  # noqa: BLE001
            yield sse_event(
                "error",
                {
                    "type": "error",
                    "message": str(error),
                    "retryable": False,
                },
            )
            return
