import axiosInstance from '../core/axiosInstance';
import { API_ENDPOINTS } from '../../config/api.config';
import { PGLocation } from '../../types';
import { extractResponseData, isApiResponseSuccess } from '../../utils/apiResponseHandler';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const pgLocationService = {
  getPGLocations: async () => {
    // Add timestamp to prevent caching
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PG_LOCATIONS.LIST}?_t=${Date.now()}`
    );
    // Extract data from new response structure
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  createPGLocation: async (data: Partial<PGLocation>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PG_LOCATIONS.CREATE, data);
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  updatePGLocation: async (id: number, data: Partial<PGLocation>) => {
    const response = await axiosInstance.put(API_ENDPOINTS.PG_LOCATIONS.UPDATE(id), data);
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  deletePGLocation: async (id: number) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.PG_LOCATIONS.DELETE(id));
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  getDetails: async (pgId: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.PG_LOCATIONS.DETAILS(pgId)
    );
    
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  getSummary: async (pgId: number) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.PG_LOCATIONS.SUMMARY(pgId)
    );
    
    // Extract the nested data structure
    const extractedData = extractResponseData(response.data) as any;
    const summaryData = extractedData?.data || extractedData;
    
    return {
      success: isApiResponseSuccess(response.data),
      data: summaryData,
      message: response.data?.message || 'Success',
    };
  },

  getFinancialAnalytics: async (pgId: number, months: number = 6) => {
    const response = await axiosInstance.get(
      API_ENDPOINTS.PG_LOCATIONS.FINANCIAL_ANALYTICS(pgId, months)
    );
    
    // Extract the nested data structure
    const extractedData = extractResponseData(response.data) as any;
    const financialData = extractedData?.data || extractedData;
    
    return {
      success: isApiResponseSuccess(response.data),
      data: financialData,
      message: response.data?.message || 'Success',
    };
  },

};
