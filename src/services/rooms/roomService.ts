import axiosInstance from '../core/axiosInstance';
import { extractResponseData, isApiResponseSuccess } from '../../utils/apiResponseHandler';

export interface Room {
  s_no: number;
  room_id?: string;
  pg_id: number;
  room_no: string;
  images?: any;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  pg_locations?: {
    s_no: number;
    location_name: string;
  };
  beds?: Array<{
    s_no: number;
    bed_no: string;
    bed_price?: number;
  }>;
  total_beds?: number;
}

export interface CreateRoomDto {
  pg_id: number;
  room_no: string;
  images?: any;
}

export interface GetRoomsParams {
  page?: number;
  limit?: number;
  pg_id?: number;
  search?: string;
}

export interface GetRoomsResponse {
  success: boolean;
  data: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface RoomResponse {
  success: boolean;
  message?: string;
  data: Room;
}

/**
 * Get all rooms with filters
 */
export const getAllRooms = async (
  params: GetRoomsParams = {},
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<GetRoomsResponse> => {
  const { page = 1, limit = 100, pg_id, search } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append('search', search);

  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<GetRoomsResponse>(`/rooms?${queryParams.toString()}`, {
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
 * Get room by ID
 */
export const getRoomById = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<RoomResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<RoomResponse>(`/rooms/${id}`, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    data: extractResponseData(response.data),
    message: response.data?.message || 'Success',
  };
};

/**
 * Create a new room
 */
export const createRoom = async (
  data: CreateRoomDto,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<RoomResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.post<RoomResponse>('/rooms', data, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    data: extractResponseData(response.data),
    message: response.data?.message || 'Success',
  };
};

/**
 * Update a room
 */
export const updateRoom = async (
  id: number,
  data: Partial<CreateRoomDto>,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<RoomResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.patch<RoomResponse>(`/rooms/${id}`, data, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    data: extractResponseData(response.data),
    message: response.data?.message || 'Success',
  };
};

/**
 * Delete a room
 */
export const deleteRoom = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<{ success: boolean; message: string }> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/rooms/${id}`, {
    headers: requestHeaders,
  });

  return {
    success: isApiResponseSuccess(response.data),
    message: response.data?.message || 'Success',
  };
};
