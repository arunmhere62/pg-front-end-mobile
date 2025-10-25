import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api.config';
import { PGLocation } from '../types';

export const pgLocationService = {
  getPGLocations: async () => {
    // Add timestamp to prevent caching
    const response = await axiosInstance.get(
      `${API_ENDPOINTS.PG_LOCATIONS.LIST}?_t=${Date.now()}`
    );
    return response.data;
  },

  createPGLocation: async (data: Partial<PGLocation>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PG_LOCATIONS.CREATE, data);
    return response.data;
  },

  updatePGLocation: async (id: number, data: Partial<PGLocation>) => {
    const response = await axiosInstance.put(API_ENDPOINTS.PG_LOCATIONS.UPDATE(id), data);
    return response.data;
  },

  deletePGLocation: async (id: number) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.PG_LOCATIONS.DELETE(id));
    return response.data;
  },
};
