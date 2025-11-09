import Constants from 'expo-constants';

// API URL comes from app.config.js which reads from .env
// To change: update API_BASE_URL in your .env file
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://172.20.10.2:3000/api/v1';

export * from './api.config';
