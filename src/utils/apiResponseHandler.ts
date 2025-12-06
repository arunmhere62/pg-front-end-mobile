/**
 * API Response Handler
 * Handles the new centralized response structure from backend
 * 
 * Response Structure:
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "...",
 *   "data": { ... },
 *   "timestamp": "...",
 *   "path": "..."
 * }
 */

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

/**
 * Extract data from API response
 * Handles both old and new response formats
 */
export const extractResponseData = <T>(response: any): T => {
  // If response has the new structure with success, statusCode, etc.
  if (response && typeof response === 'object' && 'success' in response && 'statusCode' in response) {
    return response.data as T;
  }
  
  // Fallback for old structure
  return response as T;
};

/**
 * Check if API response is successful
 */
export const isApiResponseSuccess = (response: any): boolean => {
  if (response && typeof response === 'object' && 'success' in response) {
    return response.success === true;
  }
  return true; // Assume success for old format
};

/**
 * Get error message from API response
 */
export const getApiErrorMessage = (response: any): string => {
  if (response && typeof response === 'object') {
    if ('message' in response) {
      return response.message;
    }
    if ('error' in response && response.error?.message) {
      return response.error.message;
    }
  }
  return 'An error occurred';
};

/**
 * Handle paginated response
 */
export const extractPaginatedData = <T>(response: any): { data: T[]; pagination?: any } => {
  const data = extractResponseData(response);
  
  if (data && typeof data === 'object') {
    if ('data' in data && 'pagination' in data) {
      // New paginated format
      return {
        data: data.data as T[],
        pagination: data.pagination,
      };
    }
    if (Array.isArray(data)) {
      // Old array format
      return {
        data: data as T[],
      };
    }
  }
  
  return {
    data: Array.isArray(data) ? data : [],
  };
};

/**
 * Transform API response for frontend use
 */
export const transformApiResponse = <T>(response: ApiResponse<T>): T | null => {
  if (!response) return null;
  
  if (!isApiResponseSuccess(response)) {
    const errorMessage = getApiErrorMessage(response);
    throw new Error(errorMessage);
  }
  
  return extractResponseData(response);
};
