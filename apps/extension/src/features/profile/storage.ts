import type { UserProfileRecord } from '@careeros/shared-types';
import { decryptJson, encryptJson } from '@/lib/security/encryption';
import { createEmptyProfileRecord } from './defaults';
import { userProfileRecordSchema } from './schema';

const USER_PROFILE_STORAGE_KEY = 'encryptedUserProfileRecord';

export async function loadUserProfileRecord(): Promise<UserProfileRecord> {
  const result = await chrome.storage.local.get(USER_PROFILE_STORAGE_KEY);
  const serialized = result[USER_PROFILE_STORAGE_KEY];

  if (typeof serialized !== 'string') {
    return createEmptyProfileRecord();
  }

  try {
    const parsed = await decryptJson<UserProfileRecord>(serialized);
    return userProfileRecordSchema.parse(parsed);
  } catch {
    return createEmptyProfileRecord();
  }
}

export async function saveUserProfileRecord(record: UserProfileRecord): Promise<UserProfileRecord> {
  const validated = userProfileRecordSchema.parse(record);
  const encrypted = await encryptJson(validated);
  await chrome.storage.local.set({
    [USER_PROFILE_STORAGE_KEY]: encrypted,
  });
  return validated;
}
