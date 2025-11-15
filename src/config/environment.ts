import Constants from 'expo-constants';

/**
 * Environment Configuration
 * Single source of truth for all environment variables
 * All values come from app.config.js which reads from .env file
 */

interface AppConfig {
  apiBaseUrl?: string;
  subscriptionMode?: boolean;
  showDevBanner?: boolean;
}

const appConfig = Constants.expoConfig?.extra as AppConfig || {};

// Validate required configuration
const validateConfig = () => {
  if (!appConfig.apiBaseUrl) {
    console.error('❌ Missing required configuration:');
    console.error('- API_BASE_URL not found in app config');
    console.error('- Check your .env file and app.config.js');
    console.error('- Current app config:', appConfig);
    throw new Error('API_BASE_URL is not configured. Please check your .env file.');
  }
};

// Validate on import
validateConfig();

/**
 * Environment Variables
 * All configuration should be accessed through these exports
 */
export const ENV = {
  // API Configuration
  API_BASE_URL: appConfig.apiBaseUrl!,
  
  // App Configuration  
  SUBSCRIPTION_MODE: appConfig.subscriptionMode ?? true,
  SHOW_DEV_BANNER: appConfig.showDevBanner ?? false,
  
  // Environment Detection
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,
} as const;

/**
 * Configuration Utilities
 */
export const getApiUrl = (endpoint: string = '') => {
  return `${ENV.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const logConfig = () => {
  console.log('🔧 App Configuration:');
  console.log('- API Base URL:', ENV.API_BASE_URL);
  console.log('- Subscription Mode:', ENV.SUBSCRIPTION_MODE);
  console.log('- Show Dev Banner:', ENV.SHOW_DEV_BANNER);
  console.log('- Environment:', ENV.IS_DEV ? 'Development' : 'Production');
};

// Log configuration in development
if (__DEV__) {
  logConfig();
}
