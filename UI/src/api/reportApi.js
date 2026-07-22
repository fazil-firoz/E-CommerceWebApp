import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const reportApi = {
  getStockReport: (params) => apiClient.get(`${URLS.BASE_URL}/reports/stock`, { params }),
  getSalesReport: (params) => apiClient.get(`${URLS.BASE_URL}/reports/sales`, { params }),
};
