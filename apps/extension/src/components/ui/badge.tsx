import type { HTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger';

const toneClasses: Record<BadgeTone, string> = {
  default: 'bg-white/12 text-[var(--color-text-muted)]',
  success: 'bg-emerald-500/14 text-emerald-600 dark:text-emerald-300',
  warning: 'bg-amber-500/14 text-amber-700 dark:text-amber-300',
  danger: 'bg-rose-500/14 text-rose-700 dark:text-rose-300',
};

export function Badge({
  children,
  className,
  tone = 'default',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLSpanElement>> & {
  tone?: BadgeTone;
}): JSX.Element {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
