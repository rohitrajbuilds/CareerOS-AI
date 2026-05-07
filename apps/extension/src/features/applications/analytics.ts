import type {
  ApplicationAnalytics,
  ApplicationRecord,
  ApplicationStatus,
} from '@careeros/shared-types';

const ALL_STATUSES: ApplicationStatus[] = [
  'saved',
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
];

function formatMonth(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}

export function buildApplicationAnalytics(applications: ApplicationRecord[]): ApplicationAnalytics {
  const statusCounts = ALL_STATUSES.reduce<Record<ApplicationStatus, number>>(
    (accumulator, status) => ({ ...accumulator, [status]: 0 }),
    {
      saved: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    },
  );

  const monthlyMap = new Map<string, number>();

  for (const application of applications) {
    statusCounts[application.status] += 1;
    monthlyMap.set(
      formatMonth(application.createdAt),
      (monthlyMap.get(formatMonth(application.createdAt)) ?? 0) + 1,
    );
  }

  const totalApplications = applications.length;
  const interviewCount = statusCounts.interviewing + statusCounts.offer;
  const rejectionCount = statusCounts.rejected;
  const offerCount = statusCounts.offer;
  const respondedCount = interviewCount + rejectionCount;

  return {
    totalApplications,
    activeApplications: statusCounts.saved + statusCounts.applied + statusCounts.interviewing,
    interviewCount,
    rejectionCount,
    offerCount,
    responseRate: totalApplications ? Math.round((respondedCount / totalApplications) * 100) : 0,
    interviewRate: totalApplications ? Math.round((interviewCount / totalApplications) * 100) : 0,
    rejectionRate: totalApplications ? Math.round((rejectionCount / totalApplications) * 100) : 0,
    statusCounts,
    monthlyApplications: [...monthlyMap.entries()].map(([month, count]) => ({ month, count })),
  };
}
