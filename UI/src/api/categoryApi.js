import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const categoryApi = {
  getAll: () => apiClient.get(URLS.CATEGORIES.GET_ALL),
  create: (data) => apiClient.post(URLS.CATEGORIES.CREATE, data),
  update: (id, data) => apiClient.put(URLS.CATEGORIES.UPDATE(id), data),
  delete: (id) => apiClient.delete(URLS.CATEGORIES.DELETE(id)),
};
