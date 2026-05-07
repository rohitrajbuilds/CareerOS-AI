import type { SiteContext } from '@careeros/shared-types';
import { getFromStorage, setInStorage } from '@/lib/storage/chrome-storage';

function tabKey(tabId: number): string {
  return String(tabId);
}

export async function setSiteContext(tabId: number, siteContext: SiteContext): Promise<void> {
  const siteContexts = await getFromStorage('siteContexts', 'session');
  siteContexts[tabKey(tabId)] = siteContext;
  await setInStorage('siteContexts', siteContexts, 'session');
  await setInStorage('lastSyncAt', new Date().toISOString(), 'session');
}

export async function getSiteContext(tabId: number): Promise<SiteContext | null> {
  const siteContexts = await getFromStorage('siteContexts', 'session');
  return siteContexts[tabKey(tabId)] ?? null;
}

export async function deleteSiteContext(tabId: number): Promise<void> {
  const siteContexts = await getFromStorage('siteContexts', 'session');
  delete siteContexts[tabKey(tabId)];
  await setInStorage('siteContexts', siteContexts, 'session');
  await setInStorage('lastSyncAt', new Date().toISOString(), 'session');
}
