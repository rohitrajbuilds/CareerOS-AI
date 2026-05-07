import '@/styles/tailwind.css';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useStorageValue } from '@/lib/hooks/use-storage-value';
import { ProfileEditor } from '@/features/profile/components/profile-editor';
import { ResumeManager } from '@/features/profile/components/resume-manager';
import { ProfileSummaryCard } from '@/features/profile/components/profile-summary';
import { useProfileBootstrap } from '@/features/profile/hooks/use-profile-bootstrap';
import { useProfileStore } from '@/features/profile/store';
import { useThemeSync } from '@/lib/theme/theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, HeroCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function OptionsApp(): JSX.Element {
  useProfileBootstrap();
  useThemeSync();

  const settings = useStorageValue('settings', 'local');
  const { updateSettings } = useExtensionActions();
  const isLoaded = useProfileStore((state) => state.isLoaded);

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--color-text)] md:px-6 md:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <HeroCard className="overflow-hidden p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                CareerOS AI
              </p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Workspace Preferences</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)] md:text-base">
                Build a structured source-of-truth profile for autofill, resume routing, and
                AI-generated application responses. Everything is wrapped in local encrypted storage
                and a premium operator console designed for daily job-search flow.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge tone={isLoaded ? 'success' : 'warning'}>
                {isLoaded ? 'Autosave active' : 'Loading profile'}
              </Badge>
              <ThemeToggle
                value={settings?.themeMode ?? 'system'}
                onChange={(themeMode) => void updateSettings({ themeMode })}
              />
            </div>
          </div>
        </HeroCard>

        <ProfileSummaryCard />

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card className="p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Core Profile</h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                This information powers field mapping, smart response generation, and ATS-specific
                autofill behavior.
              </p>
            </div>
            {isLoaded ? (
              <ProfileEditor />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-sm text-[var(--color-text-muted)]">
                Loading profile editor...
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-6">
            <ResumeManager />

            <Card className="p-5">
              <h2 className="text-lg font-semibold">Extension Preferences</h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                These settings stay shared across popup, background, sidepanel, and options.
              </p>
              <div className="mt-5 grid gap-4">
                <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3">
                  <span className="text-sm">Extension enabled</span>
                  <input
                    type="checkbox"
                    checked={settings?.extensionEnabled ?? false}
                    onChange={(event) =>
                      void updateSettings({ extensionEnabled: event.currentTarget.checked })
                    }
                  />
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3">
                  <span className="text-sm">Auto-open sidepanel</span>
                  <input
                    type="checkbox"
                    checked={settings?.autoOpenSidePanel ?? false}
                    onChange={(event) =>
                      void updateSettings({ autoOpenSidePanel: event.currentTarget.checked })
                    }
                  />
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3">
                  <span className="text-sm">Debug mode</span>
                  <input
                    type="checkbox"
                    checked={settings?.debugMode ?? false}
                    onChange={(event) =>
                      void updateSettings({ debugMode: event.currentTarget.checked })
                    }
                  />
                </label>
                <Button
                  variant="secondary"
                  className="justify-center"
                  onClick={() => void updateSettings({ themeMode: settings?.themeMode ?? 'system' })}
                >
                  Sync preferences
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
