import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const authApi = {
  sendOtp: (email) => apiClient.post(URLS.AUTH.SEND_OTP, { email }),
  verifyOtp: (email, otp) => apiClient.post(URLS.AUTH.VERIFY_OTP, { email, otp }),
};
