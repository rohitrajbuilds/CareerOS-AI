import { useEffect } from 'react';
import { extensionApi } from '@/lib/api-client/extension-api';
import { useExtensionStore } from '../store/use-extension-store';

export function useBootstrap(): void {
  const setBackendHealth = useExtensionStore((state) => state.setBackendHealth);

  useEffect(() => {
    extensionApi
      .health()
      .then((health) => setBackendHealth(health))
      .catch(() => setBackendHealth(null));
  }, [setBackendHealth]);
}
