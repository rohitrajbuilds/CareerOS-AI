import type { HTMLAttributes, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={clsx(
        'glass-panel rounded-[var(--radius-card)] p-5 text-[var(--color-text)]',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HeroCard({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={clsx(
        'glass-panel-strong rounded-[calc(var(--radius-card)+8px)] p-6 text-[var(--color-text)]',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
