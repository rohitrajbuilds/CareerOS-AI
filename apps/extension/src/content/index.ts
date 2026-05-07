import { sendRuntimeMessage } from '@/lib/message-bus/runtime';
import type {
  AnalyzeFormMessage,
  ContentReadyMessage,
  SiteContextDetectedMessage,
} from '@/lib/schema/messages';
import { MessageType } from '@/lib/schema/message-types';
import { autofillKnownFields } from './core/autofill-engine';
import { observeDocument } from './core/dom-observer';
import { getPageState } from './core/page-state';
import { registerContentMessageHandlers } from './runtime';

let hasBootstrapped = false;
let changeNotificationTimer: number | null = null;

async function notifyPageState(): Promise<void> {
  const pageState = getPageState();

  await sendRuntimeMessage<unknown>({
    type: MessageType.SiteContextDetected,
    payload: pageState.siteContext,
  } satisfies SiteContextDetectedMessage);

  await sendRuntimeMessage<unknown>({
    type: MessageType.AnalyzeForm,
    payload: {
      provider: pageState.siteContext.provider,
      fields: pageState.fields,
    },
  } satisfies AnalyzeFormMessage);
}

function schedulePageStateNotification(): void {
  if (changeNotificationTimer !== null) {
    window.clearTimeout(changeNotificationTimer);
  }

  changeNotificationTimer = window.setTimeout(() => {
    void notifyPageState();
  }, 250);
}

async function bootstrapContentScript(): Promise<void> {
  if (hasBootstrapped) {
    return;
  }
  hasBootstrapped = true;

  registerContentMessageHandlers();

  await sendRuntimeMessage<unknown>({
    type: MessageType.ContentReady,
    payload: {
      href: window.location.href,
    },
  } satisfies ContentReadyMessage);

  await notifyPageState();

  observeDocument(() => {
    schedulePageStateNotification();
  });

  void autofillKnownFields();
}

void bootstrapContentScript();
