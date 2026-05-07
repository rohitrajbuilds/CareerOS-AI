import { normalizeText, uniqueText } from './text-utils';
import type { FieldCandidateContext, SupportedFieldElement } from './types';

function resolveAriaLabelledByText(element: SupportedFieldElement): string[] {
  const labelledByIds = (element.getAttribute('aria-labelledby') ?? '')
    .split(/\s+/)
    .map((id) => id.trim())
    .filter(Boolean);

  return labelledByIds
    .map((id) => document.getElementById(id))
    .filter((node): node is HTMLElement => Boolean(node))
    .map((node) => normalizeText(node.innerText || node.textContent));
}

function resolveDescribedByText(element: SupportedFieldElement): string[] {
  const describedByIds = (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => id.trim())
    .filter(Boolean);

  return describedByIds
    .map((id) => document.getElementById(id))
    .filter((node): node is HTMLElement => Boolean(node))
    .map((node) => normalizeText(node.innerText || node.textContent));
}

function resolveLabelFromForAttribute(element: SupportedFieldElement): string[] {
  if (!element.id) {
    return [];
  }

  return Array.from(document.querySelectorAll(`label[for="${element.id}"]`))
    .map((node) => normalizeText(node.textContent))
    .filter(Boolean);
}

function resolveWrappedLabelText(element: SupportedFieldElement): string[] {
  const label = element.closest('label');
  if (!label) {
    return [];
  }

  return [normalizeText(label.textContent)];
}

function resolveNearestSectionText(element: SupportedFieldElement): string[] {
  const nearbyCandidates = [
    element.closest('[data-automation-id]'),
    element.closest('[role="group"]'),
    element.closest('[role="radiogroup"]'),
    element.closest('.form-group'),
    element.parentElement,
    element.parentElement?.parentElement,
  ].filter((node): node is Element => Boolean(node));

  const snippets: string[] = [];
  for (const candidate of nearbyCandidates) {
    const textNodes = Array.from(
      candidate.querySelectorAll('label, legend, span, p, strong, div, h1, h2, h3, h4'),
    )
      .slice(0, 8)
      .map((node) => normalizeText(node.textContent))
      .filter(Boolean);

    snippets.push(...textNodes);
  }

  return uniqueText(snippets).slice(0, 8);
}

export function buildFieldCandidateContext(
  element: SupportedFieldElement,
): FieldCandidateContext {
  const ariaLabel = normalizeText(element.getAttribute('aria-label'));
  const placeholder = normalizeText(element.getAttribute('placeholder'));
  const labelCandidates = uniqueText([
    ...resolveLabelFromForAttribute(element),
    ...resolveWrappedLabelText(element),
    ...resolveAriaLabelledByText(element),
  ]);

  return {
    label: labelCandidates[0] ?? '',
    placeholder,
    ariaLabel,
    nearbyText: resolveNearestSectionText(element),
    describedByText: resolveDescribedByText(element),
    name: normalizeText(element.getAttribute('name')),
    id: normalizeText(element.id),
  };
}
