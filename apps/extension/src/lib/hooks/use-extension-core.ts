import type {
  ExtensionSettings,
  ExtensionSnapshot,
  HealthResponse,
  JobPageContext,
  RuntimeResult,
} from '@careeros/shared-types';
import { useCallback } from 'react';
import { extensionApi } from '@/lib/api-client/extension-api';
import {
  assertRuntimeResult,
  sendRuntimeMessage,
} from '@/lib/message-bus/runtime';
import type {
  ExtensionSnapshotResponse,
  JobAnalysisContextRuntimeResponse,
  OpenSidePanelResponse,
  SettingsResponse,
  UpdateSettingsResponse,
} from '@/lib/schema/messages';
import { MessageType } from '@/lib/schema/message-types';
import { useRuntimeQuery } from './use-runtime-query';

async function unwrapRuntimeResult<TData>(promise: Promise<RuntimeResult<TData>>): Promise<TData> {
  const result = await promise;
  assertRuntimeResult(result);
  return result.data;
}

export function useExtensionSnapshot() {
  return useRuntimeQuery<ExtensionSnapshot>(() =>
    unwrapRuntimeResult(
      sendRuntimeMessage<ExtensionSnapshotResponse>({
        type: MessageType.GetExtensionSnapshot,
      }),
    ),
  );
}

export function useExtensionSettings() {
  return useRuntimeQuery<ExtensionSettings>(() =>
    unwrapRuntimeResult(
      sendRuntimeMessage<SettingsResponse>({
        type: MessageType.GetSettings,
      }),
    ),
  );
}

export function useBackendHealth() {
  return useRuntimeQuery<HealthResponse>(() => extensionApi.health());
}

export function useExtensionActions() {
  const openSidePanel = useCallback(async (): Promise<void> => {
    await unwrapRuntimeResult(
      sendRuntimeMessage<OpenSidePanelResponse>({
        type: MessageType.OpenSidePanel,
      }),
    );
  }, []);

  const refreshActiveTab = useCallback(async (): Promise<void> => {
    await unwrapRuntimeResult(
      sendRuntimeMessage<RuntimeResult<{ refreshed: true }>>({
        type: MessageType.RefreshActiveTab,
      }),
    );
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<ExtensionSettings>): Promise<ExtensionSettings> =>
      unwrapRuntimeResult(
        sendRuntimeMessage<UpdateSettingsResponse>({
          type: MessageType.UpdateSettings,
          payload: patch,
        }),
      ),
    [],
  );

  const getCurrentJobContext = useCallback(
    async (): Promise<JobPageContext> => {
      const response = await unwrapRuntimeResult(
        sendRuntimeMessage<JobAnalysisContextRuntimeResponse>({
          type: MessageType.RequestJobAnalysisContext,
        }),
      );
      return response.jobContext;
    },
    [],
  );

  return {
    openSidePanel,
    refreshActiveTab,
    updateSettings,
    getCurrentJobContext,
  };
}
