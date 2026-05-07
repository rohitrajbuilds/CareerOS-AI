import '@/styles/tailwind.css';

export function OptionsApp(): JSX.Element {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 text-[var(--color-text)]">
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">CareerOS AI Settings</h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          This options page is intentionally lightweight and ready for account, privacy, and
          profile settings.
        </p>
      </div>
    </main>
  );
}
