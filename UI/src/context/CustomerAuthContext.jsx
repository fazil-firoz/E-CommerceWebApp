import React, { createContext, useContext, useState, useCallback } from 'react';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem('customer_auth');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((customerData) => {
    localStorage.setItem('customer_auth', JSON.stringify(customerData));
    setCustomer(customerData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('customer_auth');
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, isLoggedIn: !!customer, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export default CustomerAuthContext;
