import type { AutofillResult } from '@careeros/shared-types';

export function autofillKnownFields(): AutofillResult {
  return {
    filledCount: 0,
    unresolved: ['Autofill mappings not configured yet'],
  };
}
