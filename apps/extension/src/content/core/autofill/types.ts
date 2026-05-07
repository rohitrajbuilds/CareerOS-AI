import type {
  ATSProvider,
  AutofillAction,
  AutofillDebugEntry,
  AutofillMode,
  AutofillResult,
  UserProfileRecord,
} from '@careeros/shared-types';
import type { DetectedFormField } from '../types';

export type AutofillRequest = {
  provider: ATSProvider;
  mode: AutofillMode;
  safeMode: boolean;
  debug: boolean;
};

export type PlannedAutofillAction = AutofillAction & {
  field: DetectedFormField;
  retriesRemaining: number;
};

export type UndoSnapshot = {
  fieldId: string;
  selector: string;
  xpath: string;
  previousValue: string | boolean | null;
  actionType: AutofillAction['actionType'];
};

export type AutofillExecutionContext = {
  request: AutofillRequest;
  profile: UserProfileRecord;
  actions: PlannedAutofillAction[];
  debugLog: AutofillDebugEntry[];
  undoSnapshots: UndoSnapshot[];
};

export type AutofillEngineResult = AutofillResult & {
  actions: AutofillAction[];
  debugLog: AutofillDebugEntry[];
};
