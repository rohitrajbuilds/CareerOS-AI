import { useState } from 'react';
import { ApplicationDashboard } from '@/features/applications/components/application-dashboard';
import { CompanyInsightsCard } from '@/features/company-research/components/company-insights-card';
import { AnalysisDashboard } from '@/features/job-analysis/components/analysis-dashboard';
import { ProfileSummaryCard } from '@/features/profile/components/profile-summary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import {
  selectBackendHealth,
  selectGlobalError,
  selectSettings,
  selectSnapshot,
} from '../store/selectors';
import { useExtensionStore } from '../store/use-extension-store';

export function HomeRoute(): JSX.Element {
  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const { openSidePanel, refreshActiveTab, triggerAutofill, updateSettings } = useExtensionActions();
  const snapshot = useExtensionStore(selectSnapshot);
  const settings = useExtensionStore(selectSettings);
  const setSettings = useExtensionStore((state) => state.setSettings);
  const backendHealth = useExtensionStore(selectBackendHealth);
  const error = useExtensionStore(selectGlobalError);

  async function persistSetting(
    patch:
      | { extensionEnabled: boolean }
      | { autoOpenSidePanel: boolean }
      | { debugMode: boolean },
  ): Promise<void> {
    const nextSettings = await updateSettings(patch);
    setSettings(nextSettings);
  }

  async function handleAutofill(mode: 'fill' | 'preview' | 'undo'): Promise<void> {
    try {
      const result = await triggerAutofill({
        mode,
        safeMode: mode !== 'undo',
        debug: settings?.debugMode ?? false,
      });
      const prefix =
        mode === 'preview' ? 'Preview ready' : mode === 'undo' ? 'Undo complete' : 'Autofill complete';
      setAutofillMessage(
        `${prefix}: ${result.filledCount} filled, ${result.unresolved.length} unresolved`,
      );
    } catch (autofillError) {
      setAutofillMessage(
        autofillError instanceof Error ? autofillError.message : 'Autofill request failed.',
      );
    }
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
          <Button onClick={() => void handleAutofill('fill')}>Autofill current form</Button>
          <Button variant="secondary" onClick={() => void handleAutofill('preview')}>
            Preview fill
          </Button>
          <Button variant="ghost" onClick={() => void handleAutofill('undo')}>
            Undo fill
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button onClick={() => void refreshActiveTab()}>
            Refresh tab session
          </Button>
          <Button variant="secondary" onClick={() => void openSidePanel()}>
            Re-open side panel
          </Button>
        </div>
        {autofillMessage ? (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{autofillMessage}</p>
        ) : null}
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
