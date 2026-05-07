import type { TabSession } from '@careeros/shared-types';
import { logError, logInfo } from '@/lib/telemetry/logger';
import { ensureSettings, getSettings } from '@/lib/storage/settings';
import { CONTENT_SCRIPT_FILE } from './constants';
import { ensureContentScriptInjected } from './injection';
import { deleteSiteContext } from './site-context-cache';
import { buildTabSession } from './state';
import { deleteTabSession, setActiveTabId, upsertTabSession } from './tabs';

function isSupportedUrl(url?: string): boolean {
  return Boolean(
    url &&
      (url.includes('workday') ||
        url.includes('myworkdayjobs.com') ||
        url.includes('linkedin.com') ||
        url.includes('greenhouse.io') ||
        url.includes('lever.co')),
  );
}

async function openSidePanelForTab(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id || !tab.windowId) {
    return;
  }

  await chrome.sidePanel.open({
    tabId: tab.id,
    windowId: tab.windowId,
  });
}

async function syncTab(tab: chrome.tabs.Tab): Promise<void> {
  if (!tab.id) {
    return;
  }

  if (!isSupportedUrl(tab.url)) {
    await deleteTabSession(tab.id);
    await deleteSiteContext(tab.id);
    return;
  }

  const settings = await getSettings();
  if (!settings.extensionEnabled) {
    return;
  }

  const injectingSession = buildTabSession(tab, 'injecting');
  await upsertTabSession(injectingSession);
  await setActiveTabId(tab.id);

  try {
    await ensureContentScriptInjected(tab.id);
    const readySession: TabSession = {
      ...injectingSession,
      status: 'ready',
      connectedAt: new Date().toISOString(),
    };
    await upsertTabSession(readySession);

    if (settings.autoOpenSidePanel) {
      await openSidePanelForTab(tab);
    }
  } catch (error) {
    const failedSession: TabSession = {
      ...injectingSession,
      status: 'error',
      lastError: error instanceof Error ? error.message : 'Unknown injection error',
    };
    await upsertTabSession(failedSession);
    logError('Failed to inject content script', {
      tabId: tab.id,
      file: CONTENT_SCRIPT_FILE,
      error: failedSession.lastError,
    });
  }
}

async function bootstrapActiveTab(): Promise<void> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.id) {
    await syncTab(activeTab);
  }
}

export function registerLifecycleHandlers(): void {
  chrome.runtime.onInstalled.addListener(async () => {
    await ensureSettings();
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
    await bootstrapActiveTab();
    logInfo('Extension installed');
  });

  chrome.runtime.onStartup.addListener(async () => {
    await ensureSettings();
    await bootstrapActiveTab();
    logInfo('Extension startup');
  });

  chrome.runtime.onSuspend.addListener(() => {
    logInfo('Service worker suspended');
  });

  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    await setActiveTabId(tabId);
    const tab = await chrome.tabs.get(tabId);
    await syncTab(tab);
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      await syncTab({ ...tab, id: tabId });
    }
  });

  chrome.tabs.onRemoved.addListener(async (tabId) => {
    await deleteTabSession(tabId);
    await deleteSiteContext(tabId);
  });
}

export async function openCurrentSidePanel(
  tabId?: number,
  windowId?: number,
): Promise<void> {
  if (tabId && windowId) {
    await chrome.sidePanel.open({ tabId, windowId });
    return;
  }

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id || !activeTab.windowId) {
    throw new Error('No active tab available to open side panel');
  }

  await chrome.sidePanel.open({ tabId: activeTab.id, windowId: activeTab.windowId });
}

export async function refreshActiveTab(): Promise<void> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.id) {
    throw new Error('No active tab found');
  }

  await syncTab(activeTab);
}
