import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const orderApi = {
  getAll: () => apiClient.get(URLS.ORDERS.GET_ALL),
  getById: (id) => apiClient.get(URLS.ORDERS.GET_BY_ID(id)),
  create: (data) => apiClient.post(URLS.ORDERS.CREATE, data),
  updateStatus: (id, status) => apiClient.put(URLS.ORDERS.UPDATE_STATUS(id), status),
};
