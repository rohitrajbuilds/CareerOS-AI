import type {
  AnalyzeFormResponse,
  AutofillResponse,
  ExtensionSnapshotResponse,
  PageStateRuntimeResponse,
  SettingsResponse,
  TabSessionResponse,
  UpdateSettingsResponse,
} from '@/lib/schema/messages';
import { createErrorResult, createSuccessResult, sendTabMessage } from '@/lib/message-bus/runtime';
import { MessageType } from '@/lib/schema/message-types';
import { getSettings, updateSettings } from '@/lib/storage/settings';
import { ensureContentScriptInjected } from './injection';
import { getSiteContext, setSiteContext } from './site-context-cache';
import { getExtensionSnapshot } from './state';
import { getTabSession, setActiveTabId, upsertTabSession } from './tabs';

export async function resolveTargetTabId(
  sender: chrome.runtime.MessageSender,
  requestedTabId?: number,
): Promise<number> {
  if (requestedTabId !== undefined) {
    return requestedTabId;
  }

  if (sender.tab?.id !== undefined) {
    return sender.tab.id;
  }

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.id === undefined) {
    throw new Error('No active tab available');
  }

  return activeTab.id;
}

export async function getSnapshotResponse(): Promise<ExtensionSnapshotResponse> {
  return createSuccessResult(await getExtensionSnapshot());
}

export async function getSettingsResponse(): Promise<SettingsResponse> {
  return createSuccessResult(await getSettings());
}

export async function updateSettingsResponse(
  patch: Parameters<typeof updateSettings>[0],
): Promise<UpdateSettingsResponse> {
  return createSuccessResult(await updateSettings(patch));
}

export async function getTabSessionResponse(tabId?: number): Promise<TabSessionResponse> {
  if (tabId === undefined) {
    return createSuccessResult(null);
  }

  return createSuccessResult(await getTabSession(tabId));
}

export async function handleContentReady(
  sender: chrome.runtime.MessageSender,
  href: string,
): Promise<SettingsResponse> {
  if (!sender.tab?.id) {
    return createErrorResult('missing_tab', 'Content script sender is missing tab metadata');
  }

  await setActiveTabId(sender.tab.id);
  await upsertTabSession({
    tabId: sender.tab.id,
    windowId: sender.tab.windowId,
    url: href,
    title: sender.tab.title ?? 'Untitled Tab',
    provider: 'unknown',
    status: 'ready',
    connectedAt: new Date().toISOString(),
  });

  return createSuccessResult(await getSettings());
}

export async function requestPageStateForTab(
  tabId: number,
): Promise<AnalyzeFormResponse> {
  await ensureContentScriptInjected(tabId);
  const response = await sendTabMessage<PageStateRuntimeResponse>(tabId, {
    type: MessageType.RequestPageState,
  });

  if (!response.ok) {
    return createErrorResult('page_state_failed', 'Unable to retrieve page state from tab');
  }

  const currentSiteContext = await getSiteContext(tabId);
  await setSiteContext(tabId, {
    ...(currentSiteContext ?? {
      provider: 'unknown',
      url: '',
      title: 'Unknown',
    }),
    ...response.data.siteContext,
  });

  const session = await getTabSession(tabId);
  if (session) {
    await upsertTabSession({
      ...session,
      fieldCount: response.data.fields.length,
      provider: response.data.siteContext.provider ?? session.provider,
      url: response.data.siteContext.url,
      title: response.data.siteContext.title,
      status: 'ready',
    });
  }

  return createSuccessResult({ fieldCount: response.data.fields.length });
}

export async function triggerAutofillForTab(tabId: number): Promise<AutofillResponse> {
  await ensureContentScriptInjected(tabId);
  const response = await sendTabMessage<AutofillResponse>(tabId, {
    type: MessageType.AutofillForm,
    payload: {
      provider: 'unknown',
    },
  });

  return response;
}
