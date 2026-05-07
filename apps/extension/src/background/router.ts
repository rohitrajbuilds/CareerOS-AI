import { extensionApi } from '@/lib/api-client/extension-api';
import { addRuntimeMessageListener } from '@/lib/message-bus/runtime';
import type { RuntimeMessage } from '@/lib/schema/messages';
import { MessageType } from '@/lib/schema/message-types';
import { logInfo } from '@/lib/telemetry/logger';
import { setActiveSiteContext } from './session-cache';

async function handleMessage(message: RuntimeMessage): Promise<unknown> {
  switch (message.type) {
    case MessageType.Ping:
      return { ok: true };
    case MessageType.SiteContextDetected:
      await setActiveSiteContext(message.payload);
      logInfo('Site context detected', message.payload);
      return { ok: true };
    case MessageType.BackendHealthCheck:
      return extensionApi.health();
    case MessageType.AnalyzeForm:
      return { ok: true, fieldCount: message.payload.fields.length };
    case MessageType.AutofillForm:
      return { ok: true };
    case MessageType.AutofillResult:
      return { ok: true };
    default:
      return { ok: false, error: 'Unhandled message type' };
  }
}

export function registerMessageRouter(): void {
  addRuntimeMessageListener(handleMessage);
}
