import { registerAlarmHandlers, scheduleBackgroundAlarms } from './alarms';
import { registerMessageRouter } from './router';

chrome.runtime.onInstalled.addListener(() => {
  scheduleBackgroundAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleBackgroundAlarms();
});

registerAlarmHandlers();
registerMessageRouter();
