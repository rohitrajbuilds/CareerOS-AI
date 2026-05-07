import type {
  SponsorshipStatus,
  UserProfile,
  UserProfileRecord,
} from '@careeros/shared-types';
import { loadUserProfileRecord } from '@/features/profile/storage';
import { fuzzyContains } from '../text-utils';
import type { DetectedFormField } from '../types';

type ResolvedValue = {
  value: string | boolean | null;
  confidence: number;
  reason: string;
  actionType: 'type' | 'select' | 'checkbox' | 'radio' | 'file' | 'skip';
};

function normalizeSponsorshipStatus(status: SponsorshipStatus): string {
  switch (status) {
    case 'citizen':
      return 'Citizen';
    case 'permanent_resident':
      return 'Permanent Resident';
    case 'visa_sponsorship_required':
      return 'Requires Sponsorship';
    case 'student_visa':
      return 'Student Visa';
    case 'other':
      return 'Other';
  }
}

function resolveFromProfile(profile: UserProfile, field: DetectedFormField): ResolvedValue {
  const labelSignals = [
    field.label,
    field.placeholder ?? '',
    field.ariaLabel ?? '',
    field.name ?? '',
    ...field.nearbyText,
  ].join(' ');

  if (fuzzyContains(labelSignals, ['full name', 'name'])) {
    return { value: profile.fullName, confidence: 0.95, reason: 'Matched profile full name', actionType: 'type' };
  }

  if (fuzzyContains(labelSignals, ['email'])) {
    return { value: profile.email, confidence: 0.99, reason: 'Matched profile email', actionType: 'type' };
  }

  if (fuzzyContains(labelSignals, ['phone', 'mobile', 'telephone'])) {
    return { value: profile.phone, confidence: 0.98, reason: 'Matched profile phone', actionType: 'type' };
  }

  if (fuzzyContains(labelSignals, ['linkedin'])) {
    return { value: profile.linkedInUrl, confidence: 0.98, reason: 'Matched LinkedIn URL', actionType: field.type === 'select' ? 'select' : 'type' };
  }

  if (fuzzyContains(labelSignals, ['github'])) {
    return { value: profile.githubUrl, confidence: 0.98, reason: 'Matched GitHub URL', actionType: field.type === 'select' ? 'select' : 'type' };
  }

  if (fuzzyContains(labelSignals, ['portfolio', 'website', 'personal site'])) {
    return { value: profile.portfolioUrl, confidence: 0.96, reason: 'Matched portfolio URL', actionType: field.type === 'select' ? 'select' : 'type' };
  }

  if (fuzzyContains(labelSignals, ['sponsor', 'work authorization', 'authorized', 'visa'])) {
    const sponsorshipValue = normalizeSponsorshipStatus(profile.sponsorshipStatus);
    return {
      value: sponsorshipValue,
      confidence: 0.87,
      reason: 'Matched sponsorship status',
      actionType: field.type === 'radio' ? 'radio' : field.type === 'checkbox' ? 'checkbox' : 'select',
    };
  }

  if (field.type === 'file' || fuzzyContains(labelSignals, ['resume', 'cv', 'upload'])) {
    return {
      value: null,
      confidence: 0.4,
      reason: 'File inputs require manual user selection',
      actionType: 'file',
    };
  }

  return {
    value: null,
    confidence: 0.2,
    reason: 'No profile mapping available',
    actionType: 'skip',
  };
}

export async function loadAutofillProfile(): Promise<UserProfileRecord> {
  return loadUserProfileRecord();
}

export function resolveAutofillValue(
  profileRecord: UserProfileRecord,
  field: DetectedFormField,
): ResolvedValue {
  return resolveFromProfile(profileRecord.profile, field);
}
