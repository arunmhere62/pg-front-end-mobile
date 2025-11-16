import axiosInstance from '../core/axiosInstance';

export interface CurrentBill {
  s_no: number;
  tenant_id: number;
  pg_id: number;
  bill_amount: number;
  bill_date: string;
  created_at: string;
  updated_at: string;
  is_deleted?: boolean;
  tenants?: {
    s_no: number;
    tenant_id: string;
    name: string;
    phone_no?: string;
  };
  pg_locations?: {
    s_no: number;
    location_name: string;
  };
}

export interface CreateCurrentBillDto {
  tenant_id?: number;
  room_id?: number;
  pg_id?: number;
  bill_amount: number;
  bill_date?: string;
  split_equally?: boolean;
  remarks?: string;
}

export interface UpdateCurrentBillDto {
  bill_amount?: number;
  bill_date?: string;
  remarks?: string;
}

export interface CurrentBillResponse {
  success: boolean;
  message?: string;
  data: CurrentBill | CurrentBill[];
}

export interface CurrentBillsListResponse {
  success: boolean;
  data: CurrentBill[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Create a current bill
 * Supports two modes:
 * 1. Split bill for a room: provide room_id with split_equally=true
 * 2. Individual bill for a tenant: provide tenant_id
 */
export const createCurrentBill = async (
  data: CreateCurrentBillDto,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<CurrentBillResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.post<CurrentBillResponse>('/current-bills', data, {
    headers: requestHeaders,
  });

  return response.data;
};

/**
 * Get all current bills with filters
 */
export const getCurrentBills = async (
  params: {
    tenant_id?: number;
    room_id?: number;
    month?: string;
    year?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  } = {},
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<CurrentBillsListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id.toString());
  if (params.room_id) queryParams.append('room_id', params.room_id.toString());
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year.toString());
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<CurrentBillsListResponse>(
    `/current-bills?${queryParams.toString()}`,
    { headers: requestHeaders }
  );

  return response.data;
};

/**
 * Get current bills for a specific month and year
 */
export const getCurrentBillsByMonth = async (
  month: number,
  year: number,
  tenant_id?: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<CurrentBillResponse> => {
  const queryParams = new URLSearchParams();
  if (tenant_id) queryParams.append('tenant_id', tenant_id.toString());

  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<CurrentBillResponse>(
    `/current-bills/by-month/${month}/${year}?${queryParams.toString()}`,
    { headers: requestHeaders }
  );

  return response.data;
};

/**
 * Get a single current bill by ID
 */
export const getCurrentBillById = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<CurrentBillResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get<CurrentBillResponse>(`/current-bills/${id}`, {
    headers: requestHeaders,
  });

  return response.data;
};

/**
 * Update a current bill
 */
export const updateCurrentBill = async (
  id: number,
  data: UpdateCurrentBillDto,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<CurrentBillResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.patch<CurrentBillResponse>(`/current-bills/${id}`, data, {
    headers: requestHeaders,
  });

  return response.data;
};

/**
 * Delete a current bill
 */
export const deleteCurrentBill = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<{ success: boolean; message: string }> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.delete<{ success: boolean; message: string }>(
    `/current-bills/${id}`,
    { headers: requestHeaders }
  );

  return response.data;
};
