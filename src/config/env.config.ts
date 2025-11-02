/**
 * Environment Configuration
 * 
 * Manages environment-specific settings for the app
 */

// Check if running in development mode
export const IS_DEV = __DEV__;

// Check if running in Expo Go (for development)
// Expo Go doesn't support native modules like Firebase
export const IS_EXPO_GO = !!(
  // @ts-ignore
  typeof expo !== 'undefined' && expo?.modules?.ExpoGo
);

// Feature flags
export const FEATURES = {
  // Disable push notifications in dev mode or Expo Go
  PUSH_NOTIFICATIONS_ENABLED: !IS_DEV && !IS_EXPO_GO,
  
  // You can add more feature flags here
  ANALYTICS_ENABLED: !IS_DEV,
  CRASH_REPORTING_ENABLED: !IS_DEV,
};

// Log environment info
console.log('🔧 Environment Configuration:');
console.log('  - IS_DEV:', IS_DEV);
console.log('  - IS_EXPO_GO:', IS_EXPO_GO);
console.log('  - PUSH_NOTIFICATIONS_ENABLED:', FEATURES.PUSH_NOTIFICATIONS_ENABLED);

export default {
  IS_DEV,
  IS_EXPO_GO,
  FEATURES,
};
