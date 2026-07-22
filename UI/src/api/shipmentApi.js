import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const shipmentApi = {
  getAll: (includeInactive = false) => apiClient.get(`${URLS.BASE_URL}/shipment?includeInactive=${includeInactive}`),
  update: (id, data) => apiClient.put(`${URLS.BASE_URL}/shipment/${id}`, data),
};
