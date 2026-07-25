import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const adminApi = {
  login: (data) => apiClient.post(URLS.ADMIN.LOGIN, data),
  changePassword: (data) => apiClient.post(URLS.ADMIN.CHANGE_PASSWORD, data),
  getDashboardStats: () => apiClient.get(URLS.ADMIN.DASHBOARD_STATS),
};
