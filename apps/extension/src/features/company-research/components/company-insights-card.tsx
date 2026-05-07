import { useExtensionStore } from '@/sidepanel/store/use-extension-store';
import { useCompanyResearch } from '../hooks/use-company-research';

function SectionTitle({ children }: { children: string }): JSX.Element {
  return <h3 className="text-lg font-semibold text-[var(--color-text)]">{children}</h3>;
}

export function CompanyInsightsCard(): JSX.Element {
  const research = useExtensionStore((state) => state.companyResearch);
  const loading = useExtensionStore((state) => state.companyResearchLoading);
  const error = useExtensionStore((state) => state.companyResearchError);
  const { researchCurrentCompany } = useCompanyResearch();

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,250,240,0.98),rgba(255,255,255,0.98),rgba(237,250,255,0.98))] p-6 shadow-sm md:col-span-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_60%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Company Research
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
              Turn the job page into company insights and interview prep
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
              We extract mission, likely stack, culture signals, and personalized motivation answers
              from the current role so you can prepare faster and sound more specific.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => void researchCurrentCompany()}
            disabled={loading}
          >
            {loading ? 'Researching company...' : 'Research company'}
          </button>
        </div>
        {error ? <p className="relative mt-4 text-sm text-rose-700">{error}</p> : null}
      </article>

      {loading ? (
        <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:col-span-2">
          <div className="grid gap-4">
            <div className="h-6 w-56 animate-pulse rounded-full bg-[var(--color-border)]/70" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-36 animate-pulse rounded-3xl bg-[var(--color-border)]/70" />
              <div className="h-36 animate-pulse rounded-3xl bg-[var(--color-border)]/70" />
            </div>
            <div className="h-48 animate-pulse rounded-3xl bg-[var(--color-border)]/70" />
          </div>
        </article>
      ) : null}

      {research ? (
        <>
          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              {research.companyName}
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Company Insights Card</h3>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text)]">{research.summary}</p>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Mission signal</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">{research.mission}</p>
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <SectionTitle>Likely Tech Stack</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              {research.techStack.length ? (
                research.techStack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-sky-500/12 px-3 py-2 text-xs font-semibold text-sky-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  No explicit stack signals were detected from the current job page.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <SectionTitle>Culture Signals</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              {research.cultureSignals.length ? (
                research.cultureSignals.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-emerald-500/12 px-3 py-2 text-xs font-semibold text-emerald-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  No explicit culture signals were detected from the current job page.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <SectionTitle>Key Insights</SectionTitle>
            <div className="mt-4 grid gap-3">
              {research.companyInsights.map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--color-border)] bg-white/85 p-4">
                  <p className="text-sm text-[var(--color-text)]">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <SectionTitle>Interview Prep</SectionTitle>
            <div className="mt-4 grid gap-3">
              {research.interviewPrep.map((item) => (
                <div key={item.question} className="rounded-2xl border border-[var(--color-border)] bg-white/85 p-4">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{item.question}</p>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">{item.rationale}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.talkingPoints.map((point) => (
                      <span
                        key={point}
                        className="rounded-full bg-violet-500/12 px-3 py-2 text-xs font-medium text-violet-700"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:col-span-2">
            <SectionTitle>Tailored Motivation Answers</SectionTitle>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4">
                <p className="text-sm font-semibold">Why this company</p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                  {research.tailoredMotivationAnswers.whyThisCompany}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4">
                <p className="text-sm font-semibold">Why this role</p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                  {research.tailoredMotivationAnswers.whyThisRole}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4">
                <p className="text-sm font-semibold">Value alignment</p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                  {research.tailoredMotivationAnswers.valueAlignment}
                </p>
              </div>
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
