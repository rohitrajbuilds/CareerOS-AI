import { sendRuntimeMessage } from '@/lib/message-bus/runtime';
import type {
  AnalyzeFormMessage,
  ContentReadyMessage,
  SiteContextDetectedMessage,
} from '@/lib/schema/messages';
import { MessageType } from '@/lib/schema/message-types';
import { AiAssistantOverlay } from './ai/assistant-overlay';
import { AiGenerateButtonManager } from './ai/generate-buttons';
import { observeDocument } from './core/dom-observer';
import { getPageState } from './core/page-state';
import { registerContentMessageHandlers } from './runtime';

let hasBootstrapped = false;
let changeNotificationTimer: number | null = null;
let pageObserver: MutationObserver | null = null;
let removeDynamicRescanTriggers: (() => void) | null = null;
const assistantOverlay = new AiAssistantOverlay();
const buttonManager = new AiGenerateButtonManager(assistantOverlay);

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

function registerDynamicRescanTriggers(): () => void {
  const triggerRescan = () => schedulePageStateNotification();

  document.addEventListener('input', triggerRescan, true);
  document.addEventListener('change', triggerRescan, true);
  window.addEventListener('load', triggerRescan, { once: true });

  window.setTimeout(() => {
    triggerRescan();
  }, 1500);

  return () => {
    document.removeEventListener('input', triggerRescan, true);
    document.removeEventListener('change', triggerRescan, true);
  };
}

function teardownContentScript(): void {
  if (changeNotificationTimer !== null) {
    window.clearTimeout(changeNotificationTimer);
    changeNotificationTimer = null;
  }

  pageObserver?.disconnect();
  pageObserver = null;
  removeDynamicRescanTriggers?.();
  removeDynamicRescanTriggers = null;
  assistantOverlay.close();
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
  buttonManager.attachButtons();

  pageObserver = observeDocument(() => {
    schedulePageStateNotification();
    buttonManager.attachButtons();
  });
  removeDynamicRescanTriggers = registerDynamicRescanTriggers();
  window.addEventListener('pagehide', teardownContentScript, { once: true });
}

void bootstrapContentScript();
