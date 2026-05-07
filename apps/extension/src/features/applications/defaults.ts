import type { ApplicationDashboardRecord } from '@careeros/shared-types';

export function createEmptyApplicationDashboardRecord(): ApplicationDashboardRecord {
  const now = new Date().toISOString();
  return {
    applications: [],
    createdAt: now,
    updatedAt: now,
  };
}
