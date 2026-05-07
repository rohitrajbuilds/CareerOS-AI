export type ATSProvider = 'workday' | 'linkedin' | 'greenhouse' | 'lever' | 'unknown';

export type SiteContext = {
  provider: ATSProvider;
  url: string;
  title: string;
};

export type FormField = {
  id: string;
  label: string;
  type: string;
  required: boolean;
};

export type AutofillResult = {
  filledCount: number;
  unresolved: string[];
};

export type HealthResponse = {
  status: 'ok';
  service: string;
  environment: string;
};
