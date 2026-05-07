import type { ATSProvider, FormField, SiteContext } from '@careeros/shared-types';
import { MessageType } from './message-types';

export type PingMessage = {
  type: typeof MessageType.Ping;
};

export type SiteContextDetectedMessage = {
  type: typeof MessageType.SiteContextDetected;
  payload: SiteContext;
};

export type AnalyzeFormMessage = {
  type: typeof MessageType.AnalyzeForm;
  payload: {
    provider: ATSProvider;
    fields: FormField[];
  };
};

export type AutofillFormMessage = {
  type: typeof MessageType.AutofillForm;
  payload: {
    provider: ATSProvider;
  };
};

export type AutofillResultMessage = {
  type: typeof MessageType.AutofillResult;
  payload: {
    filledCount: number;
    unresolved: string[];
  };
};

export type BackendHealthCheckMessage = {
  type: typeof MessageType.BackendHealthCheck;
};

export type RuntimeMessage =
  | PingMessage
  | SiteContextDetectedMessage
  | AnalyzeFormMessage
  | AutofillFormMessage
  | AutofillResultMessage
  | BackendHealthCheckMessage;
