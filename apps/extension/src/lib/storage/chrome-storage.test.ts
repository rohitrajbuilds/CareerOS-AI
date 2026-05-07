import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addStorageChangeListener,
  getFromStorage,
  patchInStorage,
  setInStorage,
} from './chrome-storage';

type Listener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string,
) => void;

describe('chrome storage wrapper', () => {
  const localState = new Map<string, unknown>();
  const sessionState = new Map<string, unknown>();
  let listeners = new Set<Listener>();

  beforeEach(() => {
    localState.clear();
    sessionState.clear();
    listeners = new Set<Listener>();

    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({ [key]: localState.get(key) })),
          set: vi.fn(async (value: Record<string, unknown>) => {
            Object.entries(value).forEach(([key, entry]) => localState.set(key, entry));
          }),
        },
        session: {
          get: vi.fn(async (key: string) => ({ [key]: sessionState.get(key) })),
          set: vi.fn(async (value: Record<string, unknown>) => {
            Object.entries(value).forEach(([key, entry]) => sessionState.set(key, entry));
          }),
        },
        onChanged: {
          addListener: vi.fn((listener: Listener) => listeners.add(listener)),
          removeListener: vi.fn((listener: Listener) => listeners.delete(listener)),
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns defaults when storage key is missing', async () => {
    const settings = await getFromStorage('settings', 'local');

    expect(settings.extensionEnabled).toBe(true);
    expect(settings.themeMode).toBe('system');
  });

  it('sets and patches local storage values', async () => {
    await setInStorage('settings', {
      extensionEnabled: false,
      autoOpenSidePanel: true,
      debugMode: false,
      themeMode: 'dark',
    });

    const next = await patchInStorage('settings', { debugMode: true });

    expect(next).toEqual({
      extensionEnabled: false,
      autoOpenSidePanel: true,
      debugMode: true,
      themeMode: 'dark',
    });
  });

  it('subscribes and unsubscribes to storage change events', () => {
    const callback = vi.fn();
    const unsubscribe = addStorageChangeListener(callback);

    const [listener] = [...listeners];
    if (!listener) {
      throw new Error('Expected a storage listener to be registered.');
    }
    listener(
      {
        settings: {
          oldValue: undefined,
          newValue: { themeMode: 'light' },
        },
      },
      'local',
    );

    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(listeners.size).toBe(0);
  });
});
