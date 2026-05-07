export const greenhouseAdapter = {
  key: 'greenhouse',
  canHandle: (url: URL) => url.hostname.includes('greenhouse.io'),
};
