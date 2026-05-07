import '@/styles/tailwind.css';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useStorageValue } from '@/lib/hooks/use-storage-value';

export function OptionsApp(): JSX.Element {
  const settings = useStorageValue('settings', 'local');
  const { updateSettings } = useExtensionActions();

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">CareerOS AI Settings</h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Persisted extension settings are stored through the Chrome storage wrapper and shared
          across popup, background, and sidepanel surfaces.
        </p>
        <div className="mt-6 grid gap-4">
          <label className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3">
            <span className="text-sm">Extension enabled</span>
            <input
              type="checkbox"
              checked={settings?.extensionEnabled ?? false}
              onChange={(event) =>
                void updateSettings({ extensionEnabled: event.currentTarget.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3">
            <span className="text-sm">Auto-open sidepanel</span>
            <input
              type="checkbox"
              checked={settings?.autoOpenSidePanel ?? false}
              onChange={(event) =>
                void updateSettings({ autoOpenSidePanel: event.currentTarget.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3">
            <span className="text-sm">Debug mode</span>
            <input
              type="checkbox"
              checked={settings?.debugMode ?? false}
              onChange={(event) => void updateSettings({ debugMode: event.currentTarget.checked })}
            />
          </label>
        </div>
      </div>
    </main>
  );
}
