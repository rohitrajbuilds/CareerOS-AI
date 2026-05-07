import { useCallback } from 'react';
import { loadProfileAwareJobContext } from '@/features/profile/job-task';
import { extensionApi } from '@/lib/api-client/extension-api';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useExtensionStore } from '@/sidepanel/store/use-extension-store';

export function useJobAnalysis() {
  const { getCurrentJobContext } = useExtensionActions();
  const setJobAnalysis = useExtensionStore((state) => state.setJobAnalysis);
  const setJobAnalysisLoading = useExtensionStore((state) => state.setJobAnalysisLoading);
  const setJobAnalysisError = useExtensionStore((state) => state.setJobAnalysisError);

  const analyzeCurrentJob = useCallback(async (): Promise<void> => {
    setJobAnalysisLoading(true);
    setJobAnalysisError(null);
    setJobAnalysis(null);

    try {
      const { jobContext, profile, resumeContext } = await loadProfileAwareJobContext(
        getCurrentJobContext,
      );

      if (!jobContext.jobDescription?.trim()) {
        throw new Error('No job description was detected on the current page.');
      }
      const analysis = await extensionApi.analyzeJob({
        profile,
        resumeContext,
        jobContext,
      });

      setJobAnalysis(analysis);
    } catch (error) {
      setJobAnalysisError(error instanceof Error ? error.message : 'Failed to analyze the current job');
    } finally {
      setJobAnalysisLoading(false);
    }
  }, [getCurrentJobContext, setJobAnalysis, setJobAnalysisError, setJobAnalysisLoading]);

  return {
    analyzeCurrentJob,
  };
}
