import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const superAdminApi = {
  getControl: async () => {
    const response = await apiClient.get(URLS.SUPER_ADMIN.GET_CONTROL);
    return response;
  },

  getControlFlags: async () => {
    const response = await apiClient.get(URLS.SUPER_ADMIN.GET_CONTROL);
    return response;
  },

  verify: async (username, password) => {
    const response = await apiClient.post(URLS.SUPER_ADMIN.VERIFY, { username, password });
    return response;
  },

  updateControl: async (controlData) => {
    const response = await apiClient.put(URLS.SUPER_ADMIN.UPDATE_CONTROL, controlData);
    return response;
  },

  resetDatabase: async (confirmationWord) => {
    const response = await apiClient.post(URLS.SUPER_ADMIN.RESET_DATABASE, { confirmationWord });
    return response;
  }
};
