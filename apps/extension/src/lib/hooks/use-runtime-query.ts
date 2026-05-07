import { useCallback, useEffect, useState } from 'react';

export function useRuntimeQuery<TData>(
  queryFn: () => Promise<TData>,
): {
  data: TData | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const next = await queryFn();
      setData(next);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unknown runtime query error');
    } finally {
      setIsLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    error,
    isLoading,
    refresh,
  };
}
