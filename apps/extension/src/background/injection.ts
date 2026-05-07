import { sendTabMessage } from '@/lib/message-bus/runtime';
import type { PingResponse } from '@/lib/schema/messages';
import { MessageType } from '@/lib/schema/message-types';
import { CONTENT_SCRIPT_FILE } from './constants';

export async function isContentScriptReady(tabId: number): Promise<boolean> {
  try {
    const response = await sendTabMessage<PingResponse>(tabId, { type: MessageType.Ping });
    return response.ok && response.data.surface === 'content';
  } catch {
    return false;
  }
}

export async function ensureContentScriptInjected(tabId: number): Promise<void> {
  const ready = await isContentScriptReady(tabId);
  if (ready) {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [CONTENT_SCRIPT_FILE],
  });
}
