import { z } from 'zod';

export const sponsorshipStatusOptions = [
  'citizen',
  'permanent_resident',
  'visa_sponsorship_required',
  'student_visa',
  'other',
] as const;

export const educationEntrySchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree is required'),
  fieldOfStudy: z.string().min(2, 'Field of study is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().max(500, 'Education description is too long').optional(),
});

export const workExperienceEntrySchema = z.object({
  id: z.string().min(1),
  company: z.string().min(2, 'Company is required'),
  title: z.string().min(2, 'Role title is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().max(120, 'Location is too long').optional(),
  summary: z.string().max(1000, 'Summary is too long').optional(),
});

export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  linkedInUrl: z
    .string()
    .url('Enter a valid LinkedIn URL')
    .or(z.literal('')),
  githubUrl: z
    .string()
    .url('Enter a valid GitHub URL')
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url('Enter a valid portfolio URL')
    .or(z.literal('')),
  sponsorshipStatus: z.enum(sponsorshipStatusOptions),
  education: z.array(educationEntrySchema).min(1, 'Add at least one education entry'),
  workExperience: z.array(workExperienceEntrySchema).min(1, 'Add at least one work experience entry'),
});

export const resumeAssetSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().nonnegative(),
  uploadedAt: z.string().min(1),
  updatedAt: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  isPrimary: z.boolean(),
  textPreview: z.string().nullable().optional(),
  encryptedBlob: z.string().min(1),
});

export const userProfileRecordSchema = z.object({
  profile: userProfileSchema,
  resumes: z.array(resumeAssetSchema).default([]),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;
