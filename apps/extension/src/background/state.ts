import type { ExtensionSnapshot, ExtensionSettings, TabSession } from '@careeros/shared-types';
import { getFromStorage } from '@/lib/storage/chrome-storage';
import { ensureSettings } from '@/lib/storage/settings';
import { getActiveTabId, getTabSession } from './tabs';

export async function getExtensionSettings(): Promise<ExtensionSettings> {
  return ensureSettings();
}

export async function getExtensionSnapshot(): Promise<ExtensionSnapshot> {
  const activeTabId = await getActiveTabId();
  const activeSession = activeTabId === null ? null : await getTabSession(activeTabId);
  const settings = await getExtensionSettings();
  const lastSyncAt = await getFromStorage('lastSyncAt', 'session');

  return {
    activeTabId,
    activeSession,
    settings,
    lastSyncAt,
  };
}

export function buildTabSession(
  tab: chrome.tabs.Tab,
  status: TabSession['status'],
  lastError?: string,
): TabSession {
  return {
    tabId: tab.id ?? -1,
    windowId: tab.windowId,
    url: tab.url ?? '',
    title: tab.title ?? 'Untitled Tab',
    provider: 'unknown',
    status,
    connectedAt: new Date().toISOString(),
    lastError,
  };
}
