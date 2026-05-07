import { buildXPath } from '../selector-utils';
import type { SupportedFieldElement } from '../types';

function resolveByXPath(xpath: string): Element | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    return result.singleNodeValue instanceof Element ? result.singleNodeValue : null;
  } catch {
    return null;
  }
}

export function resolveFieldElement(
  selector: string,
  xpath: string,
): SupportedFieldElement | null {
  const bySelector = document.querySelector(selector);
  if (
    bySelector instanceof HTMLInputElement ||
    bySelector instanceof HTMLTextAreaElement ||
    bySelector instanceof HTMLSelectElement
  ) {
    return bySelector;
  }

  const byXPath = resolveByXPath(xpath);
  if (
    byXPath instanceof HTMLInputElement ||
    byXPath instanceof HTMLTextAreaElement ||
    byXPath instanceof HTMLSelectElement
  ) {
    return byXPath;
  }

  return null;
}

export function refreshXPath(element: SupportedFieldElement): string {
  return buildXPath(element);
}
