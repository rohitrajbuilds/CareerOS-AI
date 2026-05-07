import { useEffect, useState } from 'react';
import { addStorageChangeListener, getFromStorage } from '@/lib/storage/chrome-storage';
import type { StorageAreaName, StorageSchema } from '@/lib/storage/types';

export function useStorageValue<TKey extends keyof StorageSchema>(
  key: TKey,
  area: StorageAreaName = 'local',
): StorageSchema[TKey] | null {
  const [value, setValue] = useState<StorageSchema[TKey] | null>(null);

  useEffect(() => {
    let mounted = true;

    getFromStorage(key, area)
      .then((nextValue) => {
        if (mounted) {
          setValue(nextValue);
        }
      })
      .catch(() => {
        if (mounted) {
          setValue(null);
        }
      });

    const unsubscribe = addStorageChangeListener((changes, areaName) => {
      if (areaName !== area) {
        return;
      }

      const nextChange = changes[key];
      if (nextChange) {
        setValue((nextChange.newValue as StorageSchema[TKey] | undefined) ?? null);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [area, key]);

  return value;
}
