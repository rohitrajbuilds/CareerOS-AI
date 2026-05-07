import type {
  CompanyResearchRequest,
  CompanyResearchResponse,
  HealthResponse,
  JobAnalysisRequest,
  JobAnalysisResponse,
} from '@careeros/shared-types';
import { apiRequest } from './http-client';

export const extensionApi = {
  health(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>({ path: '/extension/health', method: 'GET' });
  },
  analyzeJob(payload: JobAnalysisRequest): Promise<JobAnalysisResponse> {
    return apiRequest<JobAnalysisResponse>({
      path: '/jobs/analyze',
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  researchCompany(payload: CompanyResearchRequest): Promise<CompanyResearchResponse> {
    return apiRequest<CompanyResearchResponse>({
      path: '/ai/company-research',
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
