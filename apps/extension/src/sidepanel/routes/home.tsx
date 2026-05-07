import { useExtensionStore } from '../store/use-extension-store';

export function HomeRoute(): JSX.Element {
  const backendHealth = useExtensionStore((state) => state.backendHealth);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Extension Status</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Background worker, typed messaging, and content-script bootstrapping are configured.
        </p>
      </article>
      <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Backend Health</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {backendHealth?.status ? `API status: ${backendHealth.status}` : 'Backend not connected'}
        </p>
      </article>
    </section>
  );
}
