import { showToast } from '../helpers';

export async function requestNotification() {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    showToast('Notifications are enabled');
  } else if (Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Notifications enabled');
      } else {
        showToast('Notifications denied');
      }
    } catch (err) {
      console.error('Notification request failed', err);
      showToast('Notification error');
    }
  } else if (Notification.permission === 'denied') {
    showToast('Notifications are blocked in your browser');
  }
}
