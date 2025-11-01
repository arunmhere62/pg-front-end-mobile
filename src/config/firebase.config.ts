/**
 * Firebase Configuration
 * 
 * Configuration for Firebase Cloud Messaging (FCM) for push notifications
 */

export const FIREBASE_CONFIG = {
  // Your Firebase project configuration
  // Get this from Firebase Console > Project Settings > General > Your apps
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API key
  authDomain: "indianpgmanagement.firebaseapp.com",
  projectId: "indianpgmanagement",
  storageBucket: "indianpgmanagement.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your sender ID
  appId: "YOUR_APP_ID", // Replace with your app ID
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Firebase Cloud Messaging configuration
export const FCM_CONFIG = {
  // Notification channels for Android
  channels: {
    default: {
      id: 'default',
      name: 'Default Notifications',
      importance: 4, // High importance
      sound: 'default',
    },
    rentReminders: {
      id: 'rent_reminders',
      name: 'Rent Reminders',
      importance: 4,
      sound: 'default',
    },
    payments: {
      id: 'payments',
      name: 'Payment Notifications',
      importance: 5, // Max importance
      sound: 'default',
    },
    alerts: {
      id: 'alerts',
      name: 'Important Alerts',
      importance: 5,
      sound: 'default',
    },
  },
  
  // Notification types
  types: {
    RENT_REMINDER: 'RENT_REMINDER',
    OVERDUE_ALERT: 'OVERDUE_ALERT',
    PAYMENT_CONFIRMATION: 'PAYMENT_CONFIRMATION',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAYMENT_DUE_SOON: 'PAYMENT_DUE_SOON',
    PAYMENT_OVERDUE: 'PAYMENT_OVERDUE',
    PARTIAL_PAYMENT: 'PARTIAL_PAYMENT',
    FULL_PAYMENT: 'FULL_PAYMENT',
    TENANT_CHECKIN: 'TENANT_CHECKIN',
    TENANT_CHECKOUT: 'TENANT_CHECKOUT',
    MAINTENANCE_REQUEST: 'MAINTENANCE_REQUEST',
    GENERAL: 'GENERAL',
  },
};

export default FIREBASE_CONFIG;
