from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock


@dataclass
class MonitoringSnapshot:
    request_count: int = 0
    error_count: int = 0
    route_counts: dict[str, int] = field(default_factory=dict)


class MonitoringService:
    def __init__(self) -> None:
        self._lock = Lock()
        self._snapshot = MonitoringSnapshot()

    def record_request(self, route: str, errored: bool = False) -> None:
        with self._lock:
            self._snapshot.request_count += 1
            self._snapshot.route_counts[route] = self._snapshot.route_counts.get(route, 0) + 1
            if errored:
                self._snapshot.error_count += 1

    def snapshot(self) -> MonitoringSnapshot:
        with self._lock:
            return MonitoringSnapshot(
                request_count=self._snapshot.request_count,
                error_count=self._snapshot.error_count,
                route_counts=dict(self._snapshot.route_counts),
            )


monitoring_service = MonitoringService()
