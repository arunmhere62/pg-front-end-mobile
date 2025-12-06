import { ApiError } from '../components/ErrorAlert/ErrorAlert';

/**
 * Error code mappings for user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 4xx Errors
  'ERR_001': 'Invalid request. Please check your input.',
  'ERR_002': 'Resource not found.',
  'ERR_003': 'Unauthorized. Please log in again.',
  'ERR_004': 'Forbidden. You do not have permission.',
  'ERR_005': 'This resource already exists.',
  'ERR_006': 'Validation failed. Please check your input.',
  'ERR_007': 'Too many requests. Please try again later.',

  // 5xx Errors
  'ERR_500': 'Server error. Please try again later.',
  'ERR_501': 'Service unavailable. Please try again later.',

  // Network Errors
  'NETWORK_ERROR': 'Network error. Please check your connection.',
  'TIMEOUT': 'Request timeout. Please try again.',
  'UNKNOWN_ERROR': 'An unexpected error occurred.',

  // Specific Errors
  'ALREADY_EXISTS': 'This record already exists.',
  'RESOURCE_NOT_FOUND': 'The requested resource was not found.',
  'VALIDATION_ERROR': 'Validation failed. Please check your input.',
  'UNAUTHORIZED': 'You are not authorized to perform this action.',
  'FORBIDDEN': 'You do not have permission to access this resource.',
  'CONFLICT': 'There is a conflict with the current state.',
  'DATABASE_ERROR': 'Database error occurred. Please try again.',
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: ApiError | any): string => {
  // If it's already an ApiError with a message
  if (error?.message) {
    return error.message;
  }

  // Try to get from error code
  if (error?.error?.code) {
    return ERROR_MESSAGES[error.error.code] || error.error.code;
  }

  // Default message based on status code
  const statusCode = error?.statusCode || error?.response?.status;
  if (statusCode === 401) return 'Please log in to continue.';
  if (statusCode === 403) return 'You do not have permission.';
  if (statusCode === 404) return 'The requested resource was not found.';
  if (statusCode === 409) return 'There is a conflict with the current state.';
  if (statusCode >= 500) return 'Server error. Please try again later.';
  if (statusCode >= 400) return 'Invalid request. Please try again.';

  return 'An unexpected error occurred.';
};

/**
 * Get error title based on status code
 */
export const getErrorTitle = (statusCode: number): string => {
  if (statusCode === 400) return 'Bad Request';
  if (statusCode === 401) return 'Unauthorized';
  if (statusCode === 403) return 'Forbidden';
  if (statusCode === 404) return 'Not Found';
  if (statusCode === 409) return 'Conflict';
  if (statusCode === 422) return 'Validation Error';
  if (statusCode === 429) return 'Too Many Requests';
  if (statusCode >= 500) return 'Server Error';
  return 'Error';
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: ApiError | any): boolean => {
  const statusCode = error?.statusCode || error?.response?.status;
  
  // Retryable status codes
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  
  // Network errors are retryable
  if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error') {
    return true;
  }

  return retryableStatuses.includes(statusCode);
};

/**
 * Format error details for logging
 */
export const formatErrorForLogging = (error: ApiError | any): string => {
  const details = {
    message: error?.message,
    statusCode: error?.statusCode || error?.response?.status,
    errorCode: error?.error?.code,
    path: error?.path,
    timestamp: error?.timestamp,
  };

  return JSON.stringify(details, null, 2);
};

/**
 * Extract field-specific validation errors
 */
export const getValidationErrors = (error: ApiError | any): Record<string, string> => {
  if (!error?.error?.details) {
    return {};
  }

  const details = error.error.details;
  
  // If details is an array (common for validation errors)
  if (Array.isArray(details)) {
    const fieldErrors: Record<string, string> = {};
    details.forEach((err: any) => {
      if (err.field) {
        fieldErrors[err.field] = err.message;
      }
    });
    return fieldErrors;
  }

  // If details is an object
  if (typeof details === 'object') {
    return details;
  }

  return {};
};
