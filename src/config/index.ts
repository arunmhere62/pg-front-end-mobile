// Re-export from centralized environment configuration
import { ENV } from './environment';
export { ENV, getApiUrl, logConfig } from './environment';
export const API_BASE_URL = ENV.API_BASE_URL;

export * from './api.config';
