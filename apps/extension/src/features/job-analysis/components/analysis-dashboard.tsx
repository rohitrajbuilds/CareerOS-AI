import type { JobAnalysisRecommendation, JobRequirement } from '@careeros/shared-types';
import {
  selectJobAnalysis,
  selectJobAnalysisError,
  selectJobAnalysisLoading,
} from '@/sidepanel/store/selectors';
import { useExtensionStore } from '@/sidepanel/store/use-extension-store';
import { useJobAnalysis } from '../hooks/use-job-analysis';
import { BreakdownChart } from './breakdown-chart';
import { ScoreRing } from './score-ring';

function indicatorClasses(indicator: 'strong' | 'moderate' | 'weak'): string {
  switch (indicator) {
    case 'strong':
      return 'bg-emerald-500/15 text-emerald-700 ring-emerald-200';
    case 'moderate':
      return 'bg-amber-500/15 text-amber-700 ring-amber-200';
    default:
      return 'bg-rose-500/15 text-rose-700 ring-rose-200';
  }
}

function priorityClasses(priority: JobAnalysisRecommendation['priority']): string {
  switch (priority) {
    case 'high':
      return 'border-rose-200 bg-rose-50';
    case 'medium':
      return 'border-amber-200 bg-amber-50';
    default:
      return 'border-emerald-200 bg-emerald-50';
  }
}

function renderRequirement(requirement: JobRequirement): JSX.Element {
  return (
    <li
      key={requirement.id}
      className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-white/85 px-4 py-3"
    >
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{requirement.text}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          {requirement.category} | {Math.round(requirement.confidence * 100)}% confidence
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
          requirement.matched
            ? 'bg-emerald-500/15 text-emerald-700'
            : 'bg-rose-500/15 text-rose-700'
        }`}
      >
        {requirement.matched ? 'Matched' : 'Missing'}
      </span>
    </li>
  );
}

export function AnalysisDashboard(): JSX.Element {
  const analysis = useExtensionStore(selectJobAnalysis);
  const loading = useExtensionStore(selectJobAnalysisLoading);
  const error = useExtensionStore(selectJobAnalysisError);
  const { analyzeCurrentJob } = useJobAnalysis();

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(230,244,255,0.96),rgba(255,245,228,0.98))] p-6 shadow-sm md:col-span-2">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Job Match Studio
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
              Analyze the current job description against your profile
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
              We extract requirements, detect skills, score ATS fit, compare against your resume,
              and surface tailored recommendations with AI-assisted insights.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => void analyzeCurrentJob()}
            disabled={loading}
          >
            {loading ? 'Analyzing current job...' : 'Analyze current job'}
          </button>
        </div>
        {error ? <p className="relative mt-4 text-sm text-rose-700">{error}</p> : null}
      </article>

      {loading ? (
        <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:col-span-2">
          <div className="grid gap-4">
            <div className="h-6 w-56 animate-pulse rounded-full bg-[var(--color-border)]/70" />
            <div className="grid gap-3 md:grid-cols-3">
              <div className="h-36 animate-pulse rounded-3xl bg-[var(--color-border)]/70" />
              <div className="h-36 animate-pulse rounded-3xl bg-[var(--color-border)]/70" />
              <div className="h-36 animate-pulse rounded-3xl bg-[var(--color-border)]/70" />
            </div>
            <div className="h-40 animate-pulse rounded-3xl bg-[var(--color-border)]/70" />
          </div>
        </article>
      ) : null}

      {analysis ? (
        <>
          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  {analysis.jobContext.companyName || 'Current employer'}
                </p>
                <h3 className="mt-1 text-2xl font-semibold">
                  {analysis.jobContext.roleTitle || 'Job analysis'}
                </h3>
              </div>
              <span
                className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ring-1 ${indicatorClasses(
                  analysis.matchIndicator,
                )}`}
              >
                {analysis.matchIndicator} match
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ScoreRing label="ATS score" score={analysis.atsScore} tone="primary" />
              <ScoreRing label="Match score" score={analysis.matchScore} tone="success" />
              <ScoreRing
                label="Keyword alignment"
                score={analysis.breakdown.keywordAlignment}
                tone="warning"
              />
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Scoring Breakdown</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Each score blends skills, requirement coverage, keyword overlap, education fit, and
              experience depth.
            </p>
            <div className="mt-5">
              <BreakdownChart breakdown={analysis.breakdown} />
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Skill Match</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.detectedSkills.length ? (
                analysis.detectedSkills.map((skill) => (
                  <span
                    key={skill.normalizedName}
                    className={`rounded-full px-3 py-2 text-xs font-semibold ${
                      skill.matched
                        ? 'bg-emerald-500/15 text-emerald-700'
                        : 'bg-rose-500/15 text-rose-700'
                    }`}
                  >
                    {skill.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  No explicit skills were extracted from this job page yet.
                </p>
              )}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">Matched skills</p>
                <p className="mt-2 text-sm text-emerald-700">
                  {analysis.matchedSkills.join(', ') || 'No direct skill matches detected yet.'}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-800">Missing skills</p>
                <p className="mt-2 text-sm text-rose-700">
                  {analysis.missingSkills.join(', ') || 'No critical missing skills detected.'}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Top Requirements</h3>
            <ul className="mt-4 grid gap-3">
              {analysis.requirements.slice(0, 6).map(renderRequirement)}
            </ul>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Recommendations</h3>
            <div className="mt-4 grid gap-3">
              {analysis.recommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className={`rounded-2xl border p-4 ${priorityClasses(recommendation.priority)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {recommendation.title}
                    </p>
                    <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                      {recommendation.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                    {recommendation.detail}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">AI Insights</h3>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {analysis.aiInsights.generated ? 'AI-generated' : 'Heuristic fallback'}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text)]">
              {analysis.aiInsights.summary}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4">
                <p className="text-sm font-semibold">Strengths</p>
                <div className="mt-3 grid gap-2">
                  {analysis.aiInsights.strengths.map((item) => (
                    <p key={item} className="text-sm text-[var(--color-text-muted)]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4">
                <p className="text-sm font-semibold">Risks</p>
                <div className="mt-3 grid gap-2">
                  {analysis.aiInsights.risks.map((item) => (
                    <p key={item} className="text-sm text-[var(--color-text-muted)]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-white/90 p-4">
                <p className="text-sm font-semibold">Next steps</p>
                <div className="mt-3 grid gap-2">
                  {analysis.aiInsights.nextSteps.map((item) => (
                    <p key={item} className="text-sm text-[var(--color-text-muted)]">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </>
      ) : null}
    </section>
  );
}
