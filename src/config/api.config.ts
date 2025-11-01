export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'http://172.20.10.2:5000/api/v1',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
  TENANTS: {
    LIST: '/tenants',
    CREATE: '/tenants',
    UPDATE: (id: number) => `/tenants/${id}`,
    DELETE: (id: number) => `/tenants/${id}`,
    DETAILS: (id: number) => `/tenants/${id}`,
  },
  PG_LOCATIONS: {
    BASE: '/pg-locations',
    LIST: '/pg-locations',
    CREATE: '/pg-locations',
    UPDATE: (id: number) => `/pg-locations/${id}`,
    DELETE: (id: number) => `/pg-locations/${id}`,
    FINANCIAL_ANALYTICS: (id: number, months?: number) => 
      `/pg-locations/${id}/financial-analytics${months ? `?months=${months}` : ''}`,
    TENANT_RENT_STATUS: (id: number) => `/pg-locations/${id}/tenant-rent-status`,
  },
  ROOMS: {
    LIST: '/rooms',
    CREATE: '/rooms',
    UPDATE: (id: number) => `/rooms/${id}`,
    DELETE: (id: number) => `/rooms/${id}`,
  },
  BEDS: {
    LIST: '/beds',
    CREATE: '/beds',
    UPDATE: (id: number) => `/beds/${id}`,
    DELETE: (id: number) => `/beds/${id}`,
  },
  PAYMENTS: {
    TENANT_PAYMENTS: '/tenant-payments',
    ADVANCE_PAYMENTS: '/advance-payments',
    REFUND_PAYMENTS: '/refund-payments',
  },
  EXPENSES: {
    LIST: '/expenses',
    CREATE: '/expenses',
  },
  VISITORS: {
    LIST: '/visitors',
    CREATE: '/visitors',
  },
};
