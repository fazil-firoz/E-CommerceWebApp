import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const themeApi = {
  getActiveTheme: async () => {
    const response = await apiClient.get(`${URLS.BASE_URL}/themes/active`);
    return response.data;
  },

  getAllThemes: async () => {
    const response = await apiClient.get(`${URLS.BASE_URL}/themes`);
    return response.data;
  },

  setActiveTheme: async (id) => {
    const response = await apiClient.post(`${URLS.BASE_URL}/themes/${id}/select`);
    return response.data;
  },

  updateTheme: async (id, data) => {
    const response = await apiClient.put(`${URLS.BASE_URL}/themes/${id}`, data);
    return response.data;
  }
};
