import '@/styles/tailwind.css';

export function PopupApp(): JSX.Element {
  return (
    <main className="w-[360px] bg-[var(--color-background)] p-4 text-[var(--color-text)]">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          CareerOS AI
        </p>
        <h1 className="mt-2 text-lg font-semibold">Extension Ready</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Popup scaffold is connected and ready for lightweight actions.
        </p>
      </div>
    </main>
  );
}
