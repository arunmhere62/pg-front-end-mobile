import axiosInstance from '../core/axiosInstance';
import { API_ENDPOINTS } from '../../config/api.config';

export const authService = {
  sendOtp: async (phone: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_OTP, { phone });
    return response.data;
  },

  verifyOtp: async (phone: string, otp: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp });
    return response.data;
  },

  resendOtp: async (phone: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_OTP, { phone });
    return response.data;
  },
};
