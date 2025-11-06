import Constants from 'expo-constants';

export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://pg-api-mobile.onrender.com/api/v1';

export * from './api.config';
