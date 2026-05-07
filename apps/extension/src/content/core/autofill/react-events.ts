import type { SupportedFieldElement } from '../types';

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = Object.getPrototypeOf(element) as HTMLInputElement | HTMLTextAreaElement;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  descriptor?.set?.call(element, value);
}

function setNativeChecked(element: HTMLInputElement, checked: boolean): void {
  const prototype = Object.getPrototypeOf(element) as HTMLInputElement;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'checked');
  descriptor?.set?.call(element, checked);
}

function dispatchBubbledEvent(element: Element, type: string): void {
  element.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
}

function dispatchKeyboardSequence(element: Element): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Tab' }));
}

export async function typeLikeHuman(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): Promise<void> {
  element.focus();
  setNativeValue(element, '');
  dispatchBubbledEvent(element, 'input');

  let current = '';
  for (const character of value) {
    current += character;
    setNativeValue(element, current);
    dispatchBubbledEvent(element, 'keydown');
    dispatchBubbledEvent(element, 'input');
    dispatchBubbledEvent(element, 'keyup');
    await new Promise((resolve) => window.setTimeout(resolve, 12));
  }

  dispatchBubbledEvent(element, 'change');
  dispatchKeyboardSequence(element);
  element.blur();
}

export async function selectValueLikeUser(
  element: HTMLSelectElement,
  value: string,
): Promise<boolean> {
  const normalizedTarget = value.toLowerCase();
  const option = Array.from(element.options).find((candidate) => {
    const label = candidate.label.toLowerCase();
    const optionValue = candidate.value.toLowerCase();
    return label.includes(normalizedTarget) || optionValue.includes(normalizedTarget);
  });

  if (!option) {
    return false;
  }

  element.focus();
  element.value = option.value;
  dispatchBubbledEvent(element, 'input');
  dispatchBubbledEvent(element, 'change');
  element.blur();
  return true;
}

export async function setCheckboxLikeUser(
  element: HTMLInputElement,
  checked: boolean,
): Promise<void> {
  element.focus();
  setNativeChecked(element, checked);
  dispatchBubbledEvent(element, 'click');
  dispatchBubbledEvent(element, 'input');
  dispatchBubbledEvent(element, 'change');
  element.blur();
}

export async function setRadioLikeUser(
  fieldName: string,
  desiredValue: string,
): Promise<boolean> {
  const radios = Array.from(
    document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${fieldName}"]`),
  );

  const candidate = radios.find((radio) => {
    const text = `${radio.value} ${radio.getAttribute('aria-label') ?? ''}`.toLowerCase();
    return text.includes(desiredValue.toLowerCase());
  });

  if (!candidate) {
    return false;
  }

  await setCheckboxLikeUser(candidate, true);
  return true;
}

export function captureCurrentValue(
  element: SupportedFieldElement,
): string | boolean | null {
  if (element instanceof HTMLSelectElement) {
    return element.value;
  }

  if (element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  if (element.type === 'checkbox' || element.type === 'radio') {
    return element.checked;
  }

  return element.value;
}
