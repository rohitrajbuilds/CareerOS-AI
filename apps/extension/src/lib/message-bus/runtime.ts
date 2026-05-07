import type { RuntimeMessage } from '@/lib/schema/messages';

export async function sendRuntimeMessage<TResponse = unknown>(
  message: RuntimeMessage,
): Promise<TResponse> {
  return chrome.runtime.sendMessage(message) as Promise<TResponse>;
}

export function addRuntimeMessageListener(
  handler: (
    message: RuntimeMessage,
    sender: chrome.runtime.MessageSender,
  ) => Promise<unknown> | unknown,
): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    Promise.resolve(handler(message as RuntimeMessage, sender))
      .then((response) => sendResponse(response))
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown runtime message error',
        });
      });

    return true;
  });
}
