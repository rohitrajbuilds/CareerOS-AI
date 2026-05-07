import type { RuntimeResult } from '@careeros/shared-types';
import type { RuntimeMessage } from '@/lib/schema/messages';

export class RuntimeMessageError extends Error {
  constructor(
    message: string,
    readonly code = 'runtime_error',
  ) {
    super(message);
    this.name = 'RuntimeMessageError';
  }
}

export async function sendRuntimeMessage<TResponse = unknown>(
  message: RuntimeMessage,
): Promise<TResponse> {
  return chrome.runtime.sendMessage(message) as Promise<TResponse>;
}

export async function sendTabMessage<TResponse = unknown>(
  tabId: number,
  message: RuntimeMessage,
): Promise<TResponse> {
  return chrome.tabs.sendMessage(tabId, message) as Promise<TResponse>;
}

export function createSuccessResult<TData>(data: TData): RuntimeResult<TData> {
  return { ok: true, data };
}

export function createErrorResult(
  code: string,
  message: string,
): RuntimeResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
    },
  };
}

export function assertRuntimeResult<TData>(
  result: RuntimeResult<TData>,
): asserts result is { ok: true; data: TData } {
  if (!result.ok) {
    throw new RuntimeMessageError(result.error.message, result.error.code);
  }
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
        sendResponse(
          createErrorResult(
            error instanceof RuntimeMessageError ? error.code : 'runtime_handler_failed',
            error instanceof Error ? error.message : 'Unknown runtime message error',
          ),
        );
      });

    return true;
  });
}
