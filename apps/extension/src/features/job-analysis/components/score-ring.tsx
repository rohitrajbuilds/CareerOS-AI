type ScoreRingProps = {
  label: string;
  score: number;
  tone?: 'primary' | 'success' | 'warning';
};

const toneClasses: Record<NonNullable<ScoreRingProps['tone']>, string> = {
  primary: 'stroke-[var(--color-primary)]',
  success: 'stroke-emerald-500',
  warning: 'stroke-amber-500',
};

export function ScoreRing({ label, score, tone = 'primary' }: ScoreRingProps): JSX.Element {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-[var(--color-border)] bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-[var(--color-border)]"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`${toneClasses[tone]} transition-[stroke-dashoffset] duration-700 ease-out`}
            strokeWidth="10"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <p className="text-3xl font-semibold">{score}</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              score
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
    </div>
  );
}
