import { useMemo } from 'react';
import type { ExtensionSnapshot } from '@careeros/shared-types';
import { useStorageValue } from './use-storage-value';

export function useLiveExtensionSnapshot(): ExtensionSnapshot | null {
  const settings = useStorageValue('settings', 'local');
  const activeTabId = useStorageValue('activeTabId', 'session');
  const tabSessions = useStorageValue('tabSessions', 'session');
  const lastSyncAt = useStorageValue('lastSyncAt', 'session');

  return useMemo(() => {
    if (!settings || !tabSessions || !lastSyncAt) {
      return null;
    }

    return {
      activeTabId,
      activeSession: activeTabId === null ? null : tabSessions[String(activeTabId)] ?? null,
      settings,
      lastSyncAt,
    };
  }, [activeTabId, lastSyncAt, settings, tabSessions]);
}
