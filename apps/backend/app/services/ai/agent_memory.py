from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timezone
from threading import RLock
from uuid import uuid4

from app.schemas.agents import AgentMemoryEntry, AgentSharedMemory


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class AgentMemoryStore:
    def __init__(self) -> None:
        self._lock = RLock()
        self._sessions: dict[str, AgentSharedMemory] = {}

    def get_or_create(self, session_id: str | None = None) -> AgentSharedMemory:
        resolved_session_id = session_id or f"agent_{uuid4().hex}"
        with self._lock:
            memory = self._sessions.get(resolved_session_id)
            if memory is None:
                memory = AgentSharedMemory(
                    sessionId=resolved_session_id,
                    updatedAt=utc_now_iso(),
                )
                self._sessions[resolved_session_id] = memory
            return memory.model_copy(deep=True)

    def save(self, memory: AgentSharedMemory) -> AgentSharedMemory:
        with self._lock:
            persisted = memory.model_copy(
                update={
                    "updatedAt": utc_now_iso(),
                },
                deep=True,
            )
            self._sessions[persisted.sessionId] = persisted
            return persisted.model_copy(deep=True)

    def update(self, session_id: str, updater: Callable[[AgentSharedMemory], AgentSharedMemory]) -> AgentSharedMemory:
        with self._lock:
            current = self._sessions.get(session_id)
            if current is None:
                current = AgentSharedMemory(
                    sessionId=session_id,
                    updatedAt=utc_now_iso(),
                )
            next_memory = updater(current.model_copy(deep=True))
            next_memory.updatedAt = utc_now_iso()
            self._sessions[session_id] = next_memory
            return next_memory.model_copy(deep=True)

    def append_entries(self, session_id: str, entries: list[AgentMemoryEntry]) -> AgentSharedMemory:
        def updater(memory: AgentSharedMemory) -> AgentSharedMemory:
            memory.entries.extend(entries)
            return memory

        return self.update(session_id, updater)


_memory_store = AgentMemoryStore()


def get_agent_memory_store() -> AgentMemoryStore:
    return _memory_store
