import type { ExtensionSettings, ExtensionSnapshot, HealthResponse } from '@careeros/shared-types';
import { create } from 'zustand';

type ExtensionState = {
  snapshot: ExtensionSnapshot | null;
  settings: ExtensionSettings | null;
  backendHealth: HealthResponse | null;
  error: string | null;
  setSnapshot: (snapshot: ExtensionSnapshot | null) => void;
  setSettings: (settings: ExtensionSettings | null) => void;
  setBackendHealth: (health: HealthResponse | null) => void;
  setError: (error: string | null) => void;
};

export const useExtensionStore = create<ExtensionState>((set) => ({
  snapshot: null,
  settings: null,
  backendHealth: null,
  error: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  setSettings: (settings) => set({ settings }),
  setBackendHealth: (backendHealth) => set({ backendHealth }),
  setError: (error) => set({ error }),
}));
