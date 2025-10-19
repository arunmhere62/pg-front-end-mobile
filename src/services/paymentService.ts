import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { Payment } from '../types';

export const paymentService = {
  getPayments: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS);
    return response.data;
  },

  createPayment: async (data: Partial<Payment>) => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.TENANT_PAYMENTS, data);
    return response.data;
  },

  getAdvancePayments: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.ADVANCE_PAYMENTS);
    return response.data;
  },

  getRefundPayments: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.REFUND_PAYMENTS);
    return response.data;
  },
};
