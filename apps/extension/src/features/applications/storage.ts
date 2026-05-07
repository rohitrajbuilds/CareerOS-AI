import type {
  ApplicationDashboardRecord,
  ApplicationPriority,
  ApplicationRecord,
  ApplicationStatus,
  ATSProvider,
  JobPageContext,
} from '@careeros/shared-types';
import { decryptJson, encryptJson } from '@/lib/security/encryption';
import { createEmptyApplicationDashboardRecord } from './defaults';
import { applicationDashboardRecordSchema } from './schema';

const APPLICATION_DASHBOARD_STORAGE_KEY = 'encryptedApplicationDashboardRecord';

export async function loadApplicationDashboardRecord(): Promise<ApplicationDashboardRecord> {
  const result = await chrome.storage.local.get(APPLICATION_DASHBOARD_STORAGE_KEY);
  const serialized = result[APPLICATION_DASHBOARD_STORAGE_KEY];

  if (typeof serialized !== 'string') {
    return createEmptyApplicationDashboardRecord();
  }

  try {
    const parsed = await decryptJson<ApplicationDashboardRecord>(serialized);
    return applicationDashboardRecordSchema.parse(parsed);
  } catch {
    return createEmptyApplicationDashboardRecord();
  }
}

export async function saveApplicationDashboardRecord(
  record: ApplicationDashboardRecord,
): Promise<ApplicationDashboardRecord> {
  const validated = applicationDashboardRecordSchema.parse(record);
  const encrypted = await encryptJson(validated);
  await chrome.storage.local.set({
    [APPLICATION_DASHBOARD_STORAGE_KEY]: encrypted,
  });
  return validated;
}

function createStatusEvent(status: ApplicationStatus, note?: string) {
  return {
    id: crypto.randomUUID(),
    status,
    createdAt: new Date().toISOString(),
    note: note?.trim() || undefined,
  };
}

function inferTags(jobContext: JobPageContext): string[] {
  const tags = new Set<string>();
  if (jobContext.provider && jobContext.provider !== 'unknown') {
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
  const now = new Date().toISOString();
  const status = options?.status ?? 'applied';
  return {
    id: crypto.randomUUID(),
    companyName: jobContext.companyName?.trim() || 'Unknown Company',
    roleTitle: jobContext.roleTitle?.trim() || 'Untitled Role',
    location: options?.location,
    sourcePlatform: jobContext.provider as ATSProvider,
    sourceUrl: jobContext.url,
    salaryText: options?.salaryText,
    notes: options?.notes?.trim() || undefined,
    priority: options?.priority ?? 'medium',
    status,
    appliedAt: status === 'applied' || status === 'interviewing' || status === 'offer' || status === 'rejected'
      ? now
      : undefined,
    interviewCount: status === 'interviewing' ? 1 : 0,
    lastResponseAt: undefined,
    createdAt: now,
    updatedAt: now,
    history: [createStatusEvent(status, options?.notes)],
    tags: inferTags(jobContext),
  };
}

export function updateApplicationStatus(
  application: ApplicationRecord,
  status: ApplicationStatus,
  note?: string,
): ApplicationRecord {
  const now = new Date().toISOString();
  const nextInterviewCount =
    status === 'interviewing'
      ? Math.max(application.interviewCount + (application.status === 'interviewing' ? 0 : 1), 1)
      : application.interviewCount;

  return {
    ...application,
    status,
    interviewCount: nextInterviewCount,
    appliedAt: application.appliedAt ?? (status !== 'saved' ? now : undefined),
    lastResponseAt: ['interviewing', 'offer', 'rejected'].includes(status) ? now : application.lastResponseAt,
    updatedAt: now,
    history: [...application.history, createStatusEvent(status, note)],
  };
}
