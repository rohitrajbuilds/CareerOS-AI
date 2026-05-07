import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useExtensionStore } from '../store/use-extension-store';

export function HomeRoute(): JSX.Element {
  const { openSidePanel, refreshActiveTab, updateSettings } = useExtensionActions();
  const snapshot = useExtensionStore((state) => state.snapshot);
  const settings = useExtensionStore((state) => state.settings);
  const setSettings = useExtensionStore((state) => state.setSettings);
  const backendHealth = useExtensionStore((state) => state.backendHealth);
  const error = useExtensionStore((state) => state.error);

  async function persistSetting(
    patch:
      | { extensionEnabled: boolean }
      | { autoOpenSidePanel: boolean }
      | { debugMode: boolean },
  ): Promise<void> {
    const nextSettings = await updateSettings(patch);
    setSettings(nextSettings);
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Extension Status</h2>
        <dl className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
          <div className="flex justify-between gap-3">
            <dt>Active tab</dt>
            <dd>{snapshot?.activeTabId ?? 'None'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Session status</dt>
            <dd>{snapshot?.activeSession?.status ?? 'Idle'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Provider</dt>
            <dd>{snapshot?.activeSession?.provider ?? 'unknown'}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)]"
            onClick={() => void refreshActiveTab()}
          >
            Refresh tab session
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium"
            onClick={() => void openSidePanel()}
          >
            Re-open side panel
          </button>
        </div>
      </article>
      <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Backend Health</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {backendHealth?.status ? `API status: ${backendHealth.status}` : 'Backend not connected'}
        </p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </article>
      <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm md:col-span-2">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
            <span className="text-sm">Extension enabled</span>
            <input
              type="checkbox"
              checked={settings?.extensionEnabled ?? false}
              onChange={(event) =>
                void persistSetting({ extensionEnabled: event.currentTarget.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
            <span className="text-sm">Auto-open side panel</span>
            <input
              type="checkbox"
              checked={settings?.autoOpenSidePanel ?? false}
              onChange={(event) =>
                void persistSetting({ autoOpenSidePanel: event.currentTarget.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
            <span className="text-sm">Debug mode</span>
            <input
              type="checkbox"
              checked={settings?.debugMode ?? false}
              onChange={(event) => void persistSetting({ debugMode: event.currentTarget.checked })}
            />
          </label>
        </div>
      </article>
    </section>
  );
}
