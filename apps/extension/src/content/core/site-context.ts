import type { ATSProvider, SiteContext } from '@careeros/shared-types';

export function detectProvider(url: URL): ATSProvider {
  if (url.hostname.includes('linkedin.com')) {
    return 'linkedin';
  }

  if (url.hostname.includes('greenhouse.io')) {
    return 'greenhouse';
  }

  if (url.hostname.includes('lever.co')) {
    return 'lever';
  }

  if (url.hostname.includes('workday') || url.hostname.includes('myworkdayjobs.com')) {
    return 'workday';
  }

  return 'unknown';
}

export function getSiteContext(): SiteContext {
  const url = new URL(window.location.href);

  return {
    provider: detectProvider(url),
    url: url.toString(),
    title: document.title,
    hostname: url.hostname,
  };
}
