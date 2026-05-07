import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { getProfileCompletion } from '../completion';
import { useProfileStore } from '../store';

export function ProfileSummaryCard(): JSX.Element {
  const record = useProfileStore((state) => state.record);
  const isSaving = useProfileStore((state) => state.isSaving);
  const lastSavedAt = useProfileStore((state) => state.lastSavedAt);
  const saveError = useProfileStore((state) => state.saveError);

  const completion = getProfileCompletion(record.profile);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass-panel rounded-[var(--radius-card)] p-5"
    >
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
          <Badge>{completion.completedFields}/{completion.totalFields} fields</Badge>
        </div>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--color-surface-muted)]/90">
        <div
          className="h-full rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] transition-all"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)] md:grid-cols-3">
        <div>Resumes: {record.resumes.length}</div>
        <div>{isSaving ? 'Saving changes...' : 'Autosave enabled'}</div>
        <div>{lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet'}</div>
      </div>
      {saveError ? <p className="mt-3 text-sm text-red-600">{saveError}</p> : null}
    </motion.article>
  );
}
