
import OneSignal from 'react-onesignal';
import api from './api';

class NotificationService {
  constructor() {
    this.initialized = false;
    this.audio = new Audio("/sounds/notification.wav");
  }

  async initialize(userId) {
    if (this.initialized) return;

    try {
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      if (!appId || appId === 'YOUR_ONESIGNAL_APP_ID') {
        console.warn("OneSignal App ID is missing. Notifications will be disabled.");
        return;
      }

      console.log("OneSignal: Initializing for user", userId);
      
      await OneSignal.init({
        appId: appId,
        safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false,
        },
        serviceWorkerParam: { scope: "/" },
        serviceWorkerPath: "OneSignalSDKWorker.js",
      });

      this.initialized = true;

      // Request permission
      if (OneSignal.Notifications.permissionNative !== 'granted') {
        console.log("OneSignal: Requesting permission...");
        await OneSignal.Notifications.requestPermission();
      }

      // Login the user to OneSignal using their Database ID
      if (userId) {
        await OneSignal.login(userId);
        console.log("OneSignal: Logged in with UserID", userId);
      }

      // Handle notification display/reception
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
        console.log("OneSignal: Foreground notification received", event);
        this.playSound();
      });

      // Handle click
      OneSignal.Notifications.addEventListener('click', (event) => {
        console.log("OneSignal: Notification clicked", event);
        const orderId = event.notification.additionalData?.orderId;
        if (orderId) {
          window.location.href = `/orders/${orderId}`;
        } else {
          window.location.href = "/orders";
        }
      });

    } catch (error) {
      console.error("Error initializing OneSignal:", error);
    }
  }

  playSound() {
    this.audio.play().catch(err => console.warn("Could not play sound:", err));
  }

  // API Methods
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  }

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }

  async testNotification() {
    const response = await api.post('/notifications/test');
    return response.data;
  }
}

export const notificationService = new NotificationService();
