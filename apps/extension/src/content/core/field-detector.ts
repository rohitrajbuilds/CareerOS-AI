import type { FormField } from '@careeros/shared-types';

const supportedSelectors = 'input, textarea, select';

export function detectFormFields(): FormField[] {
  const nodes = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(supportedSelectors));

  return nodes.map((node, index) => ({
    id: node.id || `${node.tagName.toLowerCase()}-${index}`,
    label: node.getAttribute('aria-label') || node.getAttribute('name') || node.id || 'Unknown field',
    type: node.tagName.toLowerCase(),
    required: node.required,
  }));
}
