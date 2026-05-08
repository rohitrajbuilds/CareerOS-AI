import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    motionDisabled?: boolean;
  }
>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[linear-gradient(135deg,var(--color-primary),var(--color-accent))] text-[var(--color-primary-foreground)] shadow-[0_14px_32px_rgba(15,98,254,0.22)]',
  secondary:
    'glass-panel text-[var(--color-text)] shadow-[var(--shadow-soft)]',
  ghost: 'bg-transparent text-[var(--color-text-muted)] hover:bg-white/10',
};

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  motionDisabled = false,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <motion.button
      whileHover={motionDisabled ? undefined : { y: -1, scale: 1.01 }}
      whileTap={motionDisabled ? undefined : { scale: 0.99 }}
      type={type}
      className={clsx(
        'inline-flex items-center justify-center rounded-[var(--radius-pill)] px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
