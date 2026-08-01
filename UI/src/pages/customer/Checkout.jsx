import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Typography, Divider, Modal, message, Spin, Tag, Alert, Space } from 'antd';
import {
  LockOutlined, ShoppingOutlined, RightOutlined,
  SafetyCertificateOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, CheckCircleFilled, UserOutlined, ThunderboltOutlined,
  PlusOutlined, MinusOutlined, TagOutlined, CloseOutlined
} from '@ant-design/icons';
import { CartContext } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import LoginDrawer from '../../components/LoginDrawer';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { shipmentApi } from '../../api/shipmentApi';
import { shopApi } from '../../api/shopApi';
import { couponApi } from '../../api/couponApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import './Checkout.css';

const { Title, Text } = Typography;

const Checkout = () => {
  const { cartItems, cartTotal, updateQuantity, clearCart } = useContext(CartContext);
  const { customer, isLoggedIn } = useCustomerAuth();
  const { activeTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Buy Now single item state (if user clicked "Buy Now" instead of adding to cart)
  const [buyNowItem, setBuyNowItem] = useState(location.state?.buyNowItem || null);

  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;
  const checkoutTotal = buyNowItem ? (buyNowItem.price * buyNowItem.quantity) : cartTotal;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchShop = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) setShopSettings(res.data);
      } catch (err) {}
    };
    fetchShop();
  }, []);

  // Prefill customer details when logged in
  useEffect(() => {
    if (isLoggedIn && customer) {
      form.setFieldsValue({
        email: customer.email || '',
        fullName: customer.name || form.getFieldValue('fullName') || '',
        phone: customer.phoneNumber || form.getFieldValue('phone') || ''
      });
    }
  }, [isLoggedIn, customer, form]);

  const shopName = shopSettings?.shopName || 'Store';
  const shopPrefix = shopName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'STORE';
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [shippingMethod, setShippingMethod] = useState(null);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponErrorMsg, setCouponErrorMsg] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await shipmentApi.getAll();
        if (res.success && res.data && res.data.length > 0) {
          const defaultMethod = res.data.find(m => m.isDefault && m.isActive) || res.data.find(m => m.isActive) || res.data[0];
          setShippingMethod(defaultMethod);
        }
      } catch (err) {
        console.error('Failed to load shipping method', err);
      }
    };
    fetchShipping();
  }, []);

  const isFreeShipping = shippingMethod?.freeShippingThreshold > 0 && checkoutTotal >= shippingMethod.freeShippingThreshold;
  const shippingCharge = isFreeShipping ? 0 : (shippingMethod?.fee || 0);
  const grossTotal = checkoutTotal + shippingCharge;
  const grandTotal = Math.max(0, grossTotal - couponDiscountAmount);

  const handleApplyCoupon = async () => {
    setCouponErrorMsg('');
    if (!couponCodeInput.trim()) {
      setCouponErrorMsg('Please enter a coupon code');
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await couponApi.validate(couponCodeInput.trim(), grossTotal);
      if (res.success && res.data && res.data.isValid) {
        const discountPct = res.data.discountPercentage;
        const discountAmt = Math.round(grossTotal * (discountPct / 100) * 100) / 100;
        setAppliedCoupon(res.data);
        setCouponDiscountAmount(discountAmt);
        setCouponErrorMsg('');
      } else {
        setCouponErrorMsg(res.message || 'Invalid or expired coupon code');
      }
    } catch (err) {
      setCouponErrorMsg('Failed to validate coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountAmount(0);
    setCouponCodeInput('');
    setCouponErrorMsg('');
  };

  const handleUpdateQuantity = (item, newQty) => {
    if (newQty < 1) return;
    if (item.stockQuantity && newQty > item.stockQuantity) {
      message.warning(`Only ${item.stockQuantity} items available in stock`);
      return;
    }

    if (buyNowItem) {
      setBuyNowItem(prev => ({ ...prev, quantity: newQty }));
    } else {
      updateQuantity(item.id, newQty);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="checkout-empty">
        <ShoppingOutlined style={{ fontSize: '48px', color: '#f9a8d4' }} />
        <Title level={4} style={{ color: '#8c8c8c', marginTop: '16px' }}>Your checkout items are empty</Title>
        <Button type="primary" onClick={() => navigate('/products')} style={{ marginTop: '8px', background: '#ec4899', borderColor: '#ec4899', borderRadius: '20px' }}>
          Back to Shop
        </Button>
      </div>
    );
  }

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayNow = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        customerName: values.fullName,
        customerEmail: values.email || null,
        customerPhone: values.phone,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || null,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        items: checkoutItems.map(item => ({ productId: item.id, quantity: item.quantity })),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: couponDiscountAmount || 0,
        shippingCharge: shippingCharge || 0
      };

      const res = await orderApi.create(payload);
      if (!res.success) {
        message.error(res.message || 'Failed to create order');
        setLoading(false);
        return;
      }

      const orderData = res.data;
      setOrderResponse(orderData);

      if (!orderData.isRazorpayConfigured || orderData.isTestMode) {
        setLoading(false);
        setShowMockModal(true);
        return;
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        message.error('Razorpay SDK failed to load. Check internet connection.');
        setLoading(false);
        return;
      }

      openRazorpayCheckout(orderData, values);
    } catch (err) {
      message.error(err?.message || 'Error processing order');
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (orderData, customerValues) => {
    const options = {
      key: orderData.razorpayKey,
      amount: orderData.amount * 100,
      currency: 'INR',
      name: shopName,
      description: `Order ${orderData.orderNumber}`,
      order_id: orderData.razorpayOrderId,
      handler: async (response) => {
        setLoading(true);
        try {
          const verifyResult = await paymentApi.verify({
            orderId: orderData.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          
          if (!buyNowItem) {
            clearCart();
          }

          navigate(verifyResult.success
            ? `/order-success?orderNumber=${orderData.orderNumber}&status=Success`
            : `/order-success?orderNumber=${orderData.orderNumber}&status=Failed&error=Signature verification failed`
          );
        } catch (err) {
          navigate(`/order-success?orderNumber=${orderData.orderNumber}&status=Failed&error=${err.message}`);
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: customerValues.fullName,
        email: customerValues.email || '',
        contact: customerValues.phone
      },
      theme: { color: primaryColor },
      modal: { ondismiss: () => message.warning('Payment cancelled.') }
    };
    new window.Razorpay(options).open();
  };

  const handleMockPayment = async (simulateSuccess) => {
    setShowMockModal(false);
    if (!simulateSuccess) {
      navigate(`/order-success?orderNumber=${orderResponse.orderNumber}&status=Failed&error=Payment simulated failure`);
      return;
    }
    setLoading(true);
    try {
      const verifyResult = await paymentApi.verify({
        orderId: orderResponse.orderId,
        razorpayOrderId: orderResponse.razorpayOrderId,
        razorpayPaymentId: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
        razorpaySignature: 'mock_sig_successful_payment'
      });
      
      if (!buyNowItem) {
        clearCart();
      }

      navigate(verifyResult.success
        ? `/order-success?orderNumber=${orderResponse.orderNumber}&status=Success`
        : `/order-success?orderNumber=${orderResponse.orderNumber}&status=Failed&error=Signature verification failed`
      );
    } catch (err) {
      navigate(`/order-success?orderNumber=${orderResponse.orderNumber}&status=Failed&error=${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Theme colors
  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const accentColor = activeTheme?.accentColor || '#ff2a6d';
  const cardBgColor = activeTheme?.cardBgColor || '#ffffff';

  return (
    <div className="checkout-wrapper" style={{ '--checkout-primary': primaryColor, '--checkout-accent': accentColor }}>
      {loading && (
        <div className="checkout-loading-overlay">
          <Spin size="large" tip="Processing your order..." />
        </div>
      )}

      {/* Left: Form */}
      <div className="checkout-left">
        {/* Brand */}
        <div className="checkout-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1a1a', cursor: 'pointer' }} onClick={() => navigate('/')}>
            🧸 {shopName}
          </Title>
        </div>

        {/* Buy Now Express Banner */}
        {buyNowItem && (
          <div style={{ background: `${primaryColor}12`, border: `1px solid ${primaryColor}40`, borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThunderboltOutlined style={{ fontSize: '20px', color: primaryColor }} />
            <div>
              <Text strong style={{ color: primaryColor, fontSize: '14px' }}>Express Buy Now Checkout</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                Purchasing <strong>{buyNowItem.name}</strong>. You can adjust quantity below. Main cart items are kept safe.
              </Text>
            </div>
          </div>
        )}

        {/* Mobile Order Summary Toggle */}
        <div className="checkout-mobile-summary" onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingOutlined style={{ color: primaryColor }} />
            <Text strong style={{ color: primaryColor }}>
              {orderSummaryExpanded ? 'Hide' : 'Show'} order summary
            </Text>
            <RightOutlined style={{ fontSize: '11px', color: primaryColor, transform: orderSummaryExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
          <Text strong style={{ fontSize: '16px' }}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </div>

        {orderSummaryExpanded && (
          <div className="checkout-mobile-items">
            {checkoutItems.map(item => (
              <div key={item.id} className="checkout-item-row" style={{ alignItems: 'center' }}>
                <div className="checkout-item-img-wrap">
                  <img src={resolveProductImageUrl(item.imageUrl || item.imageUrls?.[0], 'thumb')} alt={item.name} />
                  <span className="checkout-item-qty">{item.quantity}</span>
                </div>
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <Text style={{ fontSize: '14px', display: 'block' }}>{item.name}</Text>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d9d9d9', borderRadius: '6px', marginTop: '4px' }}>
                    <Button
                      type="text"
                      size="small"
                      icon={<MinusOutlined style={{ fontSize: '10px' }} />}
                      onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item, item.quantity - 1); }}
                      disabled={item.quantity <= 1}
                      style={{ width: '24px', height: '24px', padding: 0 }}
                    />
                    <span style={{ padding: '0 6px', fontSize: '12px', fontWeight: 600 }}>{item.quantity}</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined style={{ fontSize: '10px' }} />}
                      onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item, item.quantity + 1); }}
                      disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                      style={{ width: '24px', height: '24px', padding: 0 }}
                    />
                  </div>
                </div>
                <Text strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
              </div>
            ))}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Text type="secondary">Subtotal</Text>
              <Text>₹{checkoutTotal.toLocaleString('en-IN')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Text type="secondary">Shipping ({shippingMethod?.name || 'Standard'})</Text>
              {shippingCharge === 0 ? (
                <Text style={{ color: '#52c41a', fontWeight: 700 }}>₹0 (FREE)</Text>
              ) : (
                <Text strong>₹{shippingCharge.toLocaleString('en-IN')}</Text>
              )}
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: '16px' }}>Total</Text>
              <Text strong style={{ fontSize: '16px' }}>₹{grandTotal.toLocaleString('en-IN')}</Text>
            </div>
          </div>
        )}

        <Form form={form} layout="vertical" requiredMark={false}>

          {/* ── DISCOUNT COUPON CODE SECTION (Expandable when clicked) ───── */}
          <div style={{ marginBottom: '24px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '6px', padding: '14px 16px' }}>
            {!showCouponInput && !appliedCoupon ? (
              <div
                onClick={() => setShowCouponInput(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TagOutlined style={{ color: primaryColor, fontSize: '16px' }} />
                  <Text strong style={{ color: primaryColor, fontSize: '14px' }}>Have a discount coupon code?</Text>
                </div>
                <RightOutlined style={{ fontSize: '12px', color: primaryColor }} />
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text strong style={{ fontSize: '13px', color: '#334155' }}>Apply Discount Coupon</Text>
                  {showCouponInput && !appliedCoupon && (
                    <Text type="secondary" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 600 }} onClick={() => setShowCouponInput(false)}>Close</Text>
                  )}
                </div>
                {!appliedCoupon ? (
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      placeholder="Enter Coupon Code (e.g. SAVE10)"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      size="large"
                      style={{ borderRadius: '6px 0 0 6px', fontSize: '16px', fontWeight: 600, height: '46px' }}
                    />
                    <Button
                      type="primary"
                      onClick={handleApplyCoupon}
                      loading={validatingCoupon}
                      size="large"
                      style={{ borderRadius: '0 6px 6px 0', background: primaryColor, borderColor: primaryColor, fontWeight: 700, height: '44px' }}
                    >
                      Apply
                    </Button>
                  </Space.Compact>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '6px' }}>
                    <div>
                      <Text strong style={{ color: '#166534', fontSize: '13px' }}>Coupon Applied: {appliedCoupon.code}</Text>
                      <Text style={{ display: 'block', fontSize: '12px', color: '#15803d' }}>
                        Saved ₹{couponDiscountAmount.toLocaleString('en-IN')} ({appliedCoupon.discountPercentage}% OFF)
                      </Text>
                    </div>
                    <Button type="text" danger size="small" onClick={handleRemoveCoupon} style={{ fontWeight: 700 }}>
                      Remove
                    </Button>
                  </div>
                )}
                {couponErrorMsg && (
                  <Text type="danger" style={{ fontSize: '12px', marginTop: '6px', display: 'block' }}>
                    {couponErrorMsg}
                  </Text>
                )}
              </div>
            )}
          </div>

          {/* ── CONTACT & AUTH ─────────────────────────────── */}
          <div className="checkout-section">
            <div className="checkout-section-header" style={{ marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0, fontWeight: 700 }}>Contact Information</Title>
              {isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${primaryColor}12`, border: `1px solid ${primaryColor}40`, borderRadius: '6px', padding: '4px 12px' }}>
                  <CheckCircleFilled style={{ color: primaryColor, fontSize: '13px' }} />
                  <Text style={{ fontSize: '12px', color: primaryColor, fontWeight: 600 }}>
                    Signed in as <strong>{customer?.email}</strong>
                  </Text>
                </div>
              ) : (
                <span
                  className="checkout-signin-link"
                  onClick={() => setLoginDrawerOpen(true)}
                  style={{ color: '#0066cc', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  Already have an account? <strong style={{ textDecoration: 'underline' }}>Sign in</strong>
                </span>
              )}
            </div>

            <Form.Item
              name="email"
              style={{ marginBottom: '18px' }}
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Email address (optional, for order updates)"
                size="large"
                style={{ borderRadius: '6px', height: '46px' }}
              />
            </Form.Item>
          </div>

          {/* ── SHIPPING ADDRESS ───────────────────────────── */}
          <div className="checkout-section">
            <Title level={5} style={{ marginBottom: '16px', fontWeight: 700 }}>Shipping Address</Title>

            <Form.Item
              name="fullName"
              rules={[{ required: true, message: 'Please enter your full name' }]}
              style={{ marginBottom: '18px' }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Full Name"
                size="large"
                style={{ borderRadius: '6px', height: '46px' }}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Mobile number is required' },
                { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit mobile number' }
              ]}
              style={{ marginBottom: '18px' }}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="10-digit Mobile Number"
                size="large"
                maxLength={10}
                style={{ borderRadius: '6px', height: '46px' }}
              />
            </Form.Item>

            <Form.Item
              name="addressLine1"
              rules={[{ required: true, message: 'Address line 1 is required' }]}
              style={{ marginBottom: '18px' }}
            >
              <Input
                prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="House No., Building, Street Name"
                size="large"
                style={{ borderRadius: '6px', height: '46px' }}
              />
            </Form.Item>

            <Form.Item name="addressLine2" style={{ marginBottom: '18px' }}>
              <Input
                placeholder="Apartment, Suite, Unit, Landmark (optional)"
                size="large"
                style={{ borderRadius: '6px', height: '46px' }}
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <Form.Item
                name="city"
                rules={[{ required: true, message: 'City is required' }]}
                style={{ margin: 0 }}
              >
                <Input placeholder="City" size="large" style={{ borderRadius: '6px', height: '46px' }} />
              </Form.Item>

              <Form.Item
                name="state"
                rules={[{ required: true, message: 'State is required' }]}
                style={{ margin: 0 }}
              >
                <Input placeholder="State" size="large" style={{ borderRadius: '6px', height: '46px' }} />
              </Form.Item>

              <Form.Item
                name="pincode"
                rules={[
                  { required: true, message: 'Pincode is required' },
                  { pattern: /^[0-9]{6}$/, message: 'Valid 6-digit Pincode' }
                ]}
                style={{ margin: 0 }}
              >
                <Input placeholder="Pincode" size="large" maxLength={6} style={{ borderRadius: '6px', height: '46px' }} />
              </Form.Item>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handlePayNow}
            loading={loading}
            className="checkout-pay-btn"
            icon={<LockOutlined />}
            style={{
              borderRadius: '10px', height: '50px', fontSize: '16px', fontWeight: 700,
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              border: 'none',
              boxShadow: `0 4px 14px ${primaryColor}50`
            }}
          >
            Pay now — ₹{grandTotal.toLocaleString('en-IN')}
          </Button>

          <div className="checkout-footer-links">
            <SafetyCertificateOutlined style={{ color: primaryColor }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Secured by 256-bit SSL encryption
            </Text>
          </div>
        </Form>
      </div>

      {/* Right: Order Summary (desktop) */}
      <div className="checkout-right">
        <div className="checkout-summary-panel">
          {checkoutItems.map(item => (
            <div key={item.id} className="checkout-item-row" style={{ alignItems: 'center' }}>
              <div className="checkout-item-img-wrap">
                <img src={resolveProductImageUrl(item.imageUrl || item.imageUrls?.[0], 'thumb')} alt={item.name} />
                <span className="checkout-item-qty">{item.quantity}</span>
              </div>
              <div style={{ flex: 1, paddingRight: '8px' }}>
                <Text strong style={{ fontSize: '14px', display: 'block' }}>{item.name}</Text>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d9d9d9', borderRadius: '6px', marginTop: '4px' }}>
                  <Button
                    type="text"
                    size="small"
                    icon={<MinusOutlined style={{ fontSize: '10px' }} />}
                    onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item, item.quantity - 1); }}
                    disabled={item.quantity <= 1}
                    style={{ width: '24px', height: '24px', padding: 0 }}
                  />
                  <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: 600 }}>{item.quantity}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined style={{ fontSize: '10px' }} />}
                    onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item, item.quantity + 1); }}
                    disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                    style={{ width: '24px', height: '24px', padding: 0 }}
                  />
                </div>
              </div>
              <Text strong style={{ fontSize: '15px' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
            </div>
          ))}

          <Divider style={{ margin: '16px 0' }} />



          <div className="checkout-summary-row">
            <Text type="secondary">Subtotal</Text>
            <Text>₹{checkoutTotal.toLocaleString('en-IN')}</Text>
          </div>
          <div className="checkout-summary-row" style={{ alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ display: 'block' }}>Shipping ({shippingMethod?.name || 'Standard Delivery'})</Text>
              <Text type="secondary" style={{ fontSize: '11px', color: '#8c8c8c' }}>
                Standard Rate: ₹{shippingMethod?.fee ?? 50}
                {shippingMethod?.freeShippingThreshold > 0 && ` (Free on orders > ₹${shippingMethod.freeShippingThreshold})`}
              </Text>
            </div>
            {shippingCharge === 0 ? (
              <Text style={{ color: '#52c41a', fontWeight: 700 }}>₹0 (FREE)</Text>
            ) : (
              <Text strong>₹{shippingCharge.toLocaleString('en-IN')}</Text>
            )}
          </div>

          {couponDiscountAmount > 0 && (
            <div className="checkout-summary-row">
              <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                Coupon Discount ({appliedCoupon?.code})
              </Text>
              <Text style={{ color: '#52c41a', fontWeight: 700 }}>
                - ₹{couponDiscountAmount.toLocaleString('en-IN')}
              </Text>
            </div>
          )}

          <Divider style={{ margin: '12px 0' }} />

          <div className="checkout-summary-row checkout-summary-total">
            <Text strong style={{ fontSize: '16px' }}>Total</Text>
            <div>
              <Text type="secondary" style={{ fontSize: '12px', marginRight: '6px' }}>INR</Text>
              <Text strong style={{ fontSize: '20px', color: primaryColor }}>₹{grandTotal.toLocaleString('en-IN')}</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Login Drawer Modal */}
      <LoginDrawer open={loginDrawerOpen} onClose={() => setLoginDrawerOpen(false)} />

      {/* Mock Payment Modal */}
      <Modal
        title={<span style={{ color: '#0066cc', fontWeight: 700 }}>🧪 Razorpay Test Mode</span>}
        open={showMockModal}
        closable={false}
        footer={[
          <Button key="fail" danger onClick={() => handleMockPayment(false)}>Simulate Failure</Button>,
          <Button key="success" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleMockPayment(true)}>
            Simulate Success ✓
          </Button>
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <Text strong>Running in Razorpay mock mode.</Text>
          <br />
          <Text type="secondary">
            Configure real keys in <code>appsettings.json</code> under <code>Razorpay:KeyId</code> and <code>Razorpay:KeySecret</code> to enable live payments.
          </Text>
          <br /><br />
          <Text type="secondary">Amount: <strong>₹{grandTotal.toLocaleString('en-IN')}</strong> | Ref: <strong>{orderResponse?.orderNumber}</strong></Text>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;
