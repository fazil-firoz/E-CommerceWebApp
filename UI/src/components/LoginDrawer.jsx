import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Input, Button, Typography, Divider, message, Space } from 'antd';
import {
  MailOutlined, ArrowRightOutlined, ArrowLeftOutlined,
  CheckCircleFilled, UserOutlined, LogoutOutlined
} from '@ant-design/icons';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { authApi } from '../api/authApi';
import { shopApi } from '../api/shopApi';
import './LoginDrawer.css';

const { Text, Title } = Typography;

// ── OTP digit count ──────────────────────────────────────────────────────
const OTP_LENGTH = 6;

const LoginDrawer = ({ open, onClose }) => {
  const { customer, isLoggedIn, login, logout } = useCustomerAuth();

  // Steps: 'email' | 'otp' | 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [shopSettings, setShopSettings] = useState(null);

  const otpRefs = useRef([]);
  const timerRef = useRef(null);

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

  // Reset state when drawer opens
  useEffect(() => {
    if (open && !isLoggedIn) {
      setStep('email');
      setEmail('');
      setOtp(Array(OTP_LENGTH).fill(''));
      setEmailError('');
      setLoading(false);
    }
  }, [open, isLoggedIn]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // ── Send OTP ───────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
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

      // Focus first OTP box after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err) {
      message.error(err?.message || 'Failed to send OTP. Check your email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────────────────
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
      setTimeout(() => {
        onClose();
        setStep('email');
      }, 2000);
    } catch (err) {
      message.error(err?.message || 'Invalid OTP. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box key handlers ───────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit entered
    if (digit && index === OTP_LENGTH - 1) {
      const complete = newOtp.join('');
      if (complete.length === OTP_LENGTH) {
        setTimeout(() => handleVerifyOtpWithValue(complete), 100);
      }
    }
  };

  const handleVerifyOtpWithValue = async (otpValue) => {
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
      setTimeout(() => { onClose(); setStep('email'); }, 2000);
    } catch (err) {
      message.error(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
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
    if (e.key === 'Enter') {
      handleVerifyOtp();
    }
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

  // ── LOGGED IN VIEW ─────────────────────────────────────────────────────
  const renderLoggedIn = () => (
    <div className="ld-logged-in">
      <div className="ld-avatar">
        {customer?.name?.[0]?.toUpperCase() || '?'}
      </div>
      <Title level={4} style={{ margin: '12px 0 4px', fontWeight: 700 }}>
        Hey, {customer?.name}! 👋
      </Title>
      <Text type="secondary" style={{ fontSize: '14px' }}>{customer?.email}</Text>

      <div className="ld-account-card">
        <div className="ld-account-row">
          <MailOutlined style={{ color: '#1677ff' }} />
          <Text style={{ fontSize: '14px' }}>{customer?.email}</Text>
        </div>
        <div className="ld-account-row">
          <CheckCircleFilled style={{ color: '#52c41a' }} />
          <Text style={{ fontSize: '14px', color: '#52c41a' }}>Email Verified</Text>
        </div>
      </div>

      <Button
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        block
        size="large"
        danger
        className="ld-logout-btn"
      >
        Sign Out
      </Button>
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
      >
        Send OTP
      </Button>

      <Divider style={{ margin: '24px 0 16px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>By signing in you agree to our</Text>
      </Divider>
      <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
        <a href="/privacy-policy" style={{ color: '#1677ff' }}>Privacy Policy</a> · <a href="/terms-conditions" style={{ color: '#1677ff' }}>Terms of Service</a>
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
      <Text strong style={{ display: 'block', textAlign: 'center', marginBottom: '28px', color: '#1677ff', fontSize: '15px' }}>
        {email}
      </Text>

      {/* OTP Boxes */}
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
        style={{ marginTop: '8px' }}
        icon={<CheckCircleFilled />}
      >
        Verify & Sign In
      </Button>

      {/* Resend */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {resendTimer > 0 ? (
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Resend OTP in <strong>{resendTimer}s</strong>
          </Text>
        ) : (
          <Button type="link" onClick={handleSendOtp} style={{ fontSize: '13px', padding: 0 }}>
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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={360}
      title={null}
      closeIcon={null}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.25)' }
      }}
      className="login-drawer"
    >
      {/* Custom header */}
      <div className="ld-header">
        <div className="ld-header-brand">
          <span className="ld-brand-dot">🧸</span>
          <Text strong style={{ fontSize: '15px' }}>{shopName}</Text>
        </div>
        <button className="ld-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="ld-body">
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
