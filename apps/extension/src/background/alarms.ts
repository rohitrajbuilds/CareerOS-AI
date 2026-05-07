const SESSION_SYNC_ALARM = 'session-sync';

export function scheduleBackgroundAlarms(): void {
  chrome.alarms.create(SESSION_SYNC_ALARM, { periodInMinutes: 5 });
}

export function registerAlarmHandlers(): void {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === SESSION_SYNC_ALARM) {
      console.debug('CareerOS AI background sync tick');
    }
  });
}
