import { useCallback } from 'react';
import { loadProfileAwareJobContext } from '@/features/profile/job-task';
import { extensionApi } from '@/lib/api-client/extension-api';
import { useExtensionActions } from '@/lib/hooks/use-extension-core';
import { useExtensionStore } from '@/sidepanel/store/use-extension-store';

export function useCompanyResearch() {
  const { getCurrentJobContext } = useExtensionActions();
  const setCompanyResearch = useExtensionStore((state) => state.setCompanyResearch);
  const setCompanyResearchLoading = useExtensionStore((state) => state.setCompanyResearchLoading);
  const setCompanyResearchError = useExtensionStore((state) => state.setCompanyResearchError);

  const researchCurrentCompany = useCallback(async (): Promise<void> => {
    setCompanyResearchLoading(true);
    setCompanyResearchError(null);
    setCompanyResearch(null);

    try {
      const { jobContext, profile, resumeContext } = await loadProfileAwareJobContext(
        getCurrentJobContext,
      );

      if (!jobContext.jobDescription?.trim() && !jobContext.companyName?.trim()) {
        throw new Error('No company or job context was detected on the current page.');
      }
      const research = await extensionApi.researchCompany({
        profile,
        resumeContext,
        jobContext,
      });

      setCompanyResearch(research);
    } catch (error) {
      setCompanyResearchError(
        error instanceof Error ? error.message : 'Failed to research the current company',
      );
    } finally {
      setCompanyResearchLoading(false);
    }
  }, [
    getCurrentJobContext,
    setCompanyResearch,
    setCompanyResearchError,
    setCompanyResearchLoading,
  ]);

  return {
    researchCurrentCompany,
  };
}
