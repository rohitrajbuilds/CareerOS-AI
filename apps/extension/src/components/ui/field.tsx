import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

const baseClasses =
  'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background-elevated)] px-4 py-3 text-sm text-[var(--color-text)] shadow-[var(--shadow-soft)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-transparent focus:ring-2 focus:ring-[var(--color-ring)]';

export function Input(props: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return <input {...props} className={clsx(baseClasses, props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>): JSX.Element {
  return <select {...props} className={clsx(baseClasses, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element {
  return <textarea {...props} className={clsx(baseClasses, props.className)} />;
}
