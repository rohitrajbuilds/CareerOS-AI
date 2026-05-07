import type { ATSProvider } from '@careeros/shared-types';
import { fuzzyContains } from './text-utils';
import type { SupportedFieldElement } from './types';

export function boostConfidenceForProvider(
  provider: ATSProvider,
  element: SupportedFieldElement,
  label: string,
  confidence: number,
): number {
  const automationId = element.getAttribute('data-automation-id') ?? '';
  const className = element.className.toString();
  const joinedSignals = `${automationId} ${className} ${label}`.toLowerCase();

  if (provider === 'workday' && fuzzyContains(joinedSignals, ['data-automation-id', 'wd'])) {
    return Math.min(0.99, confidence + 0.05);
  }

  if (provider === 'greenhouse' && fuzzyContains(joinedSignals, ['application-question'])) {
    return Math.min(0.99, confidence + 0.04);
  }

  if (provider === 'lever' && fuzzyContains(joinedSignals, ['application', 'posting'])) {
    return Math.min(0.99, confidence + 0.03);
  }

  if (provider === 'linkedin' && fuzzyContains(joinedSignals, ['jobs-easy-apply', 'artdeco'])) {
    return Math.min(0.99, confidence + 0.04);
  }

  return confidence;
}
