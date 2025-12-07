import axiosInstance from '../core/axiosInstance';
import { extractResponseData, isApiResponseSuccess } from '../../utils/apiResponseHandler';

export interface State {
  s_no: number;
  name: string;
  iso_code: string;
}

export interface City {
  s_no: number;
  name: string;
  state_code?: string;
}

export interface LocationResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
}

/**
 * Location Service
 * Handles fetching states and cities data
 */
export const locationService = {
  /**
   * Get all states for a country
   */
  async getStates(countryCode: string = 'IN'): Promise<LocationResponse<State>> {
    try {
      const response = await axiosInstance.get('/location/states', {
        params: { countryCode },
      });

      const data = extractResponseData(response.data) as any;
      const statesData = Array.isArray(data) ? data : (data?.data || []);

      return {
        success: isApiResponseSuccess(response.data),
        data: statesData,
        message: response.data?.message || 'States fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching states:', error);
      return {
        success: false,
        data: [],
        message: error?.response?.data?.message || 'Failed to fetch states',
      };
    }
  },

  /**
   * Get cities for a specific state
   */
  async getCities(stateCode: string): Promise<LocationResponse<City>> {
    try {
      const response = await axiosInstance.get('/location/cities', {
        params: { stateCode },
      });

      const data = extractResponseData(response.data) as any;
      const citiesData = Array.isArray(data) ? data : (data?.data || []);

      return {
        success: isApiResponseSuccess(response.data),
        data: citiesData,
        message: response.data?.message || 'Cities fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching cities:', error);
      return {
        success: false,
        data: [],
        message: error?.response?.data?.message || 'Failed to fetch cities',
      };
    }
  },
};
