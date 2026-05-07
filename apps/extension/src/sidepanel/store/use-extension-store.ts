import type { HealthResponse, SiteContext } from '@careeros/shared-types';
import { create } from 'zustand';

type ExtensionState = {
  siteContext: SiteContext | null;
  backendHealth: HealthResponse | null;
  setSiteContext: (siteContext: SiteContext | null) => void;
  setBackendHealth: (health: HealthResponse | null) => void;
};

export const useExtensionStore = create<ExtensionState>((set) => ({
  siteContext: null,
  backendHealth: null,
  setSiteContext: (siteContext) => set({ siteContext }),
  setBackendHealth: (backendHealth) => set({ backendHealth }),
}));
