import type { AutofillResult } from '@careeros/shared-types';
import { captureCurrentValue, selectValueLikeUser, setCheckboxLikeUser, setRadioLikeUser, typeLikeHuman } from './react-events';
import { ensureDebugStyles, publishDebugState } from './debug-tools';
import { resolveFieldElement } from './selector-resolver';
import { AutofillLogger } from './logger';
import { applyPreview, clearFilledMarks, clearPreviewMarks, markFilled, undoSnapshots } from './preview';
import { clearUndoStack, getUndoStack, pushUndoSnapshot } from './state';
import { shouldFillAction, toAutofillActions } from './planner';
import type { AutofillEngineResult, AutofillExecutionContext, PlannedAutofillAction } from './types';

async function executeAction(
  action: PlannedAutofillAction,
  logger: AutofillLogger,
  safeMode: boolean,
): Promise<'filled' | 'skipped' | 'failed'> {
  const element = resolveFieldElement(action.selector, action.field.xpath);
  if (!element) {
    logger.add(action, 'failed', 'Unable to resolve field element');
    return 'failed';
  }

  const currentValue = captureCurrentValue(element);
  if (
    safeMode &&
    ((typeof currentValue === 'string' && currentValue.trim().length > 0) ||
      (typeof currentValue === 'boolean' && currentValue))
  ) {
    logger.add(action, 'skipped', 'Skipped non-empty field in safe mode');
    return 'skipped';
  }

  pushUndoSnapshot({
    fieldId: action.fieldId,
    selector: action.selector,
    xpath: action.field.xpath,
    previousValue: currentValue,
    actionType: action.actionType,
  });

  try {
    switch (action.actionType) {
      case 'type':
        if (typeof action.value !== 'string') {
          logger.add(action, 'skipped', 'No text value available');
          return 'skipped';
        }
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          await typeLikeHuman(element, action.value);
          markFilled(action.selector, action.field.xpath);
          logger.add(action, 'filled', 'Filled text input');
          return 'filled';
        }
        if (element instanceof HTMLSelectElement) {
          const selected = await selectValueLikeUser(element, action.value);
          logger.add(action, selected ? 'filled' : 'failed', selected ? 'Selected dropdown option' : 'Dropdown option not found');
          return selected ? 'filled' : 'failed';
        }
        return 'failed';
      case 'select':
        if (!(element instanceof HTMLSelectElement) || typeof action.value !== 'string') {
          logger.add(action, 'failed', 'Select action could not be applied');
          return 'failed';
        }
        {
          const selected = await selectValueLikeUser(element, action.value);
          logger.add(action, selected ? 'filled' : 'failed', selected ? 'Selected dropdown option' : 'Dropdown option not found');
          return selected ? 'filled' : 'failed';
        }
      case 'checkbox':
        if (!(element instanceof HTMLInputElement)) {
          logger.add(action, 'failed', 'Checkbox action requires input element');
          return 'failed';
        }
        await setCheckboxLikeUser(element, Boolean(action.value));
        logger.add(action, 'filled', 'Updated checkbox');
        return 'filled';
      case 'radio':
        if (typeof action.value !== 'string') {
          logger.add(action, 'failed', 'Radio action missing value');
          return 'failed';
        }
        {
          const matched = await setRadioLikeUser(action.field.name ?? '', action.value);
          logger.add(action, matched ? 'filled' : 'failed', matched ? 'Selected radio option' : 'Radio option not found');
          return matched ? 'filled' : 'failed';
        }
      case 'file':
        logger.add(action, 'skipped', 'File inputs require manual user action');
        return 'skipped';
      case 'skip':
      default:
        logger.add(action, 'skipped', action.reason ?? 'No autofill strategy available');
        return 'skipped';
    }
  } catch (error) {
    logger.add(action, 'failed', error instanceof Error ? error.message : 'Unknown autofill error');
    return 'failed';
  }
}

export async function executeAutofill(
  context: AutofillExecutionContext,
): Promise<AutofillEngineResult> {
  const logger = new AutofillLogger();
  ensureDebugStyles();
  clearPreviewMarks();

  if (context.request.mode === 'undo') {
    const undoCount = undoSnapshots(getUndoStack());
    clearUndoStack();
    return {
      filledCount: 0,
      undoCount,
      unresolved: [],
      operation: 'undo',
      actions: [],
      debugLog: logger.flush(),
    };
  }

  if (context.request.mode === 'preview') {
    const previewable = context.actions.filter((action) => shouldFillAction(action, context.request.safeMode));
    const previewCount = applyPreview(previewable);
    for (const action of previewable) {
      logger.add(action, 'previewed', action.reason ?? 'Previewed autofill action');
    }

    const debugLog = logger.flush();
    const actions = toAutofillActions(context.actions);
    publishDebugState(actions, debugLog);
    return {
      filledCount: 0,
      previewCount,
      unresolved: context.actions
        .filter((action) => !shouldFillAction(action, context.request.safeMode))
        .map((action) => `${action.label}: ${action.reason ?? 'Skipped by safety policy'}`),
      operation: 'preview',
      actions,
      debugLog,
    };
  }

  clearUndoStack();
  clearFilledMarks();
  let filledCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const unresolved: string[] = [];

  for (const action of context.actions) {
    logger.add(action, 'planned', action.reason ?? 'Queued autofill action');

    if (!shouldFillAction(action, context.request.safeMode)) {
      skippedCount += 1;
      unresolved.push(`${action.label}: ${action.reason ?? 'Skipped by safety threshold'}`);
      logger.add(action, 'skipped', action.reason ?? 'Skipped by safety threshold');
      continue;
    }

    let outcome: 'filled' | 'skipped' | 'failed' = 'failed';
    let retries = action.retriesRemaining;
    while (retries >= 0) {
      outcome = await executeAction(action, logger, context.request.safeMode);
      if (outcome !== 'failed') {
        break;
      }
      retries -= 1;
    }

    if (outcome === 'filled') {
      filledCount += 1;
    } else if (outcome === 'skipped') {
      skippedCount += 1;
      unresolved.push(`${action.label}: ${action.reason ?? 'Skipped'}`);
    } else {
      failedCount += 1;
      unresolved.push(`${action.label}: Fill failed`);
    }
  }

  const debugLog = logger.flush();
  const actions = toAutofillActions(context.actions);
  publishDebugState(actions, debugLog);
  return {
    filledCount,
    skippedCount,
    failedCount,
    unresolved,
    operation: 'fill',
    actions,
    debugLog,
  };
}
