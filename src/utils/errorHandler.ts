import { openNetworkLogger } from '../components/NetworkLoggerModal';

/**
 * Global error handler that logs errors and optionally opens network logger
 */
export const handleGlobalError = (error: any, context?: string) => {
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  
  // Log error details
  if (error?.response) {
    console.error('Response Error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
  } else if (error?.request) {
    console.error('Request Error:', error.request);
  } else {
    console.error('Error Message:', error?.message || error);
  }
  
  // Stack trace in development
  if (__DEV__ && error?.stack) {
    console.error('Stack Trace:', error.stack);
  }
};

/**
 * Setup global error handlers
 */
export const setupGlobalErrorHandlers = () => {
  // Log all promise rejections
  const globalAny = global as any;
  
  if (typeof globalAny.ErrorUtils !== 'undefined') {
    const originalErrorHandler = globalAny.ErrorUtils.getGlobalHandler();
    
    globalAny.ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
      console.error('🔴 Global Error Caught:', error, 'Fatal:', isFatal);
      handleGlobalError(error, 'Global Handler');
      
      // Call original handler
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });
  }
  
  console.log('✅ Global error handlers initialized');
};
