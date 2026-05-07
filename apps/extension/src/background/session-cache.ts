import type { SiteContext } from '@careeros/shared-types';

const ACTIVE_SITE_CONTEXT_KEY = 'activeSiteContext';

export async function setActiveSiteContext(siteContext: SiteContext): Promise<void> {
  await chrome.storage.session.set({ [ACTIVE_SITE_CONTEXT_KEY]: siteContext });
}

export async function getActiveSiteContext(): Promise<SiteContext | null> {
  const result = await chrome.storage.session.get(ACTIVE_SITE_CONTEXT_KEY);
  return (result[ACTIVE_SITE_CONTEXT_KEY] as SiteContext | undefined) ?? null;
}
