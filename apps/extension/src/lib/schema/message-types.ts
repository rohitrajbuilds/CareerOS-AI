export const MessageType = {
  Ping: 'core/ping',
  GetExtensionSnapshot: 'core/get-extension-snapshot',
  GetSettings: 'core/get-settings',
  UpdateSettings: 'core/update-settings',
  OpenSidePanel: 'core/open-side-panel',
  RefreshActiveTab: 'core/refresh-active-tab',
  GetTabSession: 'core/get-tab-session',
  SiteContextDetected: 'content/site-context-detected',
  ContentReady: 'content/ready',
  RequestPageState: 'content/request-page-state',
  RequestJobAnalysisContext: 'content/request-job-analysis-context',
  PageStateResponse: 'content/page-state-response',
  JobAnalysisContextResponse: 'content/job-analysis-context-response',
  AnalyzeForm: 'content/analyze-form',
  AutofillForm: 'content/autofill-form',
  AutofillResult: 'content/autofill-result',
  BackendHealthCheck: 'backend/health-check',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];
