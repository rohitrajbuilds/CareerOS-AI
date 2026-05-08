import type { HTMLAttributes, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Card({
  children,
  className,
  'data-motion': dataMotion = 'enabled',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>): JSX.Element {
  return (
    <motion.div
      initial={dataMotion === 'disabled' ? false : { opacity: 0, y: 12 }}
      animate={dataMotion === 'disabled' ? undefined : { opacity: 1, y: 0 }}
      transition={dataMotion === 'disabled' ? undefined : { duration: 0.35, ease: 'easeOut' }}
      className={clsx(
        'glass-panel rounded-[var(--radius-card)] p-5 text-[var(--color-text)]',
        className,
      )}
      data-motion={dataMotion}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HeroCard({
  children,
  className,
  'data-motion': dataMotion = 'enabled',
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>): JSX.Element {
  return (
    <motion.div
      initial={dataMotion === 'disabled' ? false : { opacity: 0, y: 18 }}
      animate={dataMotion === 'disabled' ? undefined : { opacity: 1, y: 0 }}
      transition={dataMotion === 'disabled' ? undefined : { duration: 0.45, ease: 'easeOut' }}
      className={clsx(
        'glass-panel-strong rounded-[calc(var(--radius-card)+8px)] p-6 text-[var(--color-text)]',
        className,
      )}
      data-motion={dataMotion}
      {...props}
    >
      {children}
    </motion.div>
  );
}
