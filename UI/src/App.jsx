import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider as AuthProvider } from './context/AdminAuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import Home from './pages/customer/Home';
import ProductListing from './pages/customer/ProductListing';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CategoryManagement from './pages/admin/CategoryManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ShopManagement from './pages/admin/ShopManagement';
import AppControl from './pages/admin/AppControl';
import ReportManagement from './pages/admin/ReportManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomerAuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductListing />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
            </Route>

            {/* Admin Authentication Route */}
            <Route path="/admin/login" element={<Login />} />

            {/* Admin Dashboard Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="reports" element={<ReportManagement />} />
              <Route path="app-control" element={<AppControl />} />
              <Route path="shop-settings" element={<ShopManagement />} />
            </Route>
          </Routes>
        </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
