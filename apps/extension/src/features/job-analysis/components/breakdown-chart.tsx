import type { JobAnalysisBreakdown } from '@careeros/shared-types';

type BreakdownChartProps = {
  breakdown: JobAnalysisBreakdown;
};

const breakdownMeta: Array<{
  key: keyof JobAnalysisBreakdown;
  label: string;
  color: string;
}> = [
  { key: 'skillCoverage', label: 'Skill coverage', color: 'bg-[var(--color-primary)]' },
  { key: 'requirementCoverage', label: 'Requirement coverage', color: 'bg-emerald-500' },
  { key: 'keywordAlignment', label: 'Keyword alignment', color: 'bg-sky-500' },
  { key: 'experienceAlignment', label: 'Experience alignment', color: 'bg-amber-500' },
  { key: 'educationAlignment', label: 'Education alignment', color: 'bg-fuchsia-500' },
];

export function BreakdownChart({ breakdown }: BreakdownChartProps): JSX.Element {
  return (
    <div className="grid gap-4">
      {breakdownMeta.map((item) => {
        const value = breakdown[item.key];
        return (
          <div key={item.key} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-[var(--color-text-muted)]">{value}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--color-border)]/70">
              <div
                className={`h-full rounded-full ${item.color} transition-[width] duration-700 ease-out`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
