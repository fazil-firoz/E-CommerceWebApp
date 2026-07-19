import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const productApi = {
  getAll: (params) => apiClient.get(URLS.PRODUCTS.GET_ALL, { params }),
  getById: (id) => apiClient.get(URLS.PRODUCTS.GET_BY_ID(id)),
  create: (data) => apiClient.post(URLS.PRODUCTS.CREATE, data),
  update: (id, data) => apiClient.put(URLS.PRODUCTS.UPDATE(id), data),
  delete: (id) => apiClient.delete(URLS.PRODUCTS.DELETE(id)),
};
