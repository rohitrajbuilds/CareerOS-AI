import type { ExtensionSettings } from '@careeros/shared-types';
import { getFromStorage, setInStorage } from './chrome-storage';
import { defaultExtensionSettings } from './types';

export async function getSettings(): Promise<ExtensionSettings> {
  return getFromStorage('settings', 'local');
}

export async function updateSettings(
  patch: Partial<ExtensionSettings>,
): Promise<ExtensionSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await setInStorage('settings', next, 'local');
  return next;
}

export async function ensureSettings(): Promise<ExtensionSettings> {
  const current = await getFromStorage('settings', 'local');
  const next = { ...defaultExtensionSettings, ...current };
  await setInStorage('settings', next, 'local');
  return next;
}
