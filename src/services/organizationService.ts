import axiosInstance from './axiosInstance';

export interface OrganizationAdmin {
  s_no: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  created_at: string;
}

export interface PGLocationRoom {
  s_no: number;
  room_no: string;
  beds_count: number;
}

export interface PGLocationDetail {
  s_no: number;
  location_name: string;
  address: string;
  status: string;
  rooms_count: number;
  beds_count: number;
  rooms: PGLocationRoom[];
}

export interface Organization {
  s_no: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  admins: OrganizationAdmin[];
  pg_locations_count: number;
  pg_locations: PGLocationDetail[];
}

export interface OrganizationStats {
  totalOrganizations: number;
  activeOrganizations: number;
  inactiveOrganizations: number;
  totalUsers: number;
  totalPGLocations: number;
  totalTenants: number;
  totalRevenue: number;
  recentOrganizations: number;
}

export interface GetOrganizationsParams {
  page?: number;
  limit?: number;
}

export interface GetOrganizationsResponse {
  success: boolean;
  data: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface GetOrganizationStatsResponse {
  success: boolean;
  data: OrganizationStats;
}

/**
 * Get all organizations with admin details (SuperAdmin only)
 */
export const getAllOrganizations = async (
  params: GetOrganizationsParams = {}
): Promise<GetOrganizationsResponse> => {
  const { page = 1, limit = 10 } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await axiosInstance.get(
    `/organizations?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Get organization statistics (SuperAdmin only)
 */
export const getOrganizationStats = async (): Promise<GetOrganizationStatsResponse> => {
  const response = await axiosInstance.get('/organizations/stats');
  return response.data;
};

/**
 * Get organization details by ID (SuperAdmin only)
 */
export const getOrganizationById = async (id: number) => {
  const response = await axiosInstance.get(`/organizations/${id}`);
  return response.data;
};
