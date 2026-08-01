import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, Typography, Divider, message, Space, Tabs, Tag, Card, Spin, Empty, Collapse, Tooltip } from 'antd';
import {
  MailOutlined, ArrowRightOutlined, ArrowLeftOutlined,
  CheckCircleFilled, UserOutlined, LogoutOutlined,
  ShoppingOutlined, TruckOutlined, CopyOutlined,
  ClockCircleOutlined, CheckOutlined, EnvironmentOutlined,
  TagOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { authApi } from '../api/authApi';
import { shopApi } from '../api/shopApi';
import { orderApi } from '../api/orderApi';
import './LoginDrawer.css';

const { Title, Text, Paragraph } = Typography;
const OTP_LENGTH = 6;

const LoginDrawer = ({ open, onClose }) => {
  const { customer, isLoggedIn, login, logout } = useCustomerAuth();
  const { activeTheme } = React.useContext(ThemeContext);

  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const secondaryColor = activeTheme?.secondaryColor || '#ff85c0';
  const accentColor = activeTheme?.accentColor || '#ff2a6d';

  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [shopSettings, setShopSettings] = useState(null);

  // Customer Order History state
  const [activeTab, setActiveTab] = useState('profile');
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(null);

  const otpRefs = useRef([]);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) setShopSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch shop info', err);
      }
    };
    fetchShopInfo();
  }, []);

  // Fetch orders whenever drawer opens and customer is logged in
  useEffect(() => {
    if (open && isLoggedIn && customer?.email) {
      fetchCustomerOrders(customer.email);
    }
  }, [open, isLoggedIn, customer]);

  const fetchCustomerOrders = async (custEmail) => {
    setLoadingOrders(true);
    try {
      const res = await orderApi.getMyOrders(custEmail);
      if (res.success) {
        setMyOrders(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer order history', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Timer Countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const shopName = shopSettings?.shopName || 'Store';

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setLoading(true);

    try {
      const result = await authApi.sendOtp(email);
      if (!result.success) {
        message.error(result.message || 'Failed to send OTP. Please try again.');
        return;
      }

      message.success({ content: `OTP sent to ${email}`, icon: '✉️', duration: 3 });
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('otp');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err) {
      message.error(err?.message || 'Failed to send OTP. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < OTP_LENGTH) {
      message.warning('Please enter the complete OTP');
      return;
    }
    setLoading(true);

    try {
      const result = await authApi.verifyOtp(email, otpValue);
      if (!result.success) {
        message.error(result.message || 'Invalid OTP. Please try again.');
        setOtp(Array(OTP_LENGTH).fill(''));
        otpRefs.current[0]?.focus();
        return;
      }
      login({ email: result.data.email, name: result.data.name, loginMethod: 'email_otp' });
      setStep('success');
      fetchCustomerOrders(result.data.email);

      setTimeout(() => {
        setStep('email');
      }, 1500);
    } catch (err) {
      message.error(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
    if (e.key === 'Enter') handleVerifyOtp();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted) {
      const newOtp = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((d, i) => { newOtp[i] = d; });
      setOtp(newOtp);
      otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    }
    e.preventDefault();
  };

  const handleLogout = () => {
    logout();
    onClose();
    message.success('Signed out successfully');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    message.success('Tracking ID copied to clipboard!');
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  // Helper for Order Status Badge Tag
  const renderStatusTag = (status) => {
    const statusMap = {
      Pending: { color: 'gold', label: '⏳ Pending' },
      Processing: { color: 'orange', label: '🔄 Processing' },
      Shipped: { color: 'blue', label: '🚚 Shipped' },
      Delivered: { color: 'green', label: '✅ Delivered' },
      Cancelled: { color: 'red', label: '❌ Cancelled' }
    };
    const s = statusMap[status] || { color: 'default', label: status };
    return <Tag color={s.color} style={{ borderRadius: '12px', fontWeight: 700, padding: '2px 10px', margin: 0 }}>{s.label}</Tag>;
  };

  // ── LOGGED IN VIEW WITH 2 TABS ──────────────────────────────────────────
  const renderLoggedIn = () => (
    <div className="ld-logged-in" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '12px 6px', overflowX: 'hidden' }}>
      {/* Header Profile Info */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div className="ld-avatar" style={{ margin: '0 auto 10px', background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 6px 18px ${primaryColor}40` }}>
          {customer?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <Title level={4} style={{ margin: '0 0 2px', fontWeight: 800, color: '#1f1f1f' }}>
          Hi, {customer?.name}! 👋
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>{customer?.email}</Text>
      </div>

      {/* 2 Tabs: Profile Details & My Orders */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={[
          {
            key: 'profile',
            label: (
              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                <UserOutlined /> Profile
              </span>
            ),
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%', paddingTop: '10px' }}>
                <Card size="small" style={{ borderRadius: '14px', border: '1px solid #fce7f3', background: '#fff' }}>
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Account Email</Text>
                      <Text strong style={{ fontSize: '13px' }}>{customer?.email}</Text>
                    </div>
                    <Divider style={{ margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Status</Text>
                      <Tag color="green" style={{ borderRadius: '10px', margin: 0, fontWeight: 700 }}>
                        <CheckCircleFilled /> Verified
                      </Tag>
                    </div>
                    <Divider style={{ margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>Total Orders</Text>
                      <Text strong style={{ fontSize: '14px', color: primaryColor }}>{myOrders.length} Orders</Text>
                    </div>
                  </Space>
                </Card>

                <div style={{
                  background: `${primaryColor}10`, border: `1px solid ${primaryColor}30`,
                  borderRadius: '14px', padding: '14px', textAlign: 'center'
                }}>
                  <SafetyCertificateOutlined style={{ fontSize: '20px', color: primaryColor, marginBottom: '6px' }} />
                  <Text strong style={{ display: 'block', fontSize: '13px', color: primaryColor }}>
                    Linked Account History
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                    All past guest purchases placed with <strong>{customer?.email}</strong> are automatically linked to your account.
                  </Text>
                </div>

                <Button
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  block
                  size="large"
                  danger
                  style={{ borderRadius: '12px', marginTop: '10px', height: '46px', fontWeight: 600 }}
                >
                  Sign Out
                </Button>
              </Space>
            )
          },
          {
            key: 'orders',
            label: (
              <span style={{ fontWeight: 600, fontSize: '14px' }}>
                <ShoppingOutlined /> My Orders ({myOrders.length})
              </span>
            ),
            children: (
              <div style={{ paddingTop: '10px' }}>
                {loadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="medium" tip="Loading your order history..." />
                  </div>
                ) : myOrders.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div>
                        <Text style={{ fontSize: '13px', color: '#9ca3af' }}>No orders found for this email</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
                          Any guest purchase made with {customer?.email} will appear here.
                        </Text>
                      </div>
                    }
                  />
                ) : (
                  <Space direction="vertical" size={14} style={{ width: '100%' }}>
                    {myOrders.map(order => (
                      <Card
                        key={order.id}
                        size="small"
                        style={{
                          borderRadius: '16px',
                          border: '1px solid #fce7f3',
                          boxShadow: '0 2px 8px rgba(236, 72, 153, 0.05)',
                          background: '#fff'
                        }}
                        bodyStyle={{ padding: '14px' }}
                      >
                        {/* Order Top Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '13px', color: '#1f1f1f' }}>#{order.orderNumber}</Text>
                          {renderStatusTag(order.orderStatus)}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <Text style={{ fontSize: '11px', color: '#9ca3af' }}>
                            <ClockCircleOutlined /> {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Text>
                          <Text strong style={{ fontSize: '15px', color: '#ec4899' }}>
                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                          </Text>
                        </div>

                        {/* 🚚 Tracking Box if Shipped / Delivered */}
                        {(order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered' || order.trackingNumber) && (
                          <div style={{
                            background: '#f0f9ff', border: '1px solid #bae6fd',
                            borderRadius: '12px', padding: '10px 12px', marginBottom: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <TruckOutlined style={{ color: '#0284c7', fontSize: '16px' }} />
                              <Text strong style={{ fontSize: '12px', color: '#0369a1' }}>
                                Shipment Tracking
                              </Text>
                            </div>

                            {order.courierName && (
                              <Text style={{ fontSize: '12px', color: '#334155', display: 'block' }}>
                                Courier: <strong>{order.courierName}</strong>
                              </Text>
                            )}

                            {order.trackingNumber && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <Text style={{ fontSize: '12px', color: '#0369a1' }}>
                                  Track ID: <code style={{ background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{order.trackingNumber}</code>
                                </Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={copiedTracking === order.trackingNumber ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined style={{ color: '#0284c7' }} />}
                                  onClick={() => copyToClipboard(order.trackingNumber)}
                                  style={{ height: '24px', padding: '0 6px', fontSize: '11px' }}
                                >
                                  {copiedTracking === order.trackingNumber ? 'Copied' : 'Copy'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Collapsible Purchased Items */}
                        <Collapse
                          ghost
                          size="small"
                          items={[
                            {
                              key: 'items',
                              label: <Text style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>View {order.items?.length || 0} Purchased Items</Text>,
                              children: (
                                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                      <Text style={{ color: '#374151', flex: 1, paddingRight: '8px' }}>
                                        {item.productName} <span style={{ color: '#9ca3af' }}>x{item.quantity}</span>
                                      </Text>
                                      <Text strong style={{ color: '#1f1f1f' }}>₹{item.totalPrice?.toLocaleString('en-IN')}</Text>
                                    </div>
                                  ))}
                                  {order.address && (
                                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #f0f0f0', fontSize: '11px', color: '#6b7280' }}>
                                      <EnvironmentOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
                                      {order.address.addressLine1}, {order.address.city} - {order.address.pincode}
                                    </div>
                                  )}
                                </Space>
                              )
                            }
                          ]}
                        />
                      </Card>
                    ))}
                  </Space>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );

  // ── EMAIL STEP ─────────────────────────────────────────────────────────
  const renderEmailStep = () => (
    <div className="ld-step">
      <div className="ld-step-icon">✉️</div>
      <Title level={4} className="ld-step-title">Sign in to {shopName}</Title>
      <Text type="secondary" className="ld-step-desc">
        Enter your email address and we'll send you a one-time password.
      </Text>

      <div className="ld-field-wrap">
        <label className="ld-label">Email address</label>
        <Input
          prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
          placeholder="you@example.com"
          size="large"
          value={email}
          onChange={e => { setEmail(e.target.value); setEmailError(''); }}
          onPressEnter={handleSendOtp}
          className={`ld-input ${emailError ? 'ld-input-error' : ''}`}
          autoFocus
          autoComplete="email"
          inputMode="email"
        />
        {emailError && <Text className="ld-error-text">{emailError}</Text>}
      </div>

      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleSendOtp}
        className="ld-primary-btn"
        icon={<ArrowRightOutlined />}
        iconPosition="end"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || primaryColor} 100%)`,
          border: 'none',
          boxShadow: `0 4px 16px ${primaryColor}40`
        }}
      >
        Send OTP
      </Button>

      <Divider style={{ margin: '24px 0 16px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>By signing in you agree to our</Text>
      </Divider>
      <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
        <a href="/privacy-policy" style={{ color: primaryColor }}>Privacy Policy</a> · <a href="/terms-conditions" style={{ color: primaryColor }}>Terms of Service</a>
      </Text>
    </div>
  );

  // ── OTP STEP ───────────────────────────────────────────────────────────
  const renderOtpStep = () => (
    <div className="ld-step">
      <div className="ld-step-icon">🔐</div>
      <Title level={4} className="ld-step-title">Check your email</Title>
      <Text type="secondary" className="ld-step-desc">
        We sent a 6-digit code to
      </Text>
      <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: '28px', color: primaryColor, fontSize: '15px' }}>
        {email}
      </Text>

      <div className="ld-otp-row" onPaste={handleOtpPaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => otpRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleOtpKeyDown(i, e)}
            className={`ld-otp-box ${digit ? 'ld-otp-filled' : ''} ${loading ? 'ld-otp-loading' : ''}`}
            disabled={loading}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {loading && (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: '16px', fontSize: '13px' }}>
          Verifying...
        </Text>
      )}

      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleVerifyOtp}
        className="ld-primary-btn"
        icon={<CheckCircleFilled />}
        style={{
          marginTop: '8px',
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || primaryColor} 100%)`,
          border: 'none',
          boxShadow: `0 4px 16px ${primaryColor}40`
        }}
      >
        Verify & Sign In
      </Button>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {resendTimer > 0 ? (
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Resend OTP in <strong>{resendTimer}s</strong>
          </Text>
        ) : (
          <Button type="link" onClick={handleSendOtp} style={{ fontSize: '13px', padding: 0, color: primaryColor }}>
            Didn't receive it? Resend OTP
          </Button>
        )}
      </div>

      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => setStep('email')}
        style={{ marginTop: '12px', width: '100%', color: '#8c8c8c', fontSize: '13px' }}
      >
        Change email address
      </Button>
    </div>
  );

  // ── SUCCESS STEP ───────────────────────────────────────────────────────
  const renderSuccess = () => (
    <div className="ld-step ld-success-step">
      <div className="ld-success-tick">
        <svg viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="25" fill="none" className="ld-tick-circle" />
          <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="ld-tick-path" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <Title level={3} style={{ marginTop: '20px', fontWeight: 800 }}>You're in! 🎉</Title>
      <Text type="secondary">Signed in as <strong>{email}</strong></Text>
    </div>
  );

  const dynamicDrawerStyle = `
    .login-drawer .ld-primary-btn {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || primaryColor} 100%) !important;
      border: none !important;
      box-shadow: 0 4px 16px ${primaryColor}40 !important;
    }
    .login-drawer .ld-primary-btn:hover {
      box-shadow: 0 8px 24px ${primaryColor}60 !important;
    }
    .login-drawer .ld-input:focus,
    .login-drawer .ld-input:hover {
      border-color: ${primaryColor} !important;
      box-shadow: 0 0 0 3px ${primaryColor}20 !important;
    }
    .login-drawer .ld-otp-box:focus {
      border-color: ${primaryColor} !important;
      box-shadow: 0 0 0 3px ${primaryColor}20 !important;
    }
    .login-drawer .ld-otp-filled {
      border-color: ${primaryColor} !important;
      background: ${primaryColor}15 !important;
      color: ${primaryColor} !important;
    }
    .login-drawer .ant-tabs-ink-bar {
      background: ${primaryColor} !important;
    }
    .login-drawer .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: ${primaryColor} !important;
    }
    .login-drawer .ld-close-btn:hover {
      background: ${primaryColor} !important;
      border-color: ${primaryColor} !important;
      color: #fff !important;
    }
  `;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={typeof window !== 'undefined' && window.innerWidth <= 480 ? '100%' : 440}
      title={null}
      closeIcon={null}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.25)' }
      }}
      className="login-drawer"
    >
      <style>{dynamicDrawerStyle}</style>
      {/* Custom header */}
      <div className="ld-header">
        <div className="ld-header-brand">
          <span className="ld-brand-dot">💖</span>
          <Text strong style={{ fontSize: '15px', color: '#1f1f1f' }}>{shopName}</Text>
        </div>
        <button className="ld-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="ld-body" style={{ padding: isLoggedIn ? '16px 12px' : '24px 20px' }}>
        {isLoggedIn
          ? renderLoggedIn()
          : step === 'email'
          ? renderEmailStep()
          : step === 'otp'
          ? renderOtpStep()
          : renderSuccess()
        }
      </div>
    </Drawer>
  );
};

export default LoginDrawer;
