import { getProfileCompletion } from '../completion';
import { useProfileStore } from '../store';

export function ProfileSummaryCard(): JSX.Element {
  const record = useProfileStore((state) => state.record);
  const isSaving = useProfileStore((state) => state.isSaving);
  const lastSavedAt = useProfileStore((state) => state.lastSavedAt);
  const saveError = useProfileStore((state) => state.saveError);

  const completion = getProfileCompletion(record.profile);

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Profile Readiness</h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Keep your personal details and resume inventory current so autofill and AI response
            generation have reliable source data.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{completion.percentage}%</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {completion.completedFields}/{completion.totalFields} core fields
          </p>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)] md:grid-cols-3">
        <div>Resumes: {record.resumes.length}</div>
        <div>{isSaving ? 'Saving changes...' : 'Autosave enabled'}</div>
        <div>{lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet'}</div>
      </div>
      {saveError ? <p className="mt-3 text-sm text-red-600">{saveError}</p> : null}
    </article>
  );
}
