import { sendRuntimeMessage } from '@/lib/message-bus/runtime';
import type { AnalyzeFormMessage, SiteContextDetectedMessage } from '@/lib/schema/messages';
import { MessageType } from '@/lib/schema/message-types';
import { autofillKnownFields } from './core/autofill-engine';
import { observeDocument } from './core/dom-observer';
import { detectFormFields } from './core/field-detector';
import { getSiteContext } from './core/site-context';

async function bootstrapContentScript(): Promise<void> {
  const siteContext = getSiteContext();

  await sendRuntimeMessage<unknown>({
    type: MessageType.SiteContextDetected,
    payload: siteContext,
  } satisfies SiteContextDetectedMessage);

  const fields = detectFormFields();
  await sendRuntimeMessage<unknown>({
    type: MessageType.AnalyzeForm,
    payload: {
      provider: siteContext.provider,
      fields,
    },
  } satisfies AnalyzeFormMessage);

  observeDocument(() => {
    void autofillKnownFields();
  });
}

void bootstrapContentScript();
