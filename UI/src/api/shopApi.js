import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const shopApi = {
  getSettings: () => apiClient.get(`${URLS.BASE_URL}/shop`),
  updateSettings: (data) => apiClient.put(`${URLS.BASE_URL}/shop`, data),
  uploadLogo: (formData) => apiClient.post(`${URLS.BASE_URL}/shop/upload-logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifySuperAdmin: (data) => apiClient.post(`${URLS.BASE_URL}/shop/verify-super-admin`, data),
};
