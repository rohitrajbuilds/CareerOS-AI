import type { ATSProvider } from '@careeros/shared-types';

export type ProviderDetector = {
  provider: ATSProvider;
  match: (url: URL) => boolean;
};
