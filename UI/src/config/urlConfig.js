// Backend API base URL - must match the HTTPS port Visual Studio/dotnet assigns
// The backend runs on https://localhost:53993
const API_BASE_URL = 'https://localhost:53993/api';

export const URLS = {
  BASE_URL: API_BASE_URL,
  CATEGORIES: {
    GET_ALL: `${API_BASE_URL}/categories`,
    CREATE: `${API_BASE_URL}/categories`,
    UPDATE: (id) => `${API_BASE_URL}/categories/${id}`,
    DELETE: (id) => `${API_BASE_URL}/categories/${id}`,
  },
  PRODUCTS: {
    GET_ALL: `${API_BASE_URL}/products`,
    GET_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
    CREATE: `${API_BASE_URL}/products`,
    UPDATE: (id) => `${API_BASE_URL}/products/${id}`,
    DELETE: (id) => `${API_BASE_URL}/products/${id}`,
  },
  ORDERS: {
    GET_ALL: `${API_BASE_URL}/orders`,
    GET_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    CREATE: `${API_BASE_URL}/orders`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  },
  PAYMENTS: {
    CREATE_ORDER: `${API_BASE_URL}/payments/create-order`,
    VERIFY: `${API_BASE_URL}/payments/verify`,
  },
  ADMIN: {
    LOGIN: `${API_BASE_URL}/admin/login`,
    CHANGE_PASSWORD: `${API_BASE_URL}/admin/change-password`,
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard-stats`,
  },
  AUTH: {
    SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  },
  SUPER_ADMIN: {
    GET_CONTROL: `${API_BASE_URL}/superadmin/control`,
    VERIFY: `${API_BASE_URL}/superadmin/verify`,
    UPDATE_CONTROL: `${API_BASE_URL}/superadmin/control`,
  }
};
