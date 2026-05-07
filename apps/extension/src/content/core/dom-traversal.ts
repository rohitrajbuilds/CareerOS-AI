import type { SupportedFieldElement } from './types';

const FIELD_SELECTOR = 'input, textarea, select';

function isSupportedFieldElement(node: Element): node is SupportedFieldElement {
  return (
    node instanceof HTMLInputElement ||
    node instanceof HTMLTextAreaElement ||
    node instanceof HTMLSelectElement
  );
}

function shouldSkipField(element: SupportedFieldElement): boolean {
  if (element instanceof HTMLInputElement) {
    const inputType = element.type.toLowerCase();
    if (['hidden', 'submit', 'button', 'image', 'reset'].includes(inputType)) {
      return true;
    }
  }

  return Boolean(element.disabled || element.getAttribute('aria-hidden') === 'true');
}

function collectFromRoot(root: ParentNode, collector: SupportedFieldElement[]): void {
  const nodes = root.querySelectorAll(FIELD_SELECTOR);
  for (const node of nodes) {
    if (isSupportedFieldElement(node) && !shouldSkipField(node)) {
      collector.push(node);
    }
  }

  const allElements = root.querySelectorAll('*');
  for (const element of allElements) {
    if (element.shadowRoot) {
      collectFromRoot(element.shadowRoot, collector);
    }
  }
}

export function collectFieldElements(root: Document | ShadowRoot = document): SupportedFieldElement[] {
  const collector: SupportedFieldElement[] = [];
  collectFromRoot(root, collector);
  return collector;
}
