import type {
  ExtensionSettings,
  ExtensionSnapshot,
  HealthResponse,
  JobAnalysisResponse,
} from '@careeros/shared-types';
import { create } from 'zustand';

type ExtensionState = {
  snapshot: ExtensionSnapshot | null;
  settings: ExtensionSettings | null;
  backendHealth: HealthResponse | null;
  jobAnalysis: JobAnalysisResponse | null;
  jobAnalysisLoading: boolean;
  jobAnalysisError: string | null;
  error: string | null;
  setSnapshot: (snapshot: ExtensionSnapshot | null) => void;
  setSettings: (settings: ExtensionSettings | null) => void;
  setBackendHealth: (health: HealthResponse | null) => void;
  setJobAnalysis: (analysis: JobAnalysisResponse | null) => void;
  setJobAnalysisLoading: (loading: boolean) => void;
  setJobAnalysisError: (error: string | null) => void;
  setError: (error: string | null) => void;
};

export const useExtensionStore = create<ExtensionState>((set) => ({
  snapshot: null,
  settings: null,
  backendHealth: null,
  jobAnalysis: null,
  jobAnalysisLoading: false,
  jobAnalysisError: null,
  error: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  setSettings: (settings) => set({ settings }),
  setBackendHealth: (backendHealth) => set({ backendHealth }),
  setJobAnalysis: (jobAnalysis) => set({ jobAnalysis }),
  setJobAnalysisLoading: (jobAnalysisLoading) => set({ jobAnalysisLoading }),
  setJobAnalysisError: (jobAnalysisError) => set({ jobAnalysisError }),
  setError: (error) => set({ error }),
}));
