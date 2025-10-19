import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { PGLocation } from '../types';

export const pgLocationService = {
  getPGLocations: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PG_LOCATIONS.LIST);
    return response.data;
  },

  createPGLocation: async (data: Partial<PGLocation>) => {
    const response = await apiClient.post(API_ENDPOINTS.PG_LOCATIONS.CREATE, data);
    return response.data;
  },

  updatePGLocation: async (id: number, data: Partial<PGLocation>) => {
    const response = await apiClient.put(API_ENDPOINTS.PG_LOCATIONS.UPDATE(id), data);
    return response.data;
  },

  deletePGLocation: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.PG_LOCATIONS.DELETE(id));
    return response.data;
  },
};
