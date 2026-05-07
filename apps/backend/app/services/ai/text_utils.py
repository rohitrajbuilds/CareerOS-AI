from __future__ import annotations

from collections.abc import Iterable


def trim_text(value: str | None, max_chars: int) -> str:
    """Trim optional text without forcing each caller to repeat the same guard."""
    if not value:
        return ""
    return value[:max_chars]


def trim_text_list(values: Iterable[str], max_items: int) -> list[str]:
    return list(values)[:max_items]


def trim_dict_text_values(values: dict[str, object], max_chars: int) -> dict[str, object]:
    trimmed: dict[str, object] = {}
    for key, value in values.items():
        trimmed[key] = trim_text(value, max_chars) if isinstance(value, str) else value
    return trimmed
