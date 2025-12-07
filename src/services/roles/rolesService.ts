import axiosInstance from '../core/axiosInstance';
import { extractResponseData, isApiResponseSuccess } from '../../utils/apiResponseHandler';

export interface Role {
  s_no: number;
  role_name: string;
  status?: string;
  permissions?: Record<string, any>;
  _count?: {
    users: number;
  };
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  message?: string;
}

/**
 * Roles Service
 * Handles fetching roles data
 */
export const rolesService = {
  /**
   * Get all roles
   */
  async getRoles(): Promise<RolesResponse> {
    try {
      const response = await axiosInstance.get('/auth/roles');

      const data = extractResponseData(response.data) as any;
      const rolesData = Array.isArray(data) ? data : (data?.data || []);

      return {
        success: isApiResponseSuccess(response.data),
        data: rolesData,
        message: response.data?.message || 'Roles fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      return {
        success: false,
        data: [],
        message: error?.response?.data?.message || 'Failed to fetch roles',
      };
    }
  },

  /**
   * Get role by ID
   */
  async getRoleById(id: number): Promise<{ success: boolean; data: Role | null; message?: string }> {
    try {
      const response = await axiosInstance.get(`/auth/roles/${id}`);

      const data = extractResponseData(response.data);

      return {
        success: isApiResponseSuccess(response.data),
        data: data as Role,
        message: response.data?.message || 'Role fetched successfully',
      };
    } catch (error: any) {
      console.error('Error fetching role:', error);
      return {
        success: false,
        data: null,
        message: error?.response?.data?.message || 'Failed to fetch role',
      };
    }
  },
};
