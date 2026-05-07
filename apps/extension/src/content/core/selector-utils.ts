import type { SupportedFieldElement } from './types';

function escapeIdentifier(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/([^\w-])/g, '\\$1');
}

export function buildCssSelector(element: SupportedFieldElement): string {
  if (element.id) {
    return `#${escapeIdentifier(element.id)}`;
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body && segments.length < 5) {
    let segment = current.tagName.toLowerCase();
    if (current instanceof HTMLElement && current.dataset?.testid) {
      segment += `[data-testid="${current.dataset.testid}"]`;
      segments.unshift(segment);
      break;
    }

    const classNames = Array.from(current.classList).slice(0, 2);
    if (classNames.length > 0) {
      segment += classNames.map((className) => `.${escapeIdentifier(className)}`).join('');
    } else if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children).filter(
        (candidate) => candidate.tagName === current?.tagName,
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        segment += `:nth-of-type(${index})`;
      }
    }

    segments.unshift(segment);
    current = current.parentElement;
  }

  return segments.join(' > ');
}

export function buildXPath(element: SupportedFieldElement): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const parts: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index += 1;
      }
      sibling = sibling.previousElementSibling;
    }

    parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
    current = current.parentElement;
  }

  return `/${parts.join('/')}`;
}
