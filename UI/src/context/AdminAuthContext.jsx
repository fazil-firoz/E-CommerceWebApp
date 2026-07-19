import React, { createContext, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { message } from 'antd';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    try {
      const response = await adminApi.login({ username, password });
      if (response.success && response.data) {
        const adminData = response.data;
        setAdmin(adminData);
        localStorage.setItem('admin_auth', JSON.stringify(adminData));
        message.success('Admin login successful!');
        return true;
      } else {
        message.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      message.error(error.message || 'Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_auth');
    message.info('Logged out from admin panel.');
  };

  const isAuthenticated = !!admin?.token;

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, isAuthenticated }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
