import type {
  EducationEntry,
  UserProfile,
  UserProfileRecord,
  WorkExperienceEntry,
} from '@careeros/shared-types';

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createEmptyEducationEntry(): EducationEntry {
  return {
    id: createId('edu'),
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    description: '',
  };
}

export function createEmptyWorkExperienceEntry(): WorkExperienceEntry {
  return {
    id: createId('work'),
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    summary: '',
  };
}

export function createEmptyProfile(): UserProfile {
  return {
    fullName: '',
    email: '',
    phone: '',
    linkedInUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    sponsorshipStatus: 'citizen',
    education: [createEmptyEducationEntry()],
    workExperience: [createEmptyWorkExperienceEntry()],
  };
}

export function createEmptyProfileRecord(): UserProfileRecord {
  const now = new Date().toISOString();

  return {
    profile: createEmptyProfile(),
    resumes: [],
    createdAt: now,
    updatedAt: now,
  };
}
