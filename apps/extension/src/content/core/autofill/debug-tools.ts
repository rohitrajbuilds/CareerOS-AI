import type { AutofillAction, AutofillDebugEntry } from '@careeros/shared-types';

const STYLE_ELEMENT_ID = 'careeros-autofill-debug-style';

declare global {
  interface Window {
    __careerOSAutofillDebug?: {
      lastActions: AutofillAction[];
      lastLog: AutofillDebugEntry[];
    };
  }
}

export function ensureDebugStyles(): void {
  if (document.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
    [data-careeros-preview="true"] {
      outline: 2px dashed rgba(22, 64, 214, 0.8) !important;
      outline-offset: 2px !important;
      background: rgba(22, 64, 214, 0.05) !important;
    }

    [data-careeros-filled="true"] {
      box-shadow: 0 0 0 2px rgba(16, 163, 74, 0.28) !important;
    }
  `;
  document.head.appendChild(style);
}

export function publishDebugState(
  actions: AutofillAction[],
  debugLog: AutofillDebugEntry[],
): void {
  window.__careerOSAutofillDebug = {
    lastActions: actions,
    lastLog: debugLog,
  };
}
