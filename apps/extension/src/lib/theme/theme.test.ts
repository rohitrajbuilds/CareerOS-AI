import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { applyTheme } from './theme';

describe('applyTheme', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
    delete document.documentElement.dataset.theme;
  });

  it('applies explicit theme mode', () => {
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('resolves system theme mode from media query', () => {
    applyTheme('system');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
