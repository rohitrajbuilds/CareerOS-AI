import type {
  ApplicationDashboardRecord,
  ApplicationPriority,
  ApplicationRecord,
  ApplicationStatus,
  JobPageContext,
} from '@careeros/shared-types';
import {
  ACTIVE_APPLICATION_STATUSES,
  RESPONSE_RECEIVED_APPLICATION_STATUSES,
} from '@careeros/shared-types';

function nowIso(): string {
  return new Date().toISOString();
}

export function createStatusEvent(status: ApplicationStatus, note?: string) {
  return {
    id: crypto.randomUUID(),
    status,
    createdAt: nowIso(),
    note: note?.trim() || undefined,
  };
}

export function inferApplicationTags(jobContext: JobPageContext): string[] {
  const tags = new Set<string>();
  if (jobContext.provider !== 'unknown') {
    tags.add(jobContext.provider);
  }
  if (jobContext.companyName) {
    tags.add(jobContext.companyName.toLowerCase().replace(/\s+/g, '-'));
  }
  return [...tags].slice(0, 6);
}

export function createApplicationFromJobContext(
  jobContext: JobPageContext,
  options?: {
    status?: ApplicationStatus;
    priority?: ApplicationPriority;
    location?: string;
    salaryText?: string;
    notes?: string;
  },
): ApplicationRecord {
  const timestamp = nowIso();
  const status = options?.status ?? 'applied';
  return {
    id: crypto.randomUUID(),
    companyName: jobContext.companyName?.trim() || 'Unknown Company',
    roleTitle: jobContext.roleTitle?.trim() || 'Untitled Role',
    location: options?.location,
    sourcePlatform: jobContext.provider,
    sourceUrl: jobContext.url,
    salaryText: options?.salaryText,
    notes: options?.notes?.trim() || undefined,
    priority: options?.priority ?? 'medium',
    status,
    appliedAt:
      ACTIVE_APPLICATION_STATUSES.includes(status) ||
      RESPONSE_RECEIVED_APPLICATION_STATUSES.includes(status)
        ? timestamp
        : undefined,
    interviewCount: status === 'interviewing' ? 1 : 0,
    lastResponseAt: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    history: [createStatusEvent(status, options?.notes)],
    tags: inferApplicationTags(jobContext),
  };
}

export function updateApplicationStatus(
  application: ApplicationRecord,
  status: ApplicationStatus,
  note?: string,
): ApplicationRecord {
  const timestamp = nowIso();
  return {
    ...application,
    status,
    interviewCount:
      status === 'interviewing'
        ? Math.max(application.interviewCount + (application.status === 'interviewing' ? 0 : 1), 1)
        : application.interviewCount,
    appliedAt: application.appliedAt ?? (status !== 'saved' ? timestamp : undefined),
    lastResponseAt: RESPONSE_RECEIVED_APPLICATION_STATUSES.includes(status)
      ? timestamp
      : application.lastResponseAt,
    updatedAt: timestamp,
    history: [...application.history, createStatusEvent(status, note)],
  };
}

function matchesJobContext(application: ApplicationRecord, jobContext: JobPageContext): boolean {
  return (
    application.sourceUrl === jobContext.url ||
    (application.companyName === (jobContext.companyName ?? '') &&
      application.roleTitle === (jobContext.roleTitle ?? ''))
  );
}

export function upsertApplicationFromJobContext(
  record: ApplicationDashboardRecord,
  jobContext: JobPageContext,
  options?: {
    status?: ApplicationStatus;
    priority?: ApplicationPriority;
    notes?: string;
  },
): ApplicationRecord[] {
  const duplicateIndex = record.applications.findIndex((application) =>
    matchesJobContext(application, jobContext),
  );

  if (duplicateIndex < 0) {
    return [
      createApplicationFromJobContext(jobContext, {
        status: options?.status ?? 'applied',
        priority: options?.priority ?? 'medium',
        notes: options?.notes,
      }),
      ...record.applications,
    ];
  }

  const nextApplications = [...record.applications];
  const existing = nextApplications[duplicateIndex];
  nextApplications[duplicateIndex] = {
    ...existing,
    sourcePlatform: jobContext.provider,
    sourceUrl: jobContext.url,
    updatedAt: nowIso(),
    notes: options?.notes?.trim() || existing.notes,
  };
  return nextApplications;
}

export function updateApplicationRecord(
  record: ApplicationDashboardRecord,
  applicationId: string,
  updater: (application: ApplicationRecord) => ApplicationRecord,
): ApplicationRecord[] {
  return record.applications.map((application) =>
    application.id === applicationId ? updater(application) : application,
  );
}
