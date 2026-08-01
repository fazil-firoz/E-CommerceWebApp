import axios from 'axios';
import { URLS } from '../config/urlConfig';

const apiClient = axios.create({
  baseURL: URLS.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor for adding JWT token
apiClient.interceptors.request.use(
  (config) => {
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth) {
      const { token } = JSON.parse(adminAuth);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for unwrapping standard BaseResponse structure
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      success: false,
      message: error.message || 'An error occurred during the request',
      errors: [error.message]
    });
  }
);

export default apiClient;
