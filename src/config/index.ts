import Constants from 'expo-constants';

// API URL comes from app.config.js which reads from .env
// To change: update API_BASE_URL in your .env file
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://pg-api-mobile.onrender.com/api/v1';

export * from './api.config';
