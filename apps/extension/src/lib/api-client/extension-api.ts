import type { HealthResponse } from '@careeros/shared-types';
import { apiRequest } from './http-client';

export const extensionApi = {
  health(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>({ path: '/extension/health', method: 'GET' });
  },
};
