import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const orderApi = {
  getAll: (params) => apiClient.get(URLS.ORDERS.GET_ALL, { params }),
  getMyOrders: (email) => apiClient.get(`${URLS.BASE_URL}/orders/my-orders?email=${encodeURIComponent(email)}`),
  getById: (id) => apiClient.get(URLS.ORDERS.GET_BY_ID(id)),
  create: (data) => apiClient.post(URLS.ORDERS.CREATE, data),
  updateStatus: (id, status) => apiClient.put(URLS.ORDERS.UPDATE_STATUS(id), status),
};
