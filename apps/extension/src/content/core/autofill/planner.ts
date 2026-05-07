import type { AutofillAction } from '@careeros/shared-types';
import { detectFormFields } from '../field-detector';
import { resolveAutofillValue } from './profile-resolver';
import type { AutofillRequest, PlannedAutofillAction } from './types';

export function buildAutofillPlan(
  request: AutofillRequest,
  profileRecord: Parameters<typeof resolveAutofillValue>[0],
): PlannedAutofillAction[] {
  const fields = detectFormFields(request.provider);

  return fields.map((field) => {
    const resolution = resolveAutofillValue(profileRecord, field);
    const action: PlannedAutofillAction = {
      fieldId: field.id,
      selector: field.selector,
      label: field.label,
      type: field.type,
      actionType: resolution.actionType,
      confidence: Math.min(0.99, (field.confidence + resolution.confidence) / 2),
      value: resolution.value,
      valueLabel: typeof resolution.value === 'string' ? resolution.value : undefined,
      reason: resolution.reason,
      field,
      retriesRemaining: 2,
    };

    return action;
  });
}

export function shouldFillAction(
  action: PlannedAutofillAction,
  safeMode: boolean,
): boolean {
  if (action.actionType === 'skip' || action.actionType === 'file') {
    return false;
  }

  if (!safeMode) {
    return action.confidence >= 0.45;
  }

  return action.confidence >= 0.75;
}

export function toAutofillActions(actions: PlannedAutofillAction[]): AutofillAction[] {
  return actions.map(({ field: _field, retriesRemaining: _retriesRemaining, ...action }) => action);
}
