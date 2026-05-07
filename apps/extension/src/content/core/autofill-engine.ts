import type { AutofillResponse } from '@/lib/schema/messages';
import { createSuccessResult } from '@/lib/message-bus/runtime';
import { buildAutofillPlan } from './autofill/planner';
import { executeAutofill } from './autofill/executor';
import { loadAutofillProfile } from './autofill/profile-resolver';
import type { AutofillRequest } from './autofill/types';

export async function autofillKnownFields(
  request: AutofillRequest,
): Promise<AutofillResponse> {
  const profile = await loadAutofillProfile();
  const actions = buildAutofillPlan(request, profile);
  const result = await executeAutofill({
    request,
    profile,
    actions,
    debugLog: [],
    undoSnapshots: [],
  });

  return createSuccessResult(result);
}
