import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { HeroCard } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useStorageValue } from '@/lib/hooks/use-storage-value';

export function Shell({ children }: PropsWithChildren): JSX.Element {
  const settings = useStorageValue('settings', 'local');
  const { updateSettings } = useExtensionActions();

  return (
    <main className="min-h-screen text-[var(--color-text)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
        <HeroCard className="relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                CareerOS AI
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                Application Copilot
                <span className="gradient-text"> Workspace</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-muted)] md:text-base">
                A premium operator console for AI-assisted job search: autofill, research, application
                analytics, and tailored writing workflows in one fast browser-native environment.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <ThemeToggle
                value={settings?.themeMode ?? 'system'}
                onChange={(themeMode) => void updateSettings({ themeMode })}
              />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'AI agents', value: '5' },
                  { label: 'Surfaces', value: '3' },
                  { label: 'Workflows', value: 'Live' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.35 }}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3 text-center shadow-[var(--shadow-soft)]"
                  >
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-xl font-semibold">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </HeroCard>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}
