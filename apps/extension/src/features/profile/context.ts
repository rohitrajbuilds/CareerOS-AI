import type { ResumeAsset, ResumeContext, UserProfile, UserProfileRecord } from '@careeros/shared-types';
import { decryptJson } from '@/lib/security/encryption';

function buildProfileSummary(profile: UserProfile): string {
  const education = profile.education
    .map((entry) => `${entry.degree} in ${entry.fieldOfStudy} at ${entry.institution}`)
    .join('; ');
  const workExperience = profile.workExperience
    .map((entry) => `${entry.title} at ${entry.company}${entry.summary ? `: ${entry.summary}` : ''}`)
    .join('; ');

  return [
    `Name: ${profile.fullName}`,
    `Email: ${profile.email}`,
    `Phone: ${profile.phone}`,
    profile.linkedInUrl ? `LinkedIn: ${profile.linkedInUrl}` : '',
    profile.githubUrl ? `GitHub: ${profile.githubUrl}` : '',
    profile.portfolioUrl ? `Portfolio: ${profile.portfolioUrl}` : '',
    `Sponsorship: ${profile.sponsorshipStatus}`,
    education ? `Education: ${education}` : '',
    workExperience ? `Experience: ${workExperience}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function getPrimaryResume(record: UserProfileRecord): ResumeAsset | null {
  return record.resumes.find((resume) => resume.isPrimary) ?? record.resumes[0] ?? null;
}

async function resolveResumeText(resume: ResumeAsset | null): Promise<string | undefined> {
  if (!resume) {
    return undefined;
  }

  if (resume.textPreview) {
    return resume.textPreview;
  }

  try {
    const decrypted = await decryptJson<{
      contentBase64?: string;
      mimeType?: string;
    }>(resume.encryptedBlob);

    if (decrypted.mimeType?.startsWith('text/') && decrypted.contentBase64) {
      return atob(decrypted.contentBase64).slice(0, 12000);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export async function buildResumeContext(record: UserProfileRecord): Promise<ResumeContext> {
  const primaryResume = getPrimaryResume(record);
  const resumeText = await resolveResumeText(primaryResume);

  return {
    primaryResumeFileName: primaryResume?.fileName,
    primaryResumeTags: primaryResume?.tags,
    profileSummary: buildProfileSummary(record.profile),
    resumeText,
  };
}
