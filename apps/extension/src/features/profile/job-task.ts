import type { JobPageContext, ResumeContext, UserProfile, UserProfileRecord } from '@careeros/shared-types';
import { buildResumeContext } from './context';
import { loadUserProfileRecord } from './storage';

export type ProfileAwareJobContext = {
  jobContext: JobPageContext;
  profile: UserProfile;
  profileRecord: UserProfileRecord;
  resumeContext: ResumeContext;
};

export function hasProfileContent(record: UserProfileRecord): boolean {
  const { profile, resumes } = record;
  return Boolean(
    profile.fullName ||
      profile.email ||
      profile.workExperience.length ||
      profile.education.length ||
      resumes.length,
  );
}

/**
 * Builds the shared context needed by job-aware AI tools in the extension.
 * Centralizing these preflight checks keeps profile and resume requirements consistent.
 */
export async function loadProfileAwareJobContext(
  getCurrentJobContext: () => Promise<JobPageContext>,
): Promise<ProfileAwareJobContext> {
  const [jobContext, profileRecord] = await Promise.all([
    getCurrentJobContext(),
    loadUserProfileRecord(),
  ]);

  if (!hasProfileContent(profileRecord)) {
    throw new Error('Add your profile and resume details before running this action.');
  }

  const resumeContext = await buildResumeContext(profileRecord);
  return {
    jobContext,
    profile: profileRecord.profile,
    profileRecord,
    resumeContext,
  };
}
