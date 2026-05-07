export type RuntimeConfig = {
  apiBaseUrl: string;
  appEnv: string;
};

export function getRuntimeConfig(): RuntimeConfig {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
    appEnv: import.meta.env.VITE_APP_ENV ?? 'development',
  };
}
