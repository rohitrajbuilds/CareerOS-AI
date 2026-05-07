export const workdayAdapter = {
  key: 'workday',
  canHandle: (url: URL) =>
    url.hostname.includes('workday') || url.hostname.includes('myworkdayjobs.com'),
};
