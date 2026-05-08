export const SUPPORTED_URL_PATTERNS = [
  '*://*.workday.com/*',
  '*://*.myworkdayjobs.com/*',
  '*://*.linkedin.com/*',
  '*://*.greenhouse.io/*',
  '*://*.lever.co/*',
  'https://docs.google.com/forms/*',
] as const;

export const CONTENT_SCRIPT_FILE = 'content/content.js';
