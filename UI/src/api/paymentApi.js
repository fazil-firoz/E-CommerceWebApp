import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const paymentApi = {
  verify: (data) => apiClient.post(URLS.PAYMENTS.VERIFY, data),
};
