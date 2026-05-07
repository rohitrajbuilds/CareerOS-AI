import type {
  ATSProvider,
  AutofillAction,
  AutofillMode,
  AutofillDebugEntry,
  ExtensionSettings,
  ExtensionSnapshot,
  FormField,
  JobPageContext,
  RuntimeResult,
  SiteContext,
  TabSession,
} from '@careeros/shared-types';
import { MessageType } from './message-types';

export type PingMessage = {
  type: typeof MessageType.Ping;
};

export type GetExtensionSnapshotMessage = {
  type: typeof MessageType.GetExtensionSnapshot;
};

export type GetSettingsMessage = {
  type: typeof MessageType.GetSettings;
};

export type UpdateSettingsMessage = {
  type: typeof MessageType.UpdateSettings;
  payload: Partial<ExtensionSettings>;
};

export type OpenSidePanelMessage = {
  type: typeof MessageType.OpenSidePanel;
  payload?: {
    tabId?: number;
    windowId?: number;
  };
};

export type RefreshActiveTabMessage = {
  type: typeof MessageType.RefreshActiveTab;
};

export type GetTabSessionMessage = {
  type: typeof MessageType.GetTabSession;
  payload?: {
    tabId?: number;
  };
};

export type SiteContextDetectedMessage = {
  type: typeof MessageType.SiteContextDetected;
  payload: SiteContext;
};

export type ContentReadyMessage = {
  type: typeof MessageType.ContentReady;
  payload: {
    href: string;
  };
};

export type RequestPageStateMessage = {
  type: typeof MessageType.RequestPageState;
};

export type PageStateResponseMessage = {
  type: typeof MessageType.PageStateResponse;
  payload: {
    siteContext: SiteContext;
    fields: FormField[];
  };
};

export type RequestJobAnalysisContextMessage = {
  type: typeof MessageType.RequestJobAnalysisContext;
};

export type JobAnalysisContextResponseMessage = {
  type: typeof MessageType.JobAnalysisContextResponse;
  payload: {
    jobContext: JobPageContext;
  };
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
    mode?: AutofillMode;
    safeMode?: boolean;
    debug?: boolean;
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
  | GetExtensionSnapshotMessage
  | GetSettingsMessage
  | UpdateSettingsMessage
  | OpenSidePanelMessage
  | RefreshActiveTabMessage
  | GetTabSessionMessage
  | SiteContextDetectedMessage
  | ContentReadyMessage
  | RequestPageStateMessage
  | RequestJobAnalysisContextMessage
  | PageStateResponseMessage
  | JobAnalysisContextResponseMessage
  | AnalyzeFormMessage
  | AutofillFormMessage
  | AutofillResultMessage
  | BackendHealthCheckMessage;

export type PingResponse = RuntimeResult<{ pong: true; surface: 'background' | 'content' }>;
export type ExtensionSnapshotResponse = RuntimeResult<ExtensionSnapshot>;
export type SettingsResponse = RuntimeResult<ExtensionSettings>;
export type UpdateSettingsResponse = RuntimeResult<ExtensionSettings>;
export type OpenSidePanelResponse = RuntimeResult<{ opened: true }>;
export type TabSessionResponse = RuntimeResult<TabSession | null>;
export type AnalyzeFormResponse = RuntimeResult<{ fieldCount: number }>;
export type AutofillResponse = RuntimeResult<{
  filledCount: number;
  unresolved: string[];
  previewCount?: number;
  undoCount?: number;
  skippedCount?: number;
  failedCount?: number;
  operation?: AutofillMode;
  actions?: AutofillAction[];
  debugLog?: AutofillDebugEntry[];
}>;
export type PageStateRuntimeResponse = RuntimeResult<{
  siteContext: SiteContext;
  fields: FormField[];
}>;
export type JobAnalysisContextRuntimeResponse = RuntimeResult<{
  jobContext: JobPageContext;
}>;
