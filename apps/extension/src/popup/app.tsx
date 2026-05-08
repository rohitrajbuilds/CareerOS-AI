import '@/styles/tailwind.css';
import type { AutofillResult } from '@careeros/shared-types';
import { useState } from 'react';
import { useBackendHealth, useExtensionActions, useExtensionSnapshot } from '@/lib/hooks/use-extension-core';
import { useLiveExtensionSnapshot } from '@/lib/hooks/use-live-extension-snapshot';
import { useStorageValue } from '@/lib/hooks/use-storage-value';
import { useThemeSync } from '@/lib/theme/theme';
import { Button } from '@/components/ui/button';
import { Card, HeroCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function buildAutofillMessage(result: AutofillResult): string {
  const operationLabel =
    result.operation === 'preview'
      ? 'Preview ready'
      : result.operation === 'undo'
        ? 'Autofill undone'
        : 'Autofill complete';

  const parts = [`${operationLabel}: ${result.filledCount} field${result.filledCount === 1 ? '' : 's'} handled`];

  if (result.unresolved.length > 0) {
    parts.push(`${result.unresolved.length} unresolved`);
  }

  if (result.skippedCount) {
    parts.push(`${result.skippedCount} skipped`);
  }

  if (result.failedCount) {
    parts.push(`${result.failedCount} failed`);
  }

  return parts.join(' • ');
}

export function PopupApp(): JSX.Element {
  const [autofillState, setAutofillState] = useState<{
    status: 'idle' | 'running' | 'done' | 'error';
    message: string | null;
  }>({ status: 'idle', message: null });
  const { error: snapshotError, isLoading, refresh } = useExtensionSnapshot();
  const snapshot = useLiveExtensionSnapshot();
  const { data: backendHealth } = useBackendHealth();
  const settings = useStorageValue('settings', 'local');
  const { openSidePanel, refreshActiveTab, triggerAutofill, updateSettings } = useExtensionActions();
  useThemeSync();

  async function runAutofill(mode: 'fill' | 'preview' | 'undo' = 'fill'): Promise<void> {
    setAutofillState({
      status: 'running',
      message: mode === 'preview' ? 'Previewing fill plan...' : 'Filling current form...',
    });

    try {
      const result = await triggerAutofill({
        mode,
        safeMode: mode !== 'undo',
        debug: settings?.debugMode ?? false,
      });
      setAutofillState({
        status: 'done',
        message: buildAutofillMessage(result),
      });
      await refresh();
    } catch (error) {
      setAutofillState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Autofill failed.',
      });
    }
  }

  return (
    <main className="h-[452px] w-[388px] overflow-hidden p-4 text-[var(--color-text)]">
      <div className="grid gap-4">
        <HeroCard data-motion="disabled" className="min-h-[196px] overflow-hidden p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                CareerOS AI
              </p>
              <h1 className="mt-2 text-xl font-semibold">Control Center</h1>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-[var(--color-text-muted)]">
                {isLoading
                  ? 'Loading extension state...'
                  : snapshot?.activeSession
                    ? `${snapshot.activeSession.provider} workflow is active on this tab.`
                    : 'No supported job application page is active yet.'}
              </p>
            </div>
            <Badge tone={backendHealth?.status === 'ok' ? 'success' : 'warning'}>
              {backendHealth?.status ?? 'offline'}
            </Badge>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button motionDisabled onClick={() => void runAutofill('fill')}>
              {autofillState.status === 'running' ? 'Working...' : 'Autofill form'}
            </Button>
            <Button motionDisabled variant="secondary" onClick={() => void openSidePanel()}>
              Open workspace
            </Button>
            <Button
              motionDisabled
              variant="ghost"
              onClick={() => void refreshActiveTab().then(refresh)}
            >
              Refresh tab
            </Button>
          </div>
          {autofillState.message ? (
            <p
              className={`mt-4 text-sm ${
                autofillState.status === 'error' ? 'text-rose-400' : 'text-[var(--color-text-muted)]'
              }`}
            >
              {autofillState.message}
            </p>
          ) : null}
        </HeroCard>

        <Card data-motion="disabled" className="grid min-h-[220px] gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Appearance</span>
            <ThemeToggle
              motionDisabled
              value={settings?.themeMode ?? 'system'}
              onChange={(themeMode) => void updateSettings({ themeMode })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/8 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Active tab
              </p>
              <p className="mt-2 text-lg font-semibold">{snapshot?.activeTabId ?? '-'}</p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Session
              </p>
              <p className="mt-2 text-lg font-semibold capitalize">
                {snapshot?.activeSession?.status ?? 'idle'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Backend
              </p>
              <p className="mt-2 text-lg font-semibold">{backendHealth?.status ?? 'offline'}</p>
            </div>
          </div>
          {snapshotError ? <p className="text-sm text-rose-500">{snapshotError}</p> : null}
        </Card>
      </div>
    </main>
  );
}
