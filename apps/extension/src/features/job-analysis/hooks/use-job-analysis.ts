import { useCallback } from 'react';
import { buildResumeContext } from '@/features/profile/context';
import { loadUserProfileRecord } from '@/features/profile/storage';
import { extensionApi } from '@/lib/api-client/extension-api';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useExtensionStore } from '@/sidepanel/store/use-extension-store';

function hasProfileContent(record: Awaited<ReturnType<typeof loadUserProfileRecord>>): boolean {
  const { profile, resumes } = record;
  return Boolean(
    profile.fullName ||
      profile.email ||
      profile.workExperience.length ||
      profile.education.length ||
      resumes.length,
  );
}

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
      const [jobContext, profileRecord] = await Promise.all([
        getCurrentJobContext(),
        loadUserProfileRecord(),
      ]);

      if (!jobContext.jobDescription?.trim()) {
        throw new Error('No job description was detected on the current page.');
      }

      if (!hasProfileContent(profileRecord)) {
        throw new Error('Add your profile and resume details before running analysis.');
      }

      const resumeContext = await buildResumeContext(profileRecord);
      const analysis = await extensionApi.analyzeJob({
        profile: profileRecord.profile,
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
