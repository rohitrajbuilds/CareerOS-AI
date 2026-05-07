import type {
  CompanyResearchResponse,
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
  companyResearch: CompanyResearchResponse | null;
  companyResearchLoading: boolean;
  companyResearchError: string | null;
  error: string | null;
  setSnapshot: (snapshot: ExtensionSnapshot | null) => void;
  setSettings: (settings: ExtensionSettings | null) => void;
  setBackendHealth: (health: HealthResponse | null) => void;
  setJobAnalysis: (analysis: JobAnalysisResponse | null) => void;
  setJobAnalysisLoading: (loading: boolean) => void;
  setJobAnalysisError: (error: string | null) => void;
  setCompanyResearch: (research: CompanyResearchResponse | null) => void;
  setCompanyResearchLoading: (loading: boolean) => void;
  setCompanyResearchError: (error: string | null) => void;
  setError: (error: string | null) => void;
};

export const useExtensionStore = create<ExtensionState>((set) => ({
  snapshot: null,
  settings: null,
  backendHealth: null,
  jobAnalysis: null,
  jobAnalysisLoading: false,
  jobAnalysisError: null,
  companyResearch: null,
  companyResearchLoading: false,
  companyResearchError: null,
  error: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  setSettings: (settings) => set({ settings }),
  setBackendHealth: (backendHealth) => set({ backendHealth }),
  setJobAnalysis: (jobAnalysis) => set({ jobAnalysis }),
  setJobAnalysisLoading: (jobAnalysisLoading) => set({ jobAnalysisLoading }),
  setJobAnalysisError: (jobAnalysisError) => set({ jobAnalysisError }),
  setCompanyResearch: (companyResearch) => set({ companyResearch }),
  setCompanyResearchLoading: (companyResearchLoading) => set({ companyResearchLoading }),
  setCompanyResearchError: (companyResearchError) => set({ companyResearchError }),
  setError: (error) => set({ error }),
}));
