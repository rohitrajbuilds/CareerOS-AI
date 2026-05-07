import type { ApplicationDashboardRecord } from '@careeros/shared-types';
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

export { createApplicationFromJobContext, updateApplicationStatus } from './domain';
