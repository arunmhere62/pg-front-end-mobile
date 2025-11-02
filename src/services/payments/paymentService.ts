import { API_ENDPOINTS } from "@/config";
import axiosInstance from "../core/axiosInstance";
import { Payment } from "@/types";

export const paymentService = {
  // Tenant Payments (Rent)
  getTenantPayments: async (params?: {
    tenant_id?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS, { params });
    return response.data;
  },

  getTenantPaymentById: async (id: number) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}`);
    return response.data;
  },

  getPaymentsByTenant: async (tenant_id: number) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/tenant/${tenant_id}`);
    return response.data;
  },

  createTenantPayment: async (data: Partial<Payment>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS, data);
    return response.data;
  },

  updateTenantPayment: async (id: number, data: Partial<Payment>) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}`, data);
    return response.data;
  },

  updatePaymentStatus: async (id: number, status: string, payment_date?: string) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}/status`, {
      status,
      payment_date,
    });
    return response.data;
  },

  deleteTenantPayment: async (id: number) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS}/${id}`);
    return response.data;
  },

  // Legacy methods for backward compatibility
  getPayments: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS);
    return response.data;
  },

  createPayment: async (data: Partial<Payment>) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS, data);
    return response.data;
  },

  // Advance Payments
  getAdvancePayments: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.ADVANCE_PAYMENTS);
    return response.data;
  },

  // Refund Payments
  getRefundPayments: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.PAYMENTS.REFUND_PAYMENTS);
    return response.data;
  },
};
