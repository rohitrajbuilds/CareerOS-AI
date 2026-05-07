import type { ExtensionSettings, SiteContext, TabSession } from '@careeros/shared-types';

export type StorageAreaName = 'local' | 'session';

export type StorageSchema = {
  settings: ExtensionSettings;
  activeTabId: number | null;
  lastSyncAt: string;
  tabSessions: Record<string, TabSession>;
  siteContexts: Record<string, SiteContext>;
};

export const defaultExtensionSettings: ExtensionSettings = {
  extensionEnabled: true,
  autoOpenSidePanel: false,
  debugMode: false,
};

export const storageDefaults: StorageSchema = {
  settings: defaultExtensionSettings,
  activeTabId: null,
  lastSyncAt: new Date(0).toISOString(),
  tabSessions: {},
  siteContexts: {},
};
