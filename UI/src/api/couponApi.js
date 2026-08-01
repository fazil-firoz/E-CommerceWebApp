import apiClient from './api';
import { URLS } from '../config/urlConfig';

export const couponApi = {
  getAll: async () => {
    try {
      return await apiClient.get(URLS.COUPONS.GET_ALL);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return { success: false, message: error.message || 'Error fetching coupons', data: [] };
    }
  },

  validate: async (code, purchaseAmount) => {
    try {
      return await apiClient.post(URLS.COUPONS.VALIDATE, { code, purchaseAmount });
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, message: error.message || 'Invalid coupon code' };
    }
  },

  create: async (data) => {
    try {
      return await apiClient.post(URLS.COUPONS.CREATE, data);
    } catch (error) {
      console.error('Error creating coupon:', error);
      return { success: false, message: error.message || 'Failed to create coupon' };
    }
  },

  update: async (id, data) => {
    try {
      return await apiClient.put(URLS.COUPONS.UPDATE(id), data);
    } catch (error) {
      console.error('Error updating coupon:', error);
      return { success: false, message: error.message || 'Failed to update coupon' };
    }
  },

  delete: async (id) => {
    try {
      return await apiClient.delete(URLS.COUPONS.DELETE(id));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return { success: false, message: error.message || 'Failed to delete coupon' };
    }
  }
};
