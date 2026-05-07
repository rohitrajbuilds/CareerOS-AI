import type { ExtensionSettings } from '@careeros/shared-types';
import { Button } from './button';

const modes: ExtensionSettings['themeMode'][] = ['light', 'dark', 'system'];

export function ThemeToggle({
  value,
  onChange,
}: {
  value: ExtensionSettings['themeMode'];
  onChange: (value: ExtensionSettings['themeMode']) => void;
}): JSX.Element {
  return (
    <div className="glass-panel inline-flex items-center gap-1 rounded-[var(--radius-pill)] p-1">
      {modes.map((mode) => (
        <Button
          key={mode}
          variant={value === mode ? 'primary' : 'ghost'}
          className="px-3 py-2 text-xs capitalize"
          onClick={() => onChange(mode)}
        >
          {mode}
        </Button>
      ))}
    </div>
  );
}
