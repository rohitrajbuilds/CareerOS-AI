import '@/styles/tailwind.css';
import { useBackendHealth, useExtensionActions, useExtensionSnapshot } from '@/lib/hooks/use-extension-core';
import { useLiveExtensionSnapshot } from '@/lib/hooks/use-live-extension-snapshot';

export function PopupApp(): JSX.Element {
  const { error: snapshotError, isLoading, refresh } = useExtensionSnapshot();
  const snapshot = useLiveExtensionSnapshot();
  const { data: backendHealth } = useBackendHealth();
  const { openSidePanel, refreshActiveTab } = useExtensionActions();

  return (
    <main className="w-[360px] bg-[var(--color-background)] p-4 text-[var(--color-text)]">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          CareerOS AI
        </p>
        <h1 className="mt-2 text-lg font-semibold">Extension Control Center</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {isLoading
            ? 'Loading extension state...'
            : snapshot?.activeSession
              ? `${snapshot.activeSession.provider} detected on the active tab`
              : 'No supported job application page detected on the active tab'}
        </p>
        <dl className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
          <div className="flex justify-between gap-3">
            <dt>Active tab</dt>
            <dd>{snapshot?.activeTabId ?? 'None'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Session</dt>
            <dd>{snapshot?.activeSession?.status ?? 'Idle'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Backend</dt>
            <dd>{backendHealth?.status ?? 'Offline'}</dd>
          </div>
        </dl>
        {snapshotError ? <p className="mt-3 text-sm text-red-600">{snapshotError}</p> : null}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)]"
            onClick={() => void openSidePanel()}
          >
            Open side panel
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
            onClick={() => void refreshActiveTab().then(refresh)}
          >
            Refresh active tab
          </button>
        </div>
      </div>
    </main>
  );
}
