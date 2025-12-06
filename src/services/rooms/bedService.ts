import axiosInstance from '../core/axiosInstance';
import { extractResponseData, isApiResponseSuccess } from '../../utils/apiResponseHandler';

export interface Bed {
  s_no: number;
  bed_no: string;
  room_id: number;
  pg_id?: number;
  is_occupied: boolean;
  bed_price?: number;
  images?: any;
  created_at?: string;
  updated_at?: string;
  rooms?: {
    s_no: number;
    room_no: string;
    pg_locations?: {
      s_no: number;
      location_name: string;
    };
  };
  tenants?: Array<{
    s_no: number;
    name: string;
    phone_no: string;
    status: string;
  }>;
}

export interface CreateBedDto {
  room_id: number;
  bed_no: string;
  pg_id?: number;
  bed_price?: number;
  images?: any;
}

export interface GetBedsParams {
  page?: number;
  limit?: number;
  room_id?: number;
  search?: string;
}

export interface GetBedsResponse {
  success: boolean;
  data: Bed[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface BedResponse {
  success: boolean;
  data: Bed;
  message?: string;
}

/**
 * Get all beds with filters
 */
export const getAllBeds = async (
  params: GetBedsParams = {},
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<GetBedsResponse> => {
  const { page = 1, limit = 100, room_id, search } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (room_id) queryParams.append('room_id', room_id.toString());
  if (search) queryParams.append('search', search);

  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<GetBedsResponse>(`/beds?${queryParams.toString()}`, {
    headers: requestHeaders,
  });

  const data = extractResponseData(response.data) as any;
  return {
    success: isApiResponseSuccess(response.data),
    data: Array.isArray(data) ? data : (data?.data || []),
    pagination: data?.pagination || undefined,
  };
};

/**
 * Get beds by room ID
 */
export const getBedsByRoomId = async (
  roomId: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<GetBedsResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<GetBedsResponse>(`/beds/room/${roomId}`, {
    headers: requestHeaders,
  });

  const data = extractResponseData(response.data) as any;
  return {
    success: isApiResponseSuccess(response.data),
    data: Array.isArray(data) ? data : (data?.data || []),
    pagination: data?.pagination || undefined,
  };
};

/**
 * Get bed by ID
 */
export const getBedById = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<BedResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<BedResponse>(`/beds/${id}`, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    data: extractResponseData(response.data),
    message: response.data?.message || 'Success',
  };
};

/**
 * Create a new bed
 */
export const createBed = async (
  data: CreateBedDto,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<BedResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.post<BedResponse>('/beds', data, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    data: extractResponseData(response.data),
    message: response.data?.message || 'Success',
  };
};

/**
 * Update a bed
 */
export const updateBed = async (
  id: number,
  data: Partial<CreateBedDto>,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<BedResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.patch<BedResponse>(`/beds/${id}`, data, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    data: extractResponseData(response.data),
    message: response.data?.message || 'Success',
  };
};

/**
 * Delete a bed
 */
export const deleteBed = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<{ success: boolean; message: string }> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/beds/${id}`, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    message: response.data?.message || 'Success',
  };
};
