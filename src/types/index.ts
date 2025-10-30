export interface User {
  s_no: number;
  name: string;
  email: string;
  phone?: string;
  role_id: number;
  role_name?: string;
  organization_id: number;
  organization_name?: string;
  pg_id?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  address?: string;
  city_id?: number;
  state_id?: number;
  gender?: 'MALE' | 'FEMALE';
  profile_images?: any;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Tenant {
  s_no: number;
  tenant_id: string;
  name: string;
  phone_no?: string;
  whatsapp_number?: string;
  email?: string;
  pg_id?: number;
  room_id?: number;
  bed_id?: number;
  check_in_date: string;
  check_out_date?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  occupation?: string;
  tenant_address?: string;
  images?: any;
  proof_documents?: any;
}

export interface PGLocation {
  s_no: number;
  location_name: string;
  address: string;
  pincode?: string;
  city_id?: number;
  state_id?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  images?: any;
  organization_id: number;
}

export interface Room {
  s_no: number;
  room_id?: string;
  pg_id?: number;
  room_no?: string;
  rent_price?: number;
  images?: any;
}

export interface Bed {
  s_no: number;
  bed_no: string;
  room_id?: number;
  pg_id?: number;
  images?: any;
}

export interface Payment {
  s_no: number;
  tenant_id: number;
  pg_id: number;
  room_id: number;
  bed_id: number;
  amount_paid: number;
  payment_date?: string;
  payment_method: 'GPAY' | 'PHONEPE' | 'CASH' | 'BANK_TRANSFER';
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  remarks?: string;
  actual_rent_amount: number;
  start_date?: string;
  end_date?: string;
  current_bill?: number;
  current_bill_id?: number;
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
    room_no?: string;
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

export interface Expense {
  s_no: number;
  pg_id?: number;
  expense_type?: string;
  amount?: number;
  paid_to?: string;
  paid_date?: string;
  payment_method?: 'GPAY' | 'PHONEPE' | 'CASH' | 'BANK_TRANSFER';
  remarks?: string;
}

export interface Visitor {
  s_no: number;
  pg_id?: number;
  visitor_name?: string;
  phone_no?: string;
  purpose?: string;
  visited_date?: string;
  visited_room_id?: number;
  visited_bed_id?: number;
  address?: string;
  convertedTo_tenant: boolean;
}
