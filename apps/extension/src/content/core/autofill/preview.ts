import type { PlannedAutofillAction, UndoSnapshot } from './types';
import { resolveFieldElement } from './selector-resolver';

const PREVIEW_ATTRIBUTE = 'data-careeros-preview';
const FILLED_ATTRIBUTE = 'data-careeros-filled';

export function applyPreview(actions: PlannedAutofillAction[]): number {
  let previewCount = 0;
  for (const action of actions) {
    const element = resolveFieldElement(action.selector, action.field.xpath);
    if (!element) {
      continue;
    }

    element.setAttribute(PREVIEW_ATTRIBUTE, 'true');
    element.setAttribute('data-careeros-preview-label', action.label);
    previewCount += 1;
  }

  return previewCount;
}

export function clearPreviewMarks(): void {
  for (const element of Array.from(document.querySelectorAll(`[${PREVIEW_ATTRIBUTE}]`))) {
    element.removeAttribute(PREVIEW_ATTRIBUTE);
    element.removeAttribute('data-careeros-preview-label');
  }
}

export function markFilled(selector: string, xpath: string): void {
  const element = resolveFieldElement(selector, xpath);
  if (element) {
    element.setAttribute(FILLED_ATTRIBUTE, 'true');
  }
}

export function clearFilledMarks(): void {
  for (const element of Array.from(document.querySelectorAll(`[${FILLED_ATTRIBUTE}]`))) {
    element.removeAttribute(FILLED_ATTRIBUTE);
  }
}

export function undoSnapshots(snapshots: UndoSnapshot[]): number {
  let restored = 0;
  for (const snapshot of snapshots) {
    const element = resolveFieldElement(snapshot.selector, snapshot.xpath);
    if (!element) {
      continue;
    }

    if (typeof snapshot.previousValue === 'boolean' && element instanceof HTMLInputElement) {
      element.checked = snapshot.previousValue;
      element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    } else if (typeof snapshot.previousValue === 'string') {
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        element.value = snapshot.previousValue;
        element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      }
    }

    restored += 1;
  }

  clearPreviewMarks();
  clearFilledMarks();
  return restored;
}
