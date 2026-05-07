import { useState } from 'react';
import { formatFileSize } from '../file-utils';
import { useProfileStore } from '../store';

export function ResumeManager(): JSX.Element {
  const resumes = useProfileStore((state) => state.record.resumes);
  const uploadResumeFiles = useProfileStore((state) => state.uploadResumeFiles);
  const updateResumeTags = useProfileStore((state) => state.updateResumeTags);
  const setPrimaryResume = useProfileStore((state) => state.setPrimaryResume);
  const removeResume = useProfileStore((state) => state.removeResume);
  const [draftTags, setDraftTags] = useState<Record<string, string>>({});

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Resumes</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Upload multiple resume versions, assign tags, and mark a primary default.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)]">
          Upload resumes
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            multiple
            onChange={(event) => {
              const files = event.currentTarget.files;
              if (files && files.length > 0) {
                void uploadResumeFiles(files);
                event.currentTarget.value = '';
              }
            }}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-4">
        {resumes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white/70 p-6 text-sm text-[var(--color-text-muted)]">
            No resumes uploaded yet. Add multiple versions such as `frontend`, `backend`, or `senior-ic`.
          </div>
        ) : null}

        {resumes.map((resume) => (
          <article
            key={resume.id}
            className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 md:grid-cols-[1.5fr_1fr]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-base font-semibold">{resume.fileName}</h3>
                {resume.isPrimary ? (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Primary
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {formatFileSize(resume.sizeBytes)} | Uploaded{' '}
                {new Date(resume.uploadedAt).toLocaleString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {resume.tags.length > 0 ? (
                  resume.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">No tags yet</span>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">Tags</span>
                <input
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  placeholder="frontend, remote, senior"
                  value={draftTags[resume.id] ?? resume.tags.join(', ')}
                  onChange={(event) =>
                    setDraftTags((current) => ({
                      ...current,
                      [resume.id]: event.currentTarget.value,
                    }))
                  }
                  onBlur={() => {
                    const nextTags = (draftTags[resume.id] ?? resume.tags.join(', '))
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean);
                    void updateResumeTags(resume.id, nextTags);
                    setDraftTags((current) => ({
                      ...current,
                      [resume.id]: nextTags.join(', '),
                    }));
                  }}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {!resume.isPrimary ? (
                  <button
                    type="button"
                    className="rounded-full border border-[var(--color-border)] px-3 py-2 text-sm font-medium"
                    onClick={() => void setPrimaryResume(resume.id)}
                  >
                    Set primary
                  </button>
                ) : null}
                <button
                  type="button"
                  className="rounded-full px-3 py-2 text-sm font-medium text-red-600"
                  onClick={() => void removeResume(resume.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
