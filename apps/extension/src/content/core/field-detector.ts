import type { ATSProvider, FormField } from '@careeros/shared-types';
import { buildFieldCandidateContext } from './accessibility';
import { classifyField } from './field-classifier';
import { collectFieldElements } from './dom-traversal';
import { boostConfidenceForProvider } from './provider-hints';
import { buildCssSelector, buildXPath } from './selector-utils';
import { normalizeText, uniqueText } from './text-utils';
import type { DetectedFormField, SupportedFieldElement } from './types';

function buildElementId(element: SupportedFieldElement, index: number): string {
  return (
    element.id ||
    element.getAttribute('name') ||
    `${element.tagName.toLowerCase()}-${index}-${Math.abs(buildXPath(element).length)}`
  );
}

function buildMatchedBy(
  context: ReturnType<typeof buildFieldCandidateContext>,
): DetectedFormField['matchedBy'] {
  const matchedBy: DetectedFormField['matchedBy'] = [];

  if (context.label) {
    matchedBy.push('label');
  }
  if (context.placeholder) {
    matchedBy.push('placeholder');
  }
  if (context.ariaLabel) {
    matchedBy.push('aria-label', 'accessibility');
  }
  if (context.describedByText.length > 0) {
    matchedBy.push('aria-labelledby', 'accessibility');
  }
  if (context.name) {
    matchedBy.push('name');
  }
  if (context.id) {
    matchedBy.push('id');
  }
  if (context.nearbyText.length > 0) {
    matchedBy.push('nearby-text');
  }

  return Array.from(new Set(matchedBy));
}

function chooseDisplayLabel(context: ReturnType<typeof buildFieldCandidateContext>): string {
  return (
    context.label ||
    context.ariaLabel ||
    context.placeholder ||
    context.nearbyText[0] ||
    context.name ||
    context.id ||
    'Unknown field'
  );
}

function toDetectedField(
  element: SupportedFieldElement,
  index: number,
  provider: ATSProvider,
): DetectedFormField {
  const context = buildFieldCandidateContext(element);
  const classification = classifyField(element, context, provider);
  const label = chooseDisplayLabel(context);
  const selector = buildCssSelector(element);
  const xpath = buildXPath(element);

  return {
    id: buildElementId(element, index),
    type: classification.fieldType,
    confidence: boostConfidenceForProvider(provider, element, label, classification.confidence),
    selector,
    xpath,
    label,
    required:
      element.required ||
      element.getAttribute('aria-required') === 'true' ||
      normalizeText(element.getAttribute('data-required')) === 'true',
    placeholder: context.placeholder || undefined,
    ariaLabel: context.ariaLabel || undefined,
    name: context.name || undefined,
    nearbyText: uniqueText([...context.nearbyText, ...context.describedByText]).slice(0, 8),
    element,
    rawType:
      element instanceof HTMLInputElement ? element.type.toLowerCase() : element.tagName.toLowerCase(),
    matchedBy: buildMatchedBy(context),
  };
}

function dedupeFields(fields: DetectedFormField[]): DetectedFormField[] {
  const seen = new Set<string>();
  return fields.filter((field) => {
    const key = `${field.selector}|${field.xpath}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function detectFormFields(provider: ATSProvider): DetectedFormField[] {
  const elements = collectFieldElements();
  const detected = elements.map((element, index) => toDetectedField(element, index, provider));
  return dedupeFields(detected).sort((left, right) => right.confidence - left.confidence);
}

export function toSerializableFieldMap(fields: DetectedFormField[]): FormField[] {
  return fields.map(({ element: _element, rawType: _rawType, matchedBy: _matchedBy, ...serializable }) => serializable);
}
