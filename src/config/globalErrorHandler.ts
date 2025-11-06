/**
 * Global Error Handler
 * Centralized error handling for all API requests
 */

import { Alert } from 'react-native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { categorizeError, ErrorInfo } from '../utils/errorHandler';

// Global error state
let networkErrorShown = false;
let timeoutErrorShown = false;
let errorResetTimeout: NodeJS.Timeout | null = null;

// Reset error flags after 5 seconds
const resetErrorFlags = () => {
  if (errorResetTimeout) {
    clearTimeout(errorResetTimeout);
  }
  errorResetTimeout = setTimeout(() => {
    networkErrorShown = false;
    timeoutErrorShown = false;
  }, 5000);
};

/**
 * Global error handler for all axios errors
 */
export const handleGlobalAxiosError = (error: AxiosError): Promise<never> => {
  const errorInfo = categorizeError(error);
  
  console.error(`🔴 [${errorInfo.type.toUpperCase()}] Global Error:`, errorInfo.message);

  // Handle different error types
  switch (errorInfo.type) {
    case 'network':
      handleNetworkError(errorInfo);
      break;
    case 'timeout':
      handleTimeoutError(errorInfo);
      break;
    case 'server':
      handleServerError(errorInfo);
      break;
    case 'client':
      handleClientError(errorInfo, error);
      break;
    default:
      handleUnknownError(errorInfo);
  }

  return Promise.reject(error);
};

/**
 * Handle network errors (no internet connection)
 */
const handleNetworkError = (errorInfo: ErrorInfo) => {
  if (!networkErrorShown) {
    networkErrorShown = true;
    
    Alert.alert(
      '📡 No Internet Connection',
      'Please check your network connection and try again.',
      [
        {
          text: 'OK',
          onPress: () => {
            resetErrorFlags();
          },
        },
      ]
    );
  }
};

/**
 * Handle timeout errors
 */
const handleTimeoutError = (errorInfo: ErrorInfo) => {
  if (!timeoutErrorShown) {
    timeoutErrorShown = true;
    
    Alert.alert(
      '⏱️ Request Timeout',
      'The server is taking too long to respond. This might be due to:\n\n• Slow internet connection\n• Server overload\n• Network congestion\n\nPlease try again.',
      [
        {
          text: 'OK',
          onPress: () => {
            resetErrorFlags();
          },
        },
      ]
    );
  }
};

/**
 * Handle server errors (5xx)
 */
const handleServerError = (errorInfo: ErrorInfo) => {
  console.error('🔴 Server Error:', errorInfo.statusCode, errorInfo.message);
  
  // Don't show alert for every server error, just log it
  // Individual components can handle server errors if needed
};

/**
 * Handle client errors (4xx)
 */
const handleClientError = (errorInfo: ErrorInfo, error: AxiosError) => {
  const statusCode = errorInfo.statusCode;
  
  // Handle specific client errors
  switch (statusCode) {
    case 401:
      handleUnauthorizedError();
      break;
    case 403:
      handleForbiddenError();
      break;
    case 404:
      console.warn('⚠️ Resource not found:', error.config?.url);
      break;
    default:
      console.warn('⚠️ Client error:', errorInfo.message);
  }
};

/**
 * Handle 401 Unauthorized errors
 */
const handleUnauthorizedError = () => {
  console.error('🔴 Unauthorized - Token may be expired');
  
  // This will be handled by the auth interceptor in axiosInstance.ts
  // which will attempt to refresh the token
};

/**
 * Handle 403 Forbidden errors
 */
const handleForbiddenError = () => {
  Alert.alert(
    '🚫 Access Denied',
    'You do not have permission to perform this action.',
    [{ text: 'OK' }]
  );
};

/**
 * Handle unknown errors
 */
const handleUnknownError = (errorInfo: ErrorInfo) => {
  console.error('🔴 Unknown error:', errorInfo.message);
};

/**
 * Setup global axios error interceptor
 */
export const setupGlobalErrorInterceptor = () => {
  // Response interceptor for global error handling
  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Only handle errors that don't have a custom error handler
      if (!error.config?.headers?.['X-Skip-Global-Error']) {
        handleGlobalAxiosError(error);
      }
      return Promise.reject(error);
    }
  );

  console.log('✅ Global error interceptor initialized');
};

/**
 * Request interceptor to add metadata
 */
export const setupGlobalRequestInterceptor = () => {
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add request timestamp
      (config as any).metadata = {
        ...((config as any).metadata || {}),
        startTime: Date.now(),
      };
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  console.log('✅ Global request interceptor initialized');
};

/**
 * Initialize all global interceptors
 */
export const initializeGlobalErrorHandling = () => {
  setupGlobalRequestInterceptor();
  setupGlobalErrorInterceptor();
  
  console.log('✅ Global error handling initialized');
};
