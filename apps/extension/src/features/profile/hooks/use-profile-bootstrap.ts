import { useEffect } from 'react';
import { useProfileStore } from '../store';

export function useProfileBootstrap(): void {
  const isLoaded = useProfileStore((state) => state.isLoaded);
  const load = useProfileStore((state) => state.load);

  useEffect(() => {
    if (!isLoaded) {
      void load();
    }
  }, [isLoaded, load]);
}
