import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { Tenant } from '../types';

export const tenantService = {
  getTenants: async () => {
    const response = await apiClient.get(API_ENDPOINTS.TENANTS.LIST);
    return response.data;
  },

  getTenantById: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.TENANTS.DETAILS(id));
    return response.data;
  },

  createTenant: async (data: Partial<Tenant>) => {
    const response = await apiClient.post(API_ENDPOINTS.TENANTS.CREATE, data);
    return response.data;
  },

  updateTenant: async (id: number, data: Partial<Tenant>) => {
    const response = await apiClient.put(API_ENDPOINTS.TENANTS.UPDATE(id), data);
    return response.data;
  },

  deleteTenant: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.TENANTS.DELETE(id));
    return response.data;
  },
};
