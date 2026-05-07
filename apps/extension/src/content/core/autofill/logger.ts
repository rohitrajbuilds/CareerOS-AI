import type { AutofillDebugEntry } from '@careeros/shared-types';
import type { PlannedAutofillAction } from './types';

export class AutofillLogger {
  private entries: AutofillDebugEntry[] = [];

  add(
    action: Pick<PlannedAutofillAction, 'fieldId' | 'label' | 'selector' | 'confidence'>,
    status: AutofillDebugEntry['status'],
    message: string,
  ): void {
    const entry: AutofillDebugEntry = {
      fieldId: action.fieldId,
      label: action.label,
      selector: action.selector,
      confidence: action.confidence,
      status,
      message,
    };

    this.entries.push(entry);
    console.debug('[CareerOS AI][Autofill]', entry);
  }

  flush(): AutofillDebugEntry[] {
    return [...this.entries];
  }
}
