import { registerAlarmHandlers, scheduleBackgroundAlarms } from './alarms';
import { registerLifecycleHandlers } from './lifecycle';
import { registerMessageRouter } from './router';

chrome.runtime.onInstalled.addListener(() => {
  scheduleBackgroundAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleBackgroundAlarms();
});

registerAlarmHandlers();
registerLifecycleHandlers();
registerMessageRouter();
