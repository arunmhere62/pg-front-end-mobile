/**
 * Notification Service
 * 
 * Handles Firebase Cloud Messaging (FCM) for push notifications
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { FCM_CONFIG } from '../config/firebase.config';
import { apiClient } from './apiClient';

export interface NotificationData {
  type: string;
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private fcmToken: string | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;
  private unsubscribeOnNotificationOpen: (() => void) | null = null;

  /**
   * Initialize notification service
   */
  async initialize(userId: number) {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('❌ Notification permission denied');
        return false;
      }

      // Setup Android notification channels
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      // Get FCM token
      const token = await this.getFCMToken();
      if (!token) {
        console.log('❌ Failed to get FCM token');
        return false;
      }

      // Register token with backend
      await this.registerToken(userId, token);

      // Setup notification listeners
      this.setupNotificationListeners();

      // Handle background messages
      this.setupBackgroundMessageHandler();

      console.log('✅ Notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ Notification permission not granted');
        return false;
      }

      console.log('✅ Notification permission granted');
      return true;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Setup Android notification channels
   */
  private async setupAndroidChannels() {
    const channels = Object.values(FCM_CONFIG.channels);
    
    for (const channel of channels) {
      await notifee.createChannel({
        id: channel.id,
        name: channel.name,
        importance: channel.importance as AndroidImportance,
        sound: channel.sound,
        vibration: true,
        lights: true,
        lightColor: '#3B82F6',
      });
    }
    console.log('✅ Android notification channels created');
  }

  /**
   * Get FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // Get Firebase Cloud Messaging token
      const token = await messaging().getToken();

      this.fcmToken = token;
      console.log('📱 FCM Token:', this.fcmToken);
      return this.fcmToken;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerToken(userId: number, token: string) {
    try {
      const deviceInfo = {
        user_id: userId,
        fcm_token: token,
        device_type: Platform.OS,
        device_id: 'device-' + Math.random().toString(36).substring(7),
        device_name: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
      };

      await apiClient.post('/notifications/register-token', deviceInfo);
      console.log('✅ FCM token registered with backend');
    } catch (error) {
      console.error('❌ Failed to register FCM token:', error);
      throw error;
    }
  }

  /**
   * Setup notification listeners
   */
  private setupNotificationListeners() {
    // Listener for foreground messages
    this.unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('🔔 Foreground notification received:', remoteMessage);
      await this.displayNotification(remoteMessage);
    });

    // Listener for notification opened app from background/quit state
    this.unsubscribeOnNotificationOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('👆 Notification opened app from background:', remoteMessage);
      this.handleNotificationTapped(remoteMessage);
    });

    // Check if app was opened from a notification (quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('👆 Notification opened app from quit state:', remoteMessage);
          this.handleNotificationTapped(remoteMessage);
        }
      });

    // Notifee foreground event handler
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('👆 User pressed notification:', detail.notification);
      }
    });
  }

  /**
   * Display notification in foreground
   */
  private async displayNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
    const { notification, data } = remoteMessage;
    
    if (!notification) return;

    // Determine channel based on notification type
    const channelId = this.getChannelId(data?.type as string | undefined);

    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      data: data,
      android: {
        channelId,
        smallIcon: 'ic_notification',
        color: '#3B82F6',
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
    });

    // Update badge count
    this.updateBadgeCount();
  }

  /**
   * Handle notification tapped
   */
  private handleNotificationTapped(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
    const { data } = remoteMessage;
    
    // Navigate to appropriate screen based on notification type
    if (data?.type) {
      this.navigateToScreen(data.type as string, data);
    }
  }

  /**
   * Setup background message handler
   */
  private setupBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('🔔 Background notification received:', remoteMessage);
      // Background notifications are automatically displayed by FCM
    });
  }

  /**
   * Get channel ID based on notification type
   */
  private getChannelId(type?: string): string {
    if (!type) return FCM_CONFIG.channels.default.id;

    switch (type) {
      case FCM_CONFIG.types.RENT_REMINDER:
      case FCM_CONFIG.types.PAYMENT_DUE_SOON:
        return FCM_CONFIG.channels.rentReminders.id;
      case FCM_CONFIG.types.PAYMENT_CONFIRMATION:
      case FCM_CONFIG.types.PARTIAL_PAYMENT:
      case FCM_CONFIG.types.FULL_PAYMENT:
        return FCM_CONFIG.channels.payments.id;
      case FCM_CONFIG.types.OVERDUE_ALERT:
      case FCM_CONFIG.types.PAYMENT_OVERDUE:
        return FCM_CONFIG.channels.alerts.id;
      default:
        return FCM_CONFIG.channels.default.id;
    }
  }

  /**
   * Navigate to screen based on notification type
   */
  private navigateToScreen(type: string, data: any) {
    // This will be implemented with navigation reference
    console.log('Navigate to:', type, data);
    
    // Example navigation logic:
    // switch (type) {
    //   case FCM_CONFIG.types.RENT_REMINDER:
    //     navigation.navigate('TenantDetails', { tenantId: data.tenant_id });
    //     break;
    //   case FCM_CONFIG.types.PAYMENT_CONFIRMATION:
    //     navigation.navigate('Payments');
    //     break;
    //   // ... other cases
    // }
  }

  /**
   * Update badge count
   */
  async updateBadgeCount() {
    try {
      const count = await this.getUnreadNotificationCount();
      await notifee.setBadgeCount(count);
    } catch (error) {
      console.error('❌ Failed to update badge count:', error);
    }
  }

  /**
   * Get unread notification count from backend
   */
  async getUnreadNotificationCount(): Promise<number> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(page = 1, limit = 20) {
    try {
      const response = await apiClient.get('/notifications/history', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get notification history:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number) {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await apiClient.put('/notifications/read-all');
      await notifee.setBadgeCount(0);
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: any) {
    try {
      await apiClient.put('/notifications/settings', settings);
      console.log('✅ Notification settings updated');
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Get notification settings
   */
  async getSettings() {
    try {
      const response = await apiClient.get('/notifications/settings');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get settings:', error);
      throw error;
    }
  }

  /**
   * Unregister token (on logout)
   */
  async unregisterToken() {
    try {
      if (this.fcmToken) {
        await apiClient.delete('/notifications/unregister-token', {
          data: { fcm_token: this.fcmToken },
        });
        this.fcmToken = null;
        console.log('✅ FCM token unregistered');
      }
    } catch (error) {
      console.error('❌ Failed to unregister token:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
    }
    if (this.unsubscribeOnNotificationOpen) {
      this.unsubscribeOnNotificationOpen();
    }
  }

  /**
   * Send local notification (for testing)
   */
  async sendLocalNotification(title: string, body: string, data?: any) {
    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId: FCM_CONFIG.channels.default.id,
        smallIcon: 'ic_notification',
        color: '#3B82F6',
      },
      ios: {
        sound: 'default',
      },
    });
  }
}

export default new NotificationService();
