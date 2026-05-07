import { extensionApi } from '@/lib/api-client/extension-api';
import { addRuntimeMessageListener, createErrorResult, createSuccessResult } from '@/lib/message-bus/runtime';
import type { RuntimeMessage } from '@/lib/schema/messages';
import { MessageType } from '@/lib/schema/message-types';
import { logInfo } from '@/lib/telemetry/logger';
import { openCurrentSidePanel, refreshActiveTab } from './lifecycle';
import {
  getSettingsResponse,
  getSnapshotResponse,
  getTabSessionResponse,
  handleContentReady,
  recordAnalyzedFieldsForTab,
  requestJobAnalysisContextForTab,
  resolveTargetTabId,
  triggerAutofillForTab,
  updateSettingsResponse,
} from './runtime-bridge';
import { setSiteContext } from './site-context-cache';
import { getTabSession, upsertTabSession } from './tabs';

async function handleMessage(
  message: RuntimeMessage,
  sender: chrome.runtime.MessageSender,
): Promise<unknown> {
  switch (message.type) {
    case MessageType.Ping:
      return createSuccessResult({ pong: true, surface: 'background' as const });
    case MessageType.GetExtensionSnapshot:
      return getSnapshotResponse();
    case MessageType.GetSettings:
      return getSettingsResponse();
    case MessageType.UpdateSettings:
      return updateSettingsResponse(message.payload);
    case MessageType.OpenSidePanel:
      await openCurrentSidePanel(message.payload?.tabId, message.payload?.windowId);
      return createSuccessResult({ opened: true });
    case MessageType.RefreshActiveTab:
      await refreshActiveTab();
      return createSuccessResult({ refreshed: true });
    case MessageType.GetTabSession:
      return getTabSessionResponse(await resolveTargetTabId(sender, message.payload?.tabId));
    case MessageType.SiteContextDetected:
      if (!sender.tab?.id) {
        return createErrorResult('missing_tab', 'Site context missing sender tab');
      }

      await setSiteContext(sender.tab.id, message.payload);
      const existingSession = await getTabSession(sender.tab.id);
      if (existingSession) {
        await upsertTabSession({
          ...existingSession,
          provider: message.payload.provider,
          url: message.payload.url,
          title: message.payload.title,
        });
      }
      logInfo('Site context detected', message.payload);
      return createSuccessResult({ acknowledged: true });
    case MessageType.ContentReady:
      return handleContentReady(sender, message.payload.href);
    case MessageType.RequestPageState:
      return createErrorResult('unsupported_direction', 'Background cannot answer page state requests');
    case MessageType.RequestJobAnalysisContext:
      return requestJobAnalysisContextForTab(await resolveTargetTabId(sender));
    case MessageType.PageStateResponse:
      return createSuccessResult({ accepted: true });
    case MessageType.BackendHealthCheck:
      return createSuccessResult(await extensionApi.health());
    case MessageType.AnalyzeForm:
      return recordAnalyzedFieldsForTab(await resolveTargetTabId(sender), message.payload);
    case MessageType.AutofillForm:
      return triggerAutofillForTab(await resolveTargetTabId(sender), message.payload);
    case MessageType.AutofillResult:
      return createSuccessResult(message.payload);
    default:
      return createErrorResult('unhandled_message', 'Unhandled message type');
  }
}

export function registerMessageRouter(): void {
  addRuntimeMessageListener(handleMessage);
}
