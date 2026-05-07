import type {
  ApplicationAnalytics,
  ApplicationDashboardRecord,
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
  applicationDashboard: ApplicationDashboardRecord | null;
  applicationAnalytics: ApplicationAnalytics | null;
  applicationDashboardLoading: boolean;
  applicationDashboardError: string | null;
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
  setApplicationDashboard: (dashboard: ApplicationDashboardRecord | null) => void;
  setApplicationAnalytics: (analytics: ApplicationAnalytics | null) => void;
  setApplicationDashboardLoading: (loading: boolean) => void;
  setApplicationDashboardError: (error: string | null) => void;
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
  applicationDashboard: null,
  applicationAnalytics: null,
  applicationDashboardLoading: false,
  applicationDashboardError: null,
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
  setApplicationDashboard: (applicationDashboard) => set({ applicationDashboard }),
  setApplicationAnalytics: (applicationAnalytics) => set({ applicationAnalytics }),
  setApplicationDashboardLoading: (applicationDashboardLoading) =>
    set({ applicationDashboardLoading }),
  setApplicationDashboardError: (applicationDashboardError) => set({ applicationDashboardError }),
  setError: (error) => set({ error }),
}));
