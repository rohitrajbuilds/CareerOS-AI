export const MessageType = {
  Ping: 'core/ping',
  SiteContextDetected: 'content/site-context-detected',
  AnalyzeForm: 'content/analyze-form',
  AutofillForm: 'content/autofill-form',
  AutofillResult: 'content/autofill-result',
  BackendHealthCheck: 'backend/health-check',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];
