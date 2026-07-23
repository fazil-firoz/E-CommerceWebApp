import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Divider, Modal, message, Spin } from 'antd';
import {
  LockOutlined, ShoppingOutlined, RightOutlined,
  SafetyCertificateOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { CartContext } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import { paymentApi } from '../../api/paymentApi';
import { shipmentApi } from '../../api/shipmentApi';
import { shopApi } from '../../api/shopApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import './Checkout.css';

const { Title, Text } = Typography;

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  const [showMockModal, setShowMockModal] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) setShopSettings(res.data);
      } catch (err) {}
    };
    fetchShop();
  }, []);

  const shopName = shopSettings?.shopName || 'Store';
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [shippingMethod, setShippingMethod] = useState(null);

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

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <ShoppingOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
        <Title level={4} style={{ color: '#8c8c8c', marginTop: '16px' }}>Your cart is empty</Title>
        <Button type="primary" onClick={() => navigate('/products')} style={{ marginTop: '8px' }}>
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
        customerEmail: values.email || null,   // optional
        customerPhone: values.phone,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || null,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity }))
      };

      const result = await orderApi.create(payload);

      if (result.success && result.data) {
        const data = result.data;
        setOrderResponse(data);

        if (data.razorpayOrderId.startsWith('order_mock_')) {
          setShowMockModal(true);
        } else {
          const loaded = await loadRazorpayScript();
          if (!loaded) { message.error('Could not load Razorpay. Check internet.'); return; }
          openRazorpayCheckout(data, values);
        }
      } else {
        message.error(result.message || 'Failed to place order');
      }
    } catch (err) {
      if (err?.errorFields) return; // form validation error
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
          clearCart();
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
      theme: { color: '#0066cc' },
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
      clearCart();
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

  const calculateShippingFee = () => {
    if (!shippingMethod) return 0;
    if (shippingMethod.freeShippingThreshold > 0 && cartTotal >= shippingMethod.freeShippingThreshold) {
      return 0;
    }
    return shippingMethod.fee;
  };

  const shippingCharge = calculateShippingFee();
  const grandTotal = cartTotal + shippingCharge;

  return (
    <div className="checkout-wrapper">
      {loading && (
        <div className="checkout-loading-overlay">
          <Spin size="large" tip="Processing your order..." />
        </div>
      )}

      {/* Left: Form */}
      <div className="checkout-left">
        {/* Brand */}
        <div className="checkout-brand">
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1a1a' }}>
            🧸 {shopName}
          </Title>
        </div>

        {/* Mobile Order Summary Toggle */}
        <div className="checkout-mobile-summary" onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingOutlined />
            <Text strong style={{ color: '#0066cc' }}>
              {orderSummaryExpanded ? 'Hide' : 'Show'} order summary
            </Text>
            <RightOutlined style={{ fontSize: '11px', color: '#0066cc', transform: orderSummaryExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
          <Text strong style={{ fontSize: '16px' }}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </div>

        {orderSummaryExpanded && (
          <div className="checkout-mobile-items">
            {cartItems.map(item => (
              <div key={item.id} className="checkout-item-row">
                <div className="checkout-item-img-wrap">
                  <img src={resolveProductImageUrl(item.imageUrl || item.imageUrls?.[0], 'thumb')} alt={item.name} />
                  <span className="checkout-item-qty">{item.quantity}</span>
                </div>
                <Text style={{ flex: 1, fontSize: '14px' }}>{item.name}</Text>
                <Text strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
              </div>
            ))}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Text type="secondary">Subtotal</Text>
              <Text>₹{cartTotal.toLocaleString('en-IN')}</Text>
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

          {/* ── CONTACT ─────────────────────────────── */}
          <div className="checkout-section">
            <div className="checkout-section-header">
              <Title level={5} style={{ margin: 0 }}>Contact</Title>
              <span className="checkout-signin-link" onClick={() => message.info('Email OTP login coming soon!')}>
                Already have an account? <strong>Sign in</strong>
              </span>
            </div>

            <Form.Item
              name="email"
              style={{ marginBottom: '12px' }}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Email address (optional)"
                size="large"
                className="checkout-input"
              />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '16px', marginTop: '-8px' }}>
              Enter your email to receive shipment tracking updates.
            </Text>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: 'Phone number is required' },
                { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number' }
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Phone number"
                size="large"
                className="checkout-input"
                maxLength={10}
              />
            </Form.Item>
          </div>

          {/* ── DELIVERY ─────────────────────────────── */}
          <div className="checkout-section">
            <Title level={5} style={{ margin: '0 0 16px' }}>Delivery</Title>

            <Form.Item name="fullName" rules={[{ required: true, message: 'Full name is required' }]} style={{ marginBottom: '12px' }}>
              <Input placeholder="Full name" size="large" className="checkout-input" />
            </Form.Item>

            <Form.Item name="addressLine1" rules={[{ required: true, message: 'Address is required' }]} style={{ marginBottom: '12px' }}>
              <Input
                prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Address"
                size="large"
                className="checkout-input"
              />
            </Form.Item>

            <Form.Item name="addressLine2" style={{ marginBottom: '12px' }}>
              <Input placeholder="Apartment, suite, etc. (optional)" size="large" className="checkout-input" />
            </Form.Item>

            <div className="checkout-row-3">
              <Form.Item name="city" rules={[{ required: true, message: 'City required' }]} style={{ marginBottom: '12px', flex: 2 }}>
                <Input placeholder="City" size="large" className="checkout-input" />
              </Form.Item>
              <Form.Item name="state" rules={[{ required: true, message: 'State required' }]} style={{ marginBottom: '12px', flex: 2 }}>
                <Input placeholder="State" size="large" className="checkout-input" />
              </Form.Item>
              <Form.Item
                name="pincode"
                rules={[
                  { required: true, message: 'Pincode required' },
                  { pattern: /^[0-9]{6}$/, message: '6 digits' }
                ]}
                style={{ marginBottom: '12px', flex: 1 }}
              >
                <Input placeholder="Pincode" size="large" className="checkout-input" maxLength={6} />
              </Form.Item>
            </div>
          </div>

          {/* ── PAYMENT ─────────────────────────────── */}
          <div className="checkout-section">
            <Title level={5} style={{ margin: '0 0 4px' }}>Payment</Title>
            <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '16px' }}>
              All transactions are secure and encrypted.
            </Text>

            <div className="checkout-payment-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="https://razorpay.com/favicon.ico" alt="razorpay" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                <Text strong>Razorpay — UPI, Cards, Net Banking & Wallets</Text>
              </div>
              <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '8px' }}>
                You'll be redirected to Razorpay to complete payment.
              </Text>
            </div>
          </div>

          {/* ── BILLING ADDRESS ─────────────────────── */}
          <div className="checkout-section">
            <Title level={5} style={{ margin: '0 0 12px' }}>Billing address</Title>
            <div className="checkout-billing-option checkout-billing-selected">
              <div className="checkout-radio-dot" />
              <Text>Same as shipping address</Text>
            </div>
          </div>

          {/* Pay Now */}
          <Button
            type="primary"
            size="large"
            block
            onClick={handlePayNow}
            loading={loading}
            className="checkout-pay-btn"
            icon={<LockOutlined />}
          >
            Pay now — ₹{grandTotal.toLocaleString('en-IN')}
          </Button>

          <div className="checkout-footer-links">
            <SafetyCertificateOutlined style={{ color: '#8c8c8c' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Secured by 256-bit SSL encryption
            </Text>
          </div>
        </Form>
      </div>

      {/* Right: Order Summary (desktop) */}
      <div className="checkout-right">
        <div className="checkout-summary-panel">
          {cartItems.map(item => (
            <div key={item.id} className="checkout-item-row">
              <div className="checkout-item-img-wrap">
                <img src={resolveProductImageUrl(item.imageUrl || item.imageUrls?.[0], 'thumb')} alt={item.name} />
                <span className="checkout-item-qty">{item.quantity}</span>
              </div>
              <div style={{ flex: 1 }}>
                <Text strong style={{ fontSize: '14px', display: 'block' }}>{item.name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>Qty: {item.quantity}</Text>
              </div>
              <Text strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
            </div>
          ))}

          <Divider style={{ margin: '16px 0' }} />

          <div className="checkout-summary-row">
            <Text type="secondary">Subtotal</Text>
            <Text>₹{cartTotal.toLocaleString('en-IN')}</Text>
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

          <Divider style={{ margin: '12px 0' }} />

          <div className="checkout-summary-row checkout-summary-total">
            <Text strong style={{ fontSize: '16px' }}>Total</Text>
            <div>
              <Text type="secondary" style={{ fontSize: '12px', marginRight: '6px' }}>INR</Text>
              <Text strong style={{ fontSize: '20px' }}>₹{grandTotal.toLocaleString('en-IN')}</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Payment Modal */}
      <Modal
        title={<span style={{ color: '#0066cc', fontWeight: 700 }}>🧪 Razorpay Test Mode</span>}
        open={showMockModal}
        closable={false}
        footer={[
          <Button key="fail" danger onClick={() => handleMockPayment(false)}>Simulate Failure</Button>,
          <Button key="success" type="primary" style={{ background: '#52c41a', border: 'none' }} onClick={() => handleMockPayment(true)}>
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
