import type {
  ApplicationAnalytics,
  ApplicationDashboardRecord,
  CompanyResearchResponse,
  ExtensionSettings,
  ExtensionSnapshot,
  HealthResponse,
  JobAnalysisResponse,
} from '@careeros/shared-types';
import type { ExtensionState } from './use-extension-store';

export const selectSnapshot = (state: ExtensionState): ExtensionSnapshot | null => state.snapshot;
export const selectSettings = (state: ExtensionState): ExtensionSettings | null => state.settings;
export const selectBackendHealth = (state: ExtensionState): HealthResponse | null =>
  state.backendHealth;
export const selectGlobalError = (state: ExtensionState): string | null => state.error;

export const selectJobAnalysis = (state: ExtensionState): JobAnalysisResponse | null =>
  state.jobAnalysis;
export const selectJobAnalysisLoading = (state: ExtensionState): boolean =>
  state.jobAnalysisLoading;
export const selectJobAnalysisError = (state: ExtensionState): string | null =>
  state.jobAnalysisError;

export const selectCompanyResearch = (state: ExtensionState): CompanyResearchResponse | null =>
  state.companyResearch;
export const selectCompanyResearchLoading = (state: ExtensionState): boolean =>
  state.companyResearchLoading;
export const selectCompanyResearchError = (state: ExtensionState): string | null =>
  state.companyResearchError;

export const selectApplicationDashboard = (
  state: ExtensionState,
): ApplicationDashboardRecord | null => state.applicationDashboard;
export const selectApplicationAnalytics = (state: ExtensionState): ApplicationAnalytics | null =>
  state.applicationAnalytics;
export const selectApplicationDashboardLoading = (state: ExtensionState): boolean =>
  state.applicationDashboardLoading;
export const selectApplicationDashboardError = (state: ExtensionState): string | null =>
  state.applicationDashboardError;
