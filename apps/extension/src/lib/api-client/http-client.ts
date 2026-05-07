import { getRuntimeConfig } from '@careeros/shared-config';

type RequestOptions = RequestInit & {
  path: string;
};

const API_REQUEST_TIMEOUT_MS = 15_000;

function withRequestTimeout(signal?: AbortSignal): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(API_REQUEST_TIMEOUT_MS);

  if (!signal) {
    return timeoutSignal;
  }

  const controller = new AbortController();
  const abort = () => controller.abort();

  signal.addEventListener('abort', abort, { once: true });
  timeoutSignal.addEventListener('abort', abort, { once: true });
  return controller.signal;
}

export async function apiRequest<TResponse>({ path, ...init }: RequestOptions): Promise<TResponse> {
  const { apiBaseUrl } = getRuntimeConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    signal: withRequestTimeout(init.signal),
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
