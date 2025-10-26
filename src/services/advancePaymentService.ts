import axiosInstance from './axiosInstance';

export interface AdvancePayment {
  s_no: number;
  tenant_id: number;
  pg_id: number;
  room_id: number;
  bed_id: number;
  amount_paid: number;
  actual_rent_amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  tenant_unavailable_reason?: 'NOT_FOUND' | 'DELETED' | 'CHECKED_OUT' | 'INACTIVE' | null;
  tenants?: {
    s_no: number;
    tenant_id: string;
    name: string;
    phone_no?: string;
    is_deleted?: boolean;
    status?: string;
    check_out_date?: string;
  };
  rooms?: {
    s_no: number;
    room_no: string;
  };
  beds?: {
    s_no: number;
    bed_no: string;
  };
  pg_locations?: {
    s_no: number;
    location_name: string;
  };
}

export interface CreateAdvancePaymentDto {
  tenant_id: number;
  room_id: number;
  bed_id: number;
  amount_paid: number;
  actual_rent_amount?: number;
  payment_date?: string;
  payment_method: string;
  status?: string;
  remarks?: string;
}

export interface GetAdvancePaymentsParams {
  tenant_id?: number;
  status?: string;
  month?: string;
  year?: number;
  start_date?: string;
  end_date?: string;
  room_id?: number;
  bed_id?: number;
  page?: number;
  limit?: number;
}

export interface AdvancePaymentsResponse {
  success: boolean;
  data: AdvancePayment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Get all advance payments with filters
 */
export const getAdvancePayments = async (
  params: GetAdvancePaymentsParams = {},
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<AdvancePaymentsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.month) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year.toString());
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  if (params.room_id) queryParams.append('room_id', params.room_id.toString());
  if (params.bed_id) queryParams.append('bed_id', params.bed_id.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get(`/advance-payments?${queryParams.toString()}`, {
    headers: requestHeaders,
  });

  return response.data;
};

/**
 * Get advance payments by tenant
 */
export const getAdvancePaymentsByTenant = async (
  tenant_id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
) => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get(`/advance-payments/tenant/${tenant_id}`, {
    headers: requestHeaders,
  });

  return response.data;
};

/**
 * Create new advance payment
 */
export const createAdvancePayment = async (
  data: CreateAdvancePaymentDto,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
) => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.post('/advance-payments', data, {
    headers: requestHeaders,
  });

  return response.data;
};

/**
 * Update advance payment
 */
export const updateAdvancePayment = async (
  id: number,
  data: Partial<CreateAdvancePaymentDto>,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
) => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.patch(`/advance-payments/${id}`, data, {
    headers: requestHeaders,
  });

  return response.data;
};

/**
 * Update advance payment status
 */
export const updateAdvancePaymentStatus = async (
  id: number,
  status: string,
  payment_date?: string,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
) => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.patch(
    `/advance-payments/${id}/status`,
    { status, payment_date },
    { headers: requestHeaders }
  );

  return response.data;
};

/**
 * Delete advance payment
 */
export const deleteAdvancePayment = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
) => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.delete(`/advance-payments/${id}`, {
    headers: requestHeaders,
  });

  return response.data;
};

export default {
  getAdvancePayments,
  getAdvancePaymentsByTenant,
  createAdvancePayment,
  updateAdvancePayment,
  updateAdvancePaymentStatus,
  deleteAdvancePayment,
};
