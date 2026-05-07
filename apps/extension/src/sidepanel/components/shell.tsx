import type { PropsWithChildren } from 'react';

export function Shell({ children }: PropsWithChildren): JSX.Element {
  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-8">
        <header className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            CareerOS AI
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Application Copilot Workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
            Analyze job fit, tailor your application assets, and keep your browser-side job search
            workflow connected to a typed backend intelligence layer.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
