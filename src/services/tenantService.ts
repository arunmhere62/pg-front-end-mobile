import axiosInstance from './axiosInstance';

export interface TenantStatus {
  ACTIVE: 'ACTIVE';
  INACTIVE: 'INACTIVE';
}

export interface TenantPayment {
  s_no: number;
  payment_date: string;
  amount_paid: number;
  actual_rent_amount?: number;
  start_date?: string;
  end_date?: string;
  payment_method?: string;
  remarks?: string;
}

export interface AdvancePayment {
  s_no: number;
  payment_date: string;
  amount_paid: number;
  actual_rent_amount?: number;
  payment_method?: string;
  remarks?: string;
}

export interface RefundPayment {
  s_no: number;
  amount_paid: number;
  payment_method?: string;
  payment_date: string;
  remarks?: string;
  actual_rent_amount?: number;
}

export interface PendingPaymentMonth {
  month: string;
  year: number;
  expected_amount: number;
  paid_amount: number;
  balance: number;
  due_date: string;
  is_overdue: boolean;
}

export interface PendingPayment {
  tenant_id: number;
  tenant_name: string;
  room_no?: string;
  total_pending: number;
  current_month_pending: number;
  overdue_months: number;
  payment_status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  last_payment_date?: string;
  next_due_date?: string;
  monthly_rent: number;
  pending_months: PendingPaymentMonth[];
}

export interface Tenant {
  s_no: number;
  tenant_id: string;
  name: string;
  phone_no?: string;
  whatsapp_number?: string;
  email?: string;
  pg_id: number;
  room_id?: number;
  bed_id?: number;
  check_in_date: string;
  check_out_date?: string;
  status: 'ACTIVE' | 'INACTIVE';
  occupation?: string;
  tenant_address?: string;
  city_id?: number;
  state_id?: number;
  images?: any;
  proof_documents?: any;
  created_at: string;
  updated_at: string;
  pg_locations?: {
    s_no: number;
    location_name: string;
    address: string;
  };
  rooms?: {
    s_no: number;
    room_no: string;
    rent_price?: number;
  };
  beds?: {
    s_no: number;
    bed_no: string;
  };
  city?: {
    s_no: number;
    name: string;
  };
  state?: {
    s_no: number;
    name: string;
  };
  tenant_payments?: TenantPayment[];
  advance_payments?: AdvancePayment[];
  refund_payments?: RefundPayment[];
  pending_payment?: PendingPayment | null;
}

export interface CreateTenantDto {
  name: string;
  phone_no?: string;
  whatsapp_number?: string;
  email?: string;
  pg_id: number;
  room_id?: number;
  bed_id?: number;
  check_in_date: string;
  check_out_date?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  occupation?: string;
  tenant_address?: string;
  city_id?: number;
  state_id?: number;
  images?: any;
  proof_documents?: any;
}

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  pg_id?: number;
  room_id?: number;
  organization_id?: number;
  user_id?: number;
  pending_rent?: boolean;
  pending_advance?: boolean;
}

export interface GetTenantsResponse {
  success: boolean;
  data: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface TenantResponse {
  success: boolean;
  message?: string;
  data: Tenant;
}

/**
 * Get all tenants with filters
 */
export const getAllTenants = async (
  params: GetTenantsParams = {}
): Promise<GetTenantsResponse> => {
  const { page = 1, limit = 10, status, search, pg_id, room_id, organization_id, user_id, pending_rent, pending_advance } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);
  if (room_id) queryParams.append('room_id', room_id.toString());
  if (pending_rent) queryParams.append('pending_rent', 'true');
  if (pending_advance) queryParams.append('pending_advance', 'true');

  // Set common headers
  const headers: any = {};
  if (pg_id) headers['X-PG-Location-Id'] = pg_id.toString();
  if (organization_id) headers['X-Organization-Id'] = organization_id.toString();
  if (user_id) headers['X-User-Id'] = user_id.toString();

  const url = `/tenants?${queryParams.toString()}`;
  console.log('📡 API Request:', { url, headers, room_id });

  const response = await axiosInstance.get(url, { headers });
  console.log('📥 API Response:', { total: response.data.data?.length, pagination: response.data.pagination });
  
  return response.data;
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<TenantResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.get(`/tenants/${id}`, { headers: requestHeaders });
  return response.data;
};

/**
 * Create new tenant
 */
export const createTenant = async (
  data: CreateTenantDto,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<TenantResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.post('/tenants', data, { headers: requestHeaders });
  return response.data;
};

/**
 * Update tenant
 */
export const updateTenant = async (
  id: number,
  data: Partial<CreateTenantDto>,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<TenantResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.put(`/tenants/${id}`, data, { headers: requestHeaders });
  return response.data;
};

/**
 * Delete tenant (soft delete)
 */
export const deleteTenant = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<{ success: boolean; message: string }> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.delete(`/tenants/${id}`, { headers: requestHeaders });
  return response.data;
};

/**
 * Check out tenant
 */
export const checkoutTenant = async (
  id: number,
  headers?: { pg_id?: number; organization_id?: number; user_id?: number }
): Promise<TenantResponse> => {
  const requestHeaders: any = {};
  if (headers?.pg_id) requestHeaders['X-PG-Location-Id'] = headers.pg_id.toString();
  if (headers?.organization_id) requestHeaders['X-Organization-Id'] = headers.organization_id.toString();
  if (headers?.user_id) requestHeaders['X-User-Id'] = headers.user_id.toString();

  const response = await axiosInstance.post(`/tenants/${id}/checkout`, {}, { headers: requestHeaders });
  return response.data;
};
