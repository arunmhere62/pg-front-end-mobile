import { API_ENDPOINTS } from "@/config";
import axiosInstance from "../core/axiosInstance";
import { Payment } from "@/types";
import { extractResponseData, isApiResponseSuccess } from "../../utils/apiResponseHandler";

export const paymentService = {
  // Tenant Payments (Rent)
  getTenantPayments: async (params?: {
    tenant_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS, { params });
    const data = extractResponseData(response.data) as any;
    return {
      success: isApiResponseSuccess(response.data),
      data: Array.isArray(data) ? data : (data?.data || []),
      pagination: data?.pagination || undefined,
    };
  },

  getTenantPaymentById: async (id: number) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}`);
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  getPaymentsByTenant: async (tenant_id: number) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/tenant/${tenant_id}`);
    const data = extractResponseData(response.data) as any;
    return {
      success: isApiResponseSuccess(response.data),
      data: Array.isArray(data) ? data : (data?.data || []),
    };
  },

  createTenantPayment: async (data: Partial<Payment>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS, data);
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  updateTenantPayment: async (id: number, data: Partial<Payment>) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}`, data);
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  updatePaymentStatus: async (id: number, status: string, payment_date?: string) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}/status`, {
      status,
      payment_date,
    });
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  deleteTenantPayment: async (id: number) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}`);
    return {
      success: isApiResponseSuccess(response.data),
      message: response.data?.message || 'Success',
    };
  },

  // Legacy methods for backward compatibility
  getPayments: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS);
    const data = extractResponseData(response.data) as any;
    return {
      success: isApiResponseSuccess(response.data),
      data: Array.isArray(data) ? data : (data?.data || []),
    };
  },

  createPayment: async (data: Partial<Payment>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS, data);
    return {
      success: isApiResponseSuccess(response.data),
      data: extractResponseData(response.data),
      message: response.data?.message || 'Success',
    };
  },

  // Advance Payments
  getAdvancePayments: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.ADVANCE_PAYMENTS);
    const data = extractResponseData(response.data) as any;
    return {
      success: isApiResponseSuccess(response.data),
      data: Array.isArray(data) ? data : (data?.data || []),
    };
  },

  // Refund Payments
  getRefundPayments: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.REFUND_PAYMENTS);
    const data = extractResponseData(response.data) as any;
    return {
      success: isApiResponseSuccess(response.data),
      data: Array.isArray(data) ? data : (data?.data || []),
    };
  },
};
