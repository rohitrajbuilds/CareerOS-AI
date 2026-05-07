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
      const [jobContext, profileRecord] = await Promise.all([
        getCurrentJobContext(),
        loadUserProfileRecord(),
      ]);

      if (!jobContext.jobDescription?.trim() && !jobContext.companyName?.trim()) {
        throw new Error('No company or job context was detected on the current page.');
      }

      if (!hasProfileContent(profileRecord)) {
        throw new Error('Add your profile and resume details before running company research.');
      }

      const resumeContext = await buildResumeContext(profileRecord);
      const research = await extensionApi.researchCompany({
        profile: profileRecord.profile,
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
