import type {
  AutofillResponse,
  PageStateResponseMessage,
  PageStateRuntimeResponse,
  PingResponse,
  RuntimeMessage,
} from '@/lib/schema/messages';
import { addRuntimeMessageListener, createSuccessResult } from '@/lib/message-bus/runtime';
import { MessageType } from '@/lib/schema/message-types';
import { autofillKnownFields } from './core/autofill-engine';
import { getPageState } from './core/page-state';

export function registerContentMessageHandlers(): void {
  addRuntimeMessageListener(async (message: RuntimeMessage) => {
    switch (message.type) {
      case MessageType.Ping:
        return createSuccessResult({ pong: true, surface: 'content' }) satisfies PingResponse;
      case MessageType.RequestPageState:
        return createSuccessResult(getPageState()) satisfies PageStateRuntimeResponse;
      case MessageType.AutofillForm:
        return createSuccessResult(autofillKnownFields()) satisfies AutofillResponse;
      default:
        return null;
    }
  });
}

export function createPageStateMessage(): PageStateResponseMessage {
  const pageState = getPageState();
  return {
    type: MessageType.PageStateResponse,
    payload: pageState,
  };
}
