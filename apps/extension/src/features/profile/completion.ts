import type { ProfileCompletion, UserProfile } from '@careeros/shared-types';

export function getProfileCompletion(profile: UserProfile): ProfileCompletion {
  const fields = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.linkedInUrl,
    profile.githubUrl,
    profile.portfolioUrl,
    profile.sponsorshipStatus,
    profile.education.length > 0 ? 'education' : '',
    profile.workExperience.length > 0 ? 'workExperience' : '',
  ];

  const completedFields = fields.filter((value) => Boolean(value && String(value).trim())).length;
  const totalFields = fields.length;

  return {
    completedFields,
    totalFields,
    percentage: Math.round((completedFields / totalFields) * 100),
  };
}
