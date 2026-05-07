import type { ExtensionSettings } from '@careeros/shared-types';
import { useEffect } from 'react';
import { useStorageValue } from '@/lib/hooks/use-storage-value';

function resolveThemeMode(mode: ExtensionSettings['themeMode']): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applyTheme(mode: ExtensionSettings['themeMode']): void {
  const resolvedMode = resolveThemeMode(mode);
  document.documentElement.dataset.theme = resolvedMode;
}

export function useThemeSync(): void {
  const settings = useStorageValue('settings', 'local');

  useEffect(() => {
    applyTheme(settings?.themeMode ?? 'system');
  }, [settings?.themeMode]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme(settings?.themeMode ?? 'system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [settings?.themeMode]);
}
