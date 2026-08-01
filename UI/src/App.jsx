import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminAuthProvider as AuthProvider } from './context/AdminAuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Scroll to top automatically on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import Home from './pages/customer/Home';
import ProductListing from './pages/customer/ProductListing';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Wishlist from './pages/customer/Wishlist';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import AboutUs from './pages/customer/AboutUs';
import PrivacyPolicy from './pages/customer/PrivacyPolicy';
import RefundPolicy from './pages/customer/RefundPolicy';
import TermsConditions from './pages/customer/TermsConditions';
import ContactUs from './pages/customer/ContactUs';
import ShippingPolicy from './pages/customer/ShippingPolicy';
import Faq from './pages/customer/Faq';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CategoryManagement from './pages/admin/CategoryManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ShopManagement from './pages/admin/ShopManagement';
import UIControlManagement from './pages/admin/UIControlManagement';
import ShipmentManagement from './pages/admin/ShipmentManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import TaxManagement from './pages/admin/TaxManagement';
import ReportManagement from './pages/admin/ReportManagement';
import CouponManagement from './pages/admin/CouponManagement';
import SuperAdminManagement from './pages/admin/SuperAdminManagement';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CustomerAuthProvider>
        <ThemeProvider>
        <CartProvider>
        <WishlistProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductListing />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="refund-policy" element={<RefundPolicy />} />
              <Route path="terms-conditions" element={<TermsConditions />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="shipping-policy" element={<ShippingPolicy />} />
              <Route path="faqs" element={<Faq />} />
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
              <Route path="coupons" element={<CouponManagement />} />
              <Route path="shipment-settings" element={<ShipmentManagement />} />
              <Route path="app-control" element={<ShipmentManagement />} />
              <Route path="invoice-settings" element={<InvoiceManagement />} />
              <Route path="tax-settings" element={<TaxManagement />} />
              <Route path="shop-settings" element={<ShopManagement />} />
              <Route path="ui-control" element={<UIControlManagement />} />
              <Route path="super-admin" element={<SuperAdminManagement />} />
            </Route>
          </Routes>
        </WishlistProvider>
        </CartProvider>
        </ThemeProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
