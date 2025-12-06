import axiosInstance from '../core/axiosInstance';
import { API_ENDPOINTS } from '../../config/api.config';

export const authService = {
  sendOtp: async (phone: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_OTP, { phone });
    // API response format: { success, statusCode, message, data: { ... }, timestamp, path }
    // Extract the inner data object which contains the actual response
    return response.data.data || response.data;
  },

  verifyOtp: async (phone: string, otp: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp });
    // API response format: { success, statusCode, message, data: { user, access_token, refresh_token, ... }, timestamp, path }
    // Extract the inner data object which contains user, tokens, etc.
    return response.data.data || response.data;
  },

  resendOtp: async (phone: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_OTP, { phone });
    // API response format: { success, statusCode, message, data: { ... }, timestamp, path }
    // Extract the inner data object which contains the actual response
    return response.data.data || response.data;
  },
};
