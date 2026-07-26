import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const themeApi = {
  getActiveTheme: async () => {
    // apiClient interceptor already returns response.data (the BaseResponse)
    const response = await apiClient.get(`${URLS.BASE_URL}/themes/active`);
    return response;
  },

  getAllThemes: async () => {
    const response = await apiClient.get(`${URLS.BASE_URL}/themes`);
    return response;
  },

  setActiveTheme: async (id) => {
    const response = await apiClient.post(`${URLS.BASE_URL}/themes/${id}/select`);
    return response;
  },

  updateTheme: async (id, data) => {
    const response = await apiClient.put(`${URLS.BASE_URL}/themes/${id}`, data);
    return response;
  }
};
