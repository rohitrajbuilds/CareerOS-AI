import type { TabSession } from '@careeros/shared-types';
import { getFromStorage, setInStorage } from '@/lib/storage/chrome-storage';

function tabKey(tabId: number): string {
  return String(tabId);
}

export async function upsertTabSession(session: TabSession): Promise<void> {
  const sessions = await getFromStorage('tabSessions', 'session');
  sessions[tabKey(session.tabId)] = session;
  await setInStorage('tabSessions', sessions, 'session');
  await setInStorage('lastSyncAt', new Date().toISOString(), 'session');
}

export async function getTabSession(tabId: number): Promise<TabSession | null> {
  const sessions = await getFromStorage('tabSessions', 'session');
  return sessions[tabKey(tabId)] ?? null;
}

export async function deleteTabSession(tabId: number): Promise<void> {
  const sessions = await getFromStorage('tabSessions', 'session');
  delete sessions[tabKey(tabId)];
  await setInStorage('tabSessions', sessions, 'session');
  await setInStorage('lastSyncAt', new Date().toISOString(), 'session');
}

export async function setActiveTabId(tabId: number | null): Promise<void> {
  await setInStorage('activeTabId', tabId, 'session');
  await setInStorage('lastSyncAt', new Date().toISOString(), 'session');
}

export async function getActiveTabId(): Promise<number | null> {
  return getFromStorage('activeTabId', 'session');
}
