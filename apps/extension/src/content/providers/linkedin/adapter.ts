export const linkedinAdapter = {
  key: 'linkedin',
  canHandle: (url: URL) => url.hostname.includes('linkedin.com'),
};
