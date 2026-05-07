import type { ApplicationPriority, ApplicationRecord, ApplicationStatus } from '@careeros/shared-types';
import { useCallback, useEffect } from 'react';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useExtensionStore } from '@/sidepanel/store/use-extension-store';
import { buildApplicationAnalytics } from '../analytics';
import { downloadApplicationsCsv } from '../csv';
import {
  createApplicationFromJobContext,
  loadApplicationDashboardRecord,
  saveApplicationDashboardRecord,
  updateApplicationStatus,
} from '../storage';

export function useApplicationDashboard() {
  const { getCurrentJobContext } = useExtensionActions();
  const dashboard = useExtensionStore((state) => state.applicationDashboard);
  const setDashboard = useExtensionStore((state) => state.setApplicationDashboard);
  const setAnalytics = useExtensionStore((state) => state.setApplicationAnalytics);
  const setLoading = useExtensionStore((state) => state.setApplicationDashboardLoading);
  const setError = useExtensionStore((state) => state.setApplicationDashboardError);

  const hydrateDashboard = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const record = await loadApplicationDashboardRecord();
      setDashboard(record);
      setAnalytics(buildApplicationAnalytics(record.applications));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load application dashboard');
    } finally {
      setLoading(false);
    }
  }, [setAnalytics, setDashboard, setError, setLoading]);

  useEffect(() => {
    void hydrateDashboard();
  }, [hydrateDashboard]);

  const persistApplications = useCallback(
    async (applications: ApplicationRecord[]) => {
      const existing = dashboard ?? (await loadApplicationDashboardRecord());
      const nextRecord = {
        ...existing,
        applications,
        updatedAt: new Date().toISOString(),
      };
      const saved = await saveApplicationDashboardRecord(nextRecord);
      setDashboard(saved);
      setAnalytics(buildApplicationAnalytics(saved.applications));
      return saved;
    },
    [dashboard, setAnalytics, setDashboard],
  );

  const saveCurrentApplication = useCallback(
    async (options?: {
      status?: ApplicationStatus;
      priority?: ApplicationPriority;
      notes?: string;
    }): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const jobContext = await getCurrentJobContext();
        if (!jobContext.url || (!jobContext.companyName && !jobContext.roleTitle)) {
          throw new Error('No application context was detected on the current page.');
        }

        const current = dashboard ?? (await loadApplicationDashboardRecord());
        const duplicateIndex = current.applications.findIndex(
          (application) =>
            application.sourceUrl === jobContext.url ||
            (application.companyName === (jobContext.companyName ?? '') &&
              application.roleTitle === (jobContext.roleTitle ?? '')),
        );

        let nextApplications = [...current.applications];
        if (duplicateIndex >= 0) {
          const existing = nextApplications[duplicateIndex];
          nextApplications[duplicateIndex] = {
            ...existing,
            sourcePlatform: jobContext.provider,
            sourceUrl: jobContext.url,
            updatedAt: new Date().toISOString(),
            notes: options?.notes?.trim() || existing.notes,
          };
        } else {
          nextApplications = [
            createApplicationFromJobContext(jobContext, {
              status: options?.status ?? 'applied',
              priority: options?.priority ?? 'medium',
              notes: options?.notes,
            }),
            ...nextApplications,
          ];
        }

        await persistApplications(nextApplications);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to save current application');
      } finally {
        setLoading(false);
      }
    },
    [dashboard, getCurrentJobContext, persistApplications, setError, setLoading],
  );

  const changeApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus): Promise<void> => {
      setError(null);
      const current = dashboard ?? (await loadApplicationDashboardRecord());
      const nextApplications = current.applications.map((application) =>
        application.id === applicationId ? updateApplicationStatus(application, status) : application,
      );
      await persistApplications(nextApplications);
    },
    [dashboard, persistApplications, setError],
  );

  const updateApplicationNotes = useCallback(
    async (applicationId: string, notes: string): Promise<void> => {
      const current = dashboard ?? (await loadApplicationDashboardRecord());
      const nextApplications = current.applications.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              notes: notes.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : application,
      );
      await persistApplications(nextApplications);
    },
    [dashboard, persistApplications],
  );

  const exportCsv = useCallback(async (): Promise<void> => {
    const current = dashboard ?? (await loadApplicationDashboardRecord());
    downloadApplicationsCsv(current.applications);
  }, [dashboard]);

  return {
    hydrateDashboard,
    saveCurrentApplication,
    changeApplicationStatus,
    updateApplicationNotes,
    exportCsv,
  };
}
