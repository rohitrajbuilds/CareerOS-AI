import { storageDefaults, type StorageAreaName, type StorageSchema } from './types';

function getStorageArea(area: StorageAreaName): chrome.storage.StorageArea {
  return area === 'session' ? chrome.storage.session : chrome.storage.local;
}

function cloneStorageValue<TValue>(value: TValue): TValue {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as TValue;
}

export async function getFromStorage<TKey extends keyof StorageSchema>(
  key: TKey,
  area: StorageAreaName = 'local',
): Promise<StorageSchema[TKey]> {
  const storageArea = getStorageArea(area);
  const result = await storageArea.get(key);

  if (result[key] === undefined) {
    return cloneStorageValue(storageDefaults[key]);
  }

  return result[key] as StorageSchema[TKey];
}

export async function setInStorage<TKey extends keyof StorageSchema>(
  key: TKey,
  value: StorageSchema[TKey],
  area: StorageAreaName = 'local',
): Promise<void> {
  const storageArea = getStorageArea(area);
  await storageArea.set({ [key]: value });
}

export async function patchInStorage<TKey extends keyof StorageSchema>(
  key: TKey,
  patch: Partial<StorageSchema[TKey]>,
  area: StorageAreaName = 'local',
): Promise<StorageSchema[TKey]> {
  const current = await getFromStorage(key, area);
  const nextValue =
    current && typeof current === 'object' && !Array.isArray(current)
      ? ({ ...current, ...patch } as StorageSchema[TKey])
      : (patch as StorageSchema[TKey]);

  await setInStorage(key, nextValue, area);
  return nextValue;
}

export function addStorageChangeListener(
  listener: (
    changes: Partial<Record<keyof StorageSchema, chrome.storage.StorageChange>>,
    areaName: StorageAreaName,
  ) => void,
): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName !== 'local' && areaName !== 'session') {
      return;
    }

    listener(changes as Partial<Record<keyof StorageSchema, chrome.storage.StorageChange>>, areaName);
  };

  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
