import type { ApplicationRecord } from '@careeros/shared-types';
import { describe, expect, it } from 'vitest';
import { buildApplicationsCsv } from './csv';

describe('buildApplicationsCsv', () => {
  it('serializes application rows with headers', () => {
    const applications: ApplicationRecord[] = [
      {
        id: 'app-1',
        companyName: 'CareerOS, Inc.',
        roleTitle: 'Staff Engineer',
        sourcePlatform: 'workday',
        sourceUrl: 'https://example.com/job',
        priority: 'high',
        status: 'interviewing',
        interviewCount: 2,
        createdAt: '2026-01-10T10:00:00.000Z',
        updatedAt: '2026-01-15T10:00:00.000Z',
        appliedAt: '2026-01-11T10:00:00.000Z',
        lastResponseAt: '2026-01-13T10:00:00.000Z',
        tags: ['workday', 'priority'],
        notes: 'Met recruiter, moving to onsite',
        history: [],
      },
    ];

    const csv = buildApplicationsCsv(applications);

    expect(csv).toContain('Company,Role,Status,Priority');
    expect(csv).toContain('"CareerOS, Inc.",Staff Engineer,interviewing,high');
    expect(csv).toContain('workday|priority');
  });
});
