import type { ApplicationRecord } from '@careeros/shared-types';

function escapeCsv(value: string | number | undefined): string {
  const normalized = String(value ?? '');
  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
}

export function buildApplicationsCsv(applications: ApplicationRecord[]): string {
  const header = [
    'Company',
    'Role',
    'Status',
    'Priority',
    'Source Platform',
    'Source URL',
    'Applied At',
    'Interview Count',
    'Last Response At',
    'Tags',
    'Notes',
    'Updated At',
  ];

  const rows = applications.map((application) => [
    application.companyName,
    application.roleTitle,
    application.status,
    application.priority,
    application.sourcePlatform,
    application.sourceUrl,
    application.appliedAt,
    application.interviewCount,
    application.lastResponseAt,
    application.tags.join('|'),
    application.notes,
    application.updatedAt,
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(value as string | number | undefined)).join(','))
    .join('\n');
}

export function downloadApplicationsCsv(applications: ApplicationRecord[]): void {
  const csv = buildApplicationsCsv(applications);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `careeros-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
