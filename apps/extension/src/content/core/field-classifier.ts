import type { ATSProvider, FieldType } from '@careeros/shared-types';
import { fuzzyContains, scoreTextMatch } from './text-utils';
import type { DetectionStrategyResult, FieldCandidateContext, SupportedFieldElement } from './types';

const fieldLexicon: Array<{ type: FieldType; terms: string[] }> = [
  { type: 'email', terms: ['email', 'e-mail'] },
  { type: 'phone', terms: ['phone', 'mobile', 'contact number', 'telephone'] },
  { type: 'url', terms: ['portfolio', 'website', 'linkedin', 'github', 'url', 'profile link'] },
  { type: 'date', terms: ['date', 'start date', 'end date', 'available from'] },
  { type: 'file', terms: ['resume', 'cv', 'upload', 'attachment'] },
  { type: 'search', terms: ['search'] },
  { type: 'number', terms: ['years', 'salary', 'notice period', 'experience'] },
];

function inferFromNativeElement(element: SupportedFieldElement): DetectionStrategyResult | null {
  if (element instanceof HTMLTextAreaElement) {
    return { fieldType: 'textarea', confidence: 0.98 };
  }

  if (element instanceof HTMLSelectElement) {
    return { fieldType: 'select', confidence: 0.98 };
  }

  if (element instanceof HTMLInputElement) {
    const inputType = element.type.toLowerCase();
    switch (inputType) {
      case 'email':
        return { fieldType: 'email', confidence: 0.99 };
      case 'tel':
        return { fieldType: 'phone', confidence: 0.99 };
      case 'url':
        return { fieldType: 'url', confidence: 0.99 };
      case 'checkbox':
        return { fieldType: 'checkbox', confidence: 0.99 };
      case 'radio':
        return { fieldType: 'radio', confidence: 0.99 };
      case 'number':
        return { fieldType: 'number', confidence: 0.99 };
      case 'date':
        return { fieldType: 'date', confidence: 0.99 };
      case 'file':
        return { fieldType: 'file', confidence: 0.99 };
      case 'search':
        return { fieldType: 'search', confidence: 0.99 };
      default:
        return null;
    }
  }

  return null;
}

function inferProviderHint(
  provider: ATSProvider,
  context: FieldCandidateContext,
): DetectionStrategyResult | null {
  const signals = [context.label, context.placeholder, ...context.nearbyText].join(' ');

  if (provider === 'linkedin' && fuzzyContains(signals, ['phone number'])) {
    return { fieldType: 'phone', confidence: 0.91 };
  }

  if (provider === 'workday' && fuzzyContains(signals, ['website', 'linkedin', 'resume'])) {
    if (fuzzyContains(signals, ['resume'])) {
      return { fieldType: 'file', confidence: 0.9 };
    }

    return { fieldType: 'url', confidence: 0.88 };
  }

  return null;
}

export function classifyField(
  element: SupportedFieldElement,
  context: FieldCandidateContext,
  provider: ATSProvider,
): DetectionStrategyResult {
  const nativeType = inferFromNativeElement(element);
  if (nativeType) {
    return nativeType;
  }

  const providerType = inferProviderHint(provider, context);
  if (providerType) {
    return providerType;
  }

  const textSignals = [
    context.label,
    context.placeholder,
    context.ariaLabel,
    context.name,
    context.id,
    ...context.nearbyText,
    ...context.describedByText,
  ].join(' ');

  let best: DetectionStrategyResult = { fieldType: 'text', confidence: 0.55 };
  for (const entry of fieldLexicon) {
    const score = scoreTextMatch(textSignals, entry.terms);
    if (score > best.confidence) {
      best = {
        fieldType: entry.type,
        confidence: Math.min(0.95, 0.55 + score * 0.4),
      };
    }
  }

  return best;
}
