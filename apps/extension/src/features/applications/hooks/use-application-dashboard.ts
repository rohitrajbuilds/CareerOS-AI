import type { ApplicationPriority, ApplicationRecord, ApplicationStatus } from '@careeros/shared-types';
import { useCallback, useEffect } from 'react';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { selectApplicationDashboard } from '@/sidepanel/store/selectors';
import { useExtensionStore } from '@/sidepanel/store/use-extension-store';
import { buildApplicationAnalytics } from '../analytics';
import { downloadApplicationsCsv } from '../csv';
import {
  updateApplicationRecord,
  updateApplicationStatus,
  upsertApplicationFromJobContext,
} from '../domain';
import {
  loadApplicationDashboardRecord,
  saveApplicationDashboardRecord,
} from '../storage';

export function useApplicationDashboard() {
  const { getCurrentJobContext } = useExtensionActions();
  const dashboard = useExtensionStore(selectApplicationDashboard);
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
        await persistApplications(upsertApplicationFromJobContext(current, jobContext, options));
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
      const nextApplications = updateApplicationRecord(current, applicationId, (application) =>
        updateApplicationStatus(application, status),
      );
      await persistApplications(nextApplications);
    },
    [dashboard, persistApplications, setError],
  );

  const updateApplicationNotes = useCallback(
    async (applicationId: string, notes: string): Promise<void> => {
      const current = dashboard ?? (await loadApplicationDashboardRecord());
      const nextApplications = updateApplicationRecord(current, applicationId, (application) => ({
        ...application,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      }));
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
