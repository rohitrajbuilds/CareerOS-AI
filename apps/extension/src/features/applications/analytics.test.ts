import type { ApplicationRecord } from '@careeros/shared-types';
import { describe, expect, it } from 'vitest';
import { buildApplicationAnalytics } from './analytics';

function createApplication(overrides: Partial<ApplicationRecord>): ApplicationRecord {
  return {
    id: 'app-1',
    companyName: 'CareerOS',
    roleTitle: 'Frontend Engineer',
    sourcePlatform: 'linkedin',
    sourceUrl: 'https://example.com/job',
    priority: 'medium',
    status: 'applied',
    interviewCount: 0,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-01-15T10:00:00.000Z',
    history: [],
    tags: [],
    ...overrides,
  };
}

describe('buildApplicationAnalytics', () => {
  it('computes rates and counts across statuses', () => {
    const analytics = buildApplicationAnalytics([
      createApplication({ id: '1', status: 'applied' }),
      createApplication({ id: '2', status: 'interviewing', interviewCount: 1 }),
      createApplication({ id: '3', status: 'rejected' }),
      createApplication({ id: '4', status: 'offer', interviewCount: 2 }),
    ]);

    expect(analytics.totalApplications).toBe(4);
    expect(analytics.activeApplications).toBe(2);
    expect(analytics.interviewCount).toBe(2);
    expect(analytics.rejectionCount).toBe(1);
    expect(analytics.offerCount).toBe(1);
    expect(analytics.responseRate).toBe(75);
    expect(analytics.interviewRate).toBe(50);
    expect(analytics.rejectionRate).toBe(25);
    expect(analytics.statusCounts.offer).toBe(1);
  });

  it('builds monthly trend buckets', () => {
    const analytics = buildApplicationAnalytics([
      createApplication({ id: '1', createdAt: '2026-01-15T10:00:00.000Z' }),
      createApplication({ id: '2', createdAt: '2026-01-20T10:00:00.000Z' }),
      createApplication({ id: '3', createdAt: '2026-02-02T10:00:00.000Z' }),
    ]);

    const januaryLabel = new Date('2026-01-15T10:00:00.000Z').toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit',
    });
    const februaryLabel = new Date('2026-02-02T10:00:00.000Z').toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit',
    });

    expect(analytics.monthlyApplications).toEqual([
      { month: januaryLabel, count: 2 },
      { month: februaryLabel, count: 1 },
    ]);
  });
});
