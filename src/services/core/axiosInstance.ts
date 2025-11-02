import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { store } from '../../store';
import { networkLogger } from '../../utils/networkLogger';

const needsPgHeader = (url?: string) => {
  if (!url) return false;
  const path = (url.split('?')[0] || '').toString();
  return /^\/(tenants|rooms|beds|advance-payments|refund-payments|payments|pending-payments)(\/|$)/.test(path);
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth headers and log requests
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const { user, accessToken } = state.auth;

    // Add Authorization header
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add User ID header
    if (user?.s_no) {
      config.headers['X-User-Id'] = user.s_no.toString();
    }

    // Add Organization ID header
    if (user?.organization_id) {
      config.headers['X-Organization-Id'] = user.organization_id.toString();
    }

    // Add PG Location ID header
    const selectedPGLocationId = state.pgLocations.selectedPGLocationId;
    if (selectedPGLocationId) {
      config.headers['X-PG-Location-Id'] = selectedPGLocationId.toString();
    }

    const hasPgHeader = Boolean(
      (config.headers as any)['X-PG-Location-Id'] || (config.headers as any)['x-pg-location-id']
    );
    if (needsPgHeader(config.url) && !hasPgHeader) {
      return Promise.reject(new Error('Missing required headers: X-PG-Location-Id'));
    }

    // Store request start time and log ID
    const logId = `${Date.now()}-${Math.random()}`;
    (config as any).metadata = { 
      startTime: Date.now(),
      logId,
    };

    // Convert headers to plain object
    const headersObj = JSON.parse(JSON.stringify(config.headers || {}));
    
    // Add to network logger
    networkLogger.addLog({
      id: logId,
      method: config.method?.toUpperCase() || 'GET',
      url: `${config.baseURL}${config.url}`,
      headers: headersObj,
      requestData: config.data,
      timestamp: new Date(),
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Log responses
axiosInstance.interceptors.response.use(
  (response) => {
    // Update network logger with response
    const metadata = (response.config as any).metadata;
    if (metadata) {
      const duration = Date.now() - metadata.startTime;
      
   
      networkLogger.updateLog(metadata.logId, {
        status: response.status,
        responseData: response.data,
        duration,
      });
      
    } 
    return response;
  },
  (error) => {
    // Update network logger with error
    const metadata = (error.config as any)?.metadata;
    if (metadata) {
      const duration = Date.now() - metadata.startTime;
      
      networkLogger.updateLog(metadata.logId, {
        status: error.response?.status,
        responseData: error.response?.data,
        error: error.message,
        duration,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

