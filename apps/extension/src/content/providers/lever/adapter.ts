export const leverAdapter = {
  key: 'lever',
  canHandle: (url: URL) => url.hostname.includes('lever.co'),
};
