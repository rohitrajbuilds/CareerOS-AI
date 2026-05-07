import { ApplicationDashboard } from '@/features/applications/components/application-dashboard';
import { CompanyInsightsCard } from '@/features/company-research/components/company-insights-card';
import { AnalysisDashboard } from '@/features/job-analysis/components/analysis-dashboard';
import { ProfileSummaryCard } from '@/features/profile/components/profile-summary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <div className="md:col-span-2">
        <ApplicationDashboard />
      </div>
      <div className="md:col-span-2">
        <AnalysisDashboard />
      </div>
      <div className="md:col-span-2">
        <CompanyInsightsCard />
      </div>
      <Card>
        <h2 className="text-lg font-semibold">Extension Status</h2>
        <dl className="mt-4 space-y-3 text-sm text-[var(--color-text-muted)]">
          <div className="flex justify-between gap-3">
            <dt>Active tab</dt>
            <dd>{snapshot?.activeTabId ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Session status</dt>
            <dd className="capitalize">{snapshot?.activeSession?.status ?? 'idle'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Provider</dt>
            <dd className="capitalize">{snapshot?.activeSession?.provider ?? 'unknown'}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => void refreshActiveTab()}>
            Refresh tab session
          </Button>
          <Button variant="secondary" onClick={() => void openSidePanel()}>
            Re-open side panel
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Backend Health</h2>
          <Badge tone={backendHealth?.status === 'ok' ? 'success' : 'warning'}>
            {backendHealth?.status ?? 'offline'}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          {backendHealth?.status
            ? `API status: ${backendHealth.status}`
            : 'Backend not connected'}
        </p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </Card>
      <Card className="md:col-span-2">
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3">
            <span className="text-sm">Extension enabled</span>
            <input
              type="checkbox"
              checked={settings?.extensionEnabled ?? false}
              onChange={(event) =>
                void persistSetting({ extensionEnabled: event.currentTarget.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3">
            <span className="text-sm">Auto-open side panel</span>
            <input
              type="checkbox"
              checked={settings?.autoOpenSidePanel ?? false}
              onChange={(event) =>
                void persistSetting({ autoOpenSidePanel: event.currentTarget.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3">
            <span className="text-sm">Debug mode</span>
            <input
              type="checkbox"
              checked={settings?.debugMode ?? false}
              onChange={(event) => void persistSetting({ debugMode: event.currentTarget.checked })}
            />
          </label>
        </div>
      </Card>
      <div className="md:col-span-2">
        <ProfileSummaryCard />
      </div>
    </section>
  );
}
