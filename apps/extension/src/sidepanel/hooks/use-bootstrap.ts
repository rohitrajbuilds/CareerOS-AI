import { useEffect } from 'react';
import { useBackendHealth, useExtensionSettings } from '@/lib/hooks/use-extension-core';
import { useLiveExtensionSnapshot } from '@/lib/hooks/use-live-extension-snapshot';
import { useExtensionStore } from '../store/use-extension-store';

export function useBootstrap(): void {
  const snapshot = useLiveExtensionSnapshot();
  const settingsQuery = useExtensionSettings();
  const backendHealthQuery = useBackendHealth();

  const setSnapshot = useExtensionStore((state) => state.setSnapshot);
  const setSettings = useExtensionStore((state) => state.setSettings);
  const setBackendHealth = useExtensionStore((state) => state.setBackendHealth);
  const setError = useExtensionStore((state) => state.setError);

  useEffect(() => {
    setSnapshot(snapshot);
  }, [setSnapshot, snapshot]);

  useEffect(() => {
    setSettings(settingsQuery.data);
  }, [setSettings, settingsQuery.data]);

  useEffect(() => {
    setBackendHealth(backendHealthQuery.data);
  }, [backendHealthQuery.data, setBackendHealth]);

  useEffect(() => {
    setError(settingsQuery.error ?? backendHealthQuery.error);
  }, [backendHealthQuery.error, setError, settingsQuery.error]);
}
