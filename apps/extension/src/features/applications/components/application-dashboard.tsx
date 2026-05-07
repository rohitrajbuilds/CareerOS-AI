import type {
  ApplicationPriority,
  ApplicationRecord,
  ApplicationStatus,
} from '@careeros/shared-types';
import { APPLICATION_STATUSES } from '@careeros/shared-types';
import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import {
  selectApplicationAnalytics,
  selectApplicationDashboard,
  selectApplicationDashboardError,
  selectApplicationDashboardLoading,
} from '@/sidepanel/store/selectors';
import { useExtensionStore } from '@/sidepanel/store/use-extension-store';
import { useApplicationDashboard } from '../hooks/use-application-dashboard';

type SortKey = 'updatedAt' | 'createdAt' | 'companyName' | 'roleTitle' | 'status';

const STATUS_OPTIONS: ApplicationStatus[] = APPLICATION_STATUSES;

const PRIORITY_OPTIONS: Array<ApplicationPriority | 'all'> = ['all', 'high', 'medium', 'low'];

function statusClasses(status: ApplicationStatus): string {
  switch (status) {
    case 'offer':
      return 'bg-emerald-500/15 text-emerald-700';
    case 'interviewing':
      return 'bg-sky-500/15 text-sky-700';
    case 'rejected':
      return 'bg-rose-500/15 text-rose-700';
    case 'withdrawn':
      return 'bg-slate-400/20 text-slate-700';
    case 'saved':
      return 'bg-amber-500/15 text-amber-700';
    default:
      return 'bg-violet-500/15 text-violet-700';
  }
}

function priorityClasses(priority: ApplicationPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-rose-500/12 text-rose-700';
    case 'medium':
      return 'bg-amber-500/12 text-amber-700';
    default:
      return 'bg-emerald-500/12 text-emerald-700';
  }
}

function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleDateString();
}

function AnalyticsStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}): JSX.Element {
  return (
    <article className="rounded-3xl border border-[var(--color-border)] bg-white/90 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </article>
  );
}

function MiniBarChart({
  items,
}: {
  items: Array<{
    label: string;
    value: number;
    tone: string;
  }>;
}): JSX.Element {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.label} className="grid gap-2">
          <div className="flex items-center justify-between text-sm">
            <span>{item.label}</span>
            <span className="text-[var(--color-text-muted)]">{item.value}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--color-border)]/70">
            <div
              className={`h-full rounded-full ${item.tone} transition-[width] duration-700 ease-out`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthlyChart({
  items,
}: {
  items: Array<{
    month: string;
    count: number;
  }>;
}): JSX.Element {
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <div className="flex h-44 items-end gap-3">
      {items.length ? (
        items.map((item) => (
          <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-2xl bg-[linear-gradient(180deg,#0f766e,#14b8a6)] transition-[height] duration-700 ease-out"
                style={{ height: `${Math.max(12, (item.count / max) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] font-medium text-[var(--color-text-muted)]">{item.month}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">No application trend yet.</p>
      )}
    </div>
  );
}

function ApplicationRow({
  application,
  onStatusChange,
  onNoteBlur,
}: {
  application: ApplicationRecord;
  onStatusChange: (applicationId: string, status: ApplicationStatus) => void;
  onNoteBlur: (applicationId: string, notes: string) => void;
}): JSX.Element {
  const [draftNote, setDraftNote] = useState(application.notes ?? '');

  return (
    <tr className="border-b border-[var(--color-border)]/70 align-top last:border-b-0">
      <td className="px-4 py-4">
        <div>
          <p className="font-semibold text-[var(--color-text)]">{application.companyName}</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{application.roleTitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(application.status)}`}>
              {application.status}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses(application.priority)}`}>
              {application.priority}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
        <div className="grid gap-1">
          <span>{application.sourcePlatform}</span>
          <span>{formatDate(application.appliedAt)}</span>
          <a
            className="text-[var(--color-primary)] hover:underline"
            href={application.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open posting
          </a>
        </div>
      </td>
      <td className="px-4 py-4">
        <label className="grid gap-2 text-sm">
          <span className="text-[var(--color-text-muted)]">Status</span>
          <select
            className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2"
            value={application.status}
            onChange={(event) => onStatusChange(application.id, event.currentTarget.value as ApplicationStatus)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </td>
      <td className="px-4 py-4">
        <div className="grid gap-2 text-sm">
          <span className="text-[var(--color-text-muted)]">
            Interviews: {application.interviewCount}
          </span>
          <span className="text-[var(--color-text-muted)]">
            Last response: {formatDate(application.lastResponseAt)}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <textarea
          className="min-h-24 w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
          value={draftNote}
          placeholder="Add notes, recruiter replies, next steps..."
          onChange={(event) => setDraftNote(event.currentTarget.value)}
          onBlur={() => onNoteBlur(application.id, draftNote)}
        />
      </td>
    </tr>
  );
}

export function ApplicationDashboard(): JSX.Element {
  const dashboard = useExtensionStore(selectApplicationDashboard);
  const analytics = useExtensionStore(selectApplicationAnalytics);
  const loading = useExtensionStore(selectApplicationDashboardLoading);
  const error = useExtensionStore(selectApplicationDashboardError);
  const { saveCurrentApplication, changeApplicationStatus, updateApplicationNotes, exportCsv } =
    useApplicationDashboard();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ApplicationPriority | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const deferredSearch = useDeferredValue(search);
  const applications = dashboard?.applications ?? [];

  const filteredApplications = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    const next = applications.filter((application) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          application.companyName,
          application.roleTitle,
          application.sourcePlatform,
          application.notes ?? '',
          application.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || application.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return next.sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];
      const leftNormalized = typeof leftValue === 'string' ? leftValue.toLowerCase() : String(leftValue ?? '');
      const rightNormalized =
        typeof rightValue === 'string' ? rightValue.toLowerCase() : String(rightValue ?? '');
      const comparison = leftNormalized.localeCompare(rightNormalized);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [applications, deferredSearch, priorityFilter, sortDirection, sortKey, statusFilter]);

  return (
    <section className="grid gap-4">
      <article className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(244,248,255,0.98),rgba(255,255,255,0.98),rgba(238,255,247,0.98))] p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_58%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Application Tracking
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
              Track pipeline health, interviews, and response rates
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
              Save the current application, monitor outcomes, analyze funnel performance, and export your pipeline as CSV.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              onClick={() => void saveCurrentApplication()}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save current application'}
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-semibold"
              onClick={() => void exportCsv()}
            >
              Export CSV
            </button>
          </div>
        </div>
        {error ? <p className="relative mt-4 text-sm text-rose-700">{error}</p> : null}
      </article>

      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsStat
          label="Total applications"
          value={analytics?.totalApplications ?? 0}
          accent="text-slate-900"
        />
        <AnalyticsStat
          label="Response rate"
          value={`${analytics?.responseRate ?? 0}%`}
          accent="text-sky-700"
        />
        <AnalyticsStat
          label="Interviews"
          value={analytics?.interviewCount ?? 0}
          accent="text-emerald-700"
        />
        <AnalyticsStat
          label="Rejections"
          value={analytics?.rejectionCount ?? 0}
          accent="text-rose-700"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Pipeline Funnel</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Snapshot of how applications are moving through the hiring funnel.
          </p>
          <div className="mt-5">
            <MiniBarChart
              items={[
                { label: 'Saved', value: analytics?.statusCounts.saved ?? 0, tone: 'bg-amber-500' },
                { label: 'Applied', value: analytics?.statusCounts.applied ?? 0, tone: 'bg-violet-500' },
                { label: 'Interviewing', value: analytics?.statusCounts.interviewing ?? 0, tone: 'bg-sky-500' },
                { label: 'Offers', value: analytics?.statusCounts.offer ?? 0, tone: 'bg-emerald-500' },
                { label: 'Rejected', value: analytics?.statusCounts.rejected ?? 0, tone: 'bg-rose-500' },
              ]}
            />
          </div>
        </article>

        <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Application Trend</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Monthly application volume for quick pacing checks.
          </p>
          <div className="mt-5">
            <MonthlyChart items={analytics?.monthlyApplications ?? []} />
          </div>
        </article>
      </div>

      <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Applications</h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Search, filter, and sort your pipeline with inline status updates.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <input
              className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
              placeholder="Search company, role, note..."
              value={search}
              onChange={(event) => {
                const value = event.currentTarget.value;
                startTransition(() => setSearch(value));
              }}
            />
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.currentTarget.value as ApplicationStatus | 'all')
              }
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.currentTarget.value as ApplicationPriority | 'all')
              }
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All priorities' : priority}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
              value={`${sortKey}:${sortDirection}`}
              onChange={(event) => {
                const [nextSortKey, nextSortDirection] = event.currentTarget.value.split(':') as [
                  SortKey,
                  'asc' | 'desc',
                ];
                setSortKey(nextSortKey);
                setSortDirection(nextSortDirection);
              }}
            >
              <option value="updatedAt:desc">Newest activity</option>
              <option value="createdAt:desc">Newest created</option>
              <option value="companyName:asc">Company A-Z</option>
              <option value="roleTitle:asc">Role A-Z</option>
              <option value="status:asc">Status</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-[var(--color-background)]/80">
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length ? (
                  filteredApplications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onStatusChange={(applicationId, status) =>
                        void changeApplicationStatus(applicationId, status)
                      }
                      onNoteBlur={(applicationId, notes) =>
                        void updateApplicationNotes(applicationId, notes)
                      }
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
                      No applications match the current filters yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  );
}
