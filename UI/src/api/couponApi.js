import { URLS } from '../config/urlConfig';

export const couponApi = {
  getAll: async () => {
    try {
      const response = await fetch(URLS.COUPONS.GET_ALL);
      return await response.json();
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return { success: false, message: 'Network error fetching coupons' };
    }
  },

  validate: async (code, purchaseAmount) => {
    try {
      const response = await fetch(URLS.COUPONS.VALIDATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, purchaseAmount })
      });
      return await response.json();
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, message: 'Network error validating coupon' };
    }
  },

  create: async (data) => {
    try {
      const response = await fetch(URLS.COUPONS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating coupon:', error);
      return { success: false, message: 'Network error creating coupon' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await fetch(URLS.COUPONS.UPDATE(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating coupon:', error);
      return { success: false, message: 'Network error updating coupon' };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(URLS.COUPONS.DELETE(id), {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return { success: false, message: 'Network error deleting coupon' };
    }
  }
};
