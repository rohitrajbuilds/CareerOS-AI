import { getRuntimeConfig } from '@careeros/shared-config';

type RequestOptions = RequestInit & {
  path: string;
};

export async function apiRequest<TResponse>({ path, ...init }: RequestOptions): Promise<TResponse> {
  const { apiBaseUrl } = getRuntimeConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TResponse>;
}
