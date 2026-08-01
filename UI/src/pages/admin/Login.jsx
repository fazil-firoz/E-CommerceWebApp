import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, Space, message, Modal, Steps, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, KeyOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { adminApi } from '../../api/adminApi';

const { Title, Text } = Typography;

const Login = () => {
  const { login, isAuthenticated } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0 = Request OTP, 1 = Verify & Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [requestForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const onFinish = async (values) => {
    setLoading(true);
    const success = await login(values.username, values.password);
    setLoading(false);
    if (success) {
      navigate('/admin');
    }
  };

  // Open Forgot Password Modal
  const openForgotModal = () => {
    setForgotStep(0);
    setForgotEmail('');
    requestForm.resetFields();
    resetForm.resetFields();
    setForgotModalVisible(true);
  };

  // Step 1: Send Forgot Password OTP
  const handleRequestOtp = async (values) => {
    setOtpLoading(true);
    try {
      const response = await adminApi.requestForgotPasswordOtp({ email: values.email });
      if (response.success) {
        setForgotEmail(values.email);
        setForgotStep(1);
        setCountdown(60);
        resetForm.setFieldsValue({ email: values.email });
        message.success(response.message || 'OTP sent to your email!');
      } else {
        message.error(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Error requesting OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0 || !forgotEmail) return;
    setOtpLoading(true);
    try {
      const response = await adminApi.requestForgotPasswordOtp({ email: forgotEmail });
      if (response.success) {
        setCountdown(60);
        message.success(response.message || 'New OTP sent to your email!');
      } else {
        message.error(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Error resending OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirm password do not match!');
      return;
    }

    setResetLoading(true);
    try {
      const response = await adminApi.resetPasswordWithOtp({
        email: forgotEmail,
        otp: values.otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (response.success) {
        message.success(response.message || 'Password reset successfully!');
        setForgotModalVisible(false);
        requestForm.resetFields();
        resetForm.resetFields();
      } else {
        message.error(response.message || 'Password reset failed');
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Error resetting password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      background: '#f5f7fa'
    }}>
      <Card style={{ 
        width: '100%', 
        maxWidth: '400px', 
        borderRadius: '24px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
        border: '1px solid #f0f0f0',
        padding: '16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ fontWeight: 800, margin: 0, color: '#001529' }}>
            Admin Console
          </Title>
          <Text type="secondary">Sign in to manage your toy shop</Text>
        </div>

        <Form
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Username" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
            style={{ marginBottom: '8px' }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          {/* Forgot Password Link */}
          <div style={{ textAlign: 'right', marginBottom: '24px' }}>
            <Button 
              type="link" 
              onClick={openForgotModal}
              style={{ padding: 0, fontSize: '13px', fontWeight: 600, color: '#ff6584' }}
            >
              Forgot Password?
            </Button>
          </div>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ 
                width: '100%', 
                borderRadius: '8px', 
                fontWeight: 600,
                background: '#001529',
                borderColor: '#001529',
                height: '42px'
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Default credentials: <strong>admin</strong> / <strong>admin123</strong>
          </Text>
        </div>
      </Card>

      {/* ── FORGOT PASSWORD EMAIL OTP MODAL ─────────────────────────────────────── */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyOutlined style={{ color: '#ff6584', fontSize: '20px' }} />
            <span style={{ fontWeight: 800, fontSize: '18px', color: '#001529' }}>
              Reset Admin Password via Email OTP
            </span>
          </div>
        }
        open={forgotModalVisible}
        onCancel={() => setForgotModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
        width={460}
        style={{ borderRadius: '20px' }}
      >
        <div style={{ padding: '12px 0 4px' }}>
          <Steps
            current={forgotStep}
            size="small"
            style={{ marginBottom: '24px' }}
            items={[
              { title: 'Request OTP' },
              { title: 'Verify & Reset' }
            ]}
          />

          {/* STEP 0: REQUEST OTP */}
          {forgotStep === 0 && (
            <Form
              form={requestForm}
              onFinish={handleRequestOtp}
              layout="vertical"
              size="large"
            >
              <Alert
                message="Enter your admin email address or username below. A 6-digit OTP code will be sent to your email to verify password reset."
                type="info"
                showIcon
                style={{ borderRadius: '12px', marginBottom: '20px', fontSize: '13px' }}
              />

              <Form.Item
                label={<span style={{ fontWeight: 700 }}>Admin Email / Username</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please enter your Admin Email or Username!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="admin@store.com or admin"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '24px', marginBottom: '8px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={otpLoading}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    height: '44px',
                    fontWeight: 700,
                    fontSize: '15px',
                    background: 'linear-gradient(135deg, #ff6584 0%, #ff2a6d 100%)',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(255, 101, 132, 0.35)'
                  }}
                >
                  Send OTP Code 🚀
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* STEP 1: VERIFY OTP & RESET PASSWORD */}
          {forgotStep === 1 && (
            <Form
              form={resetForm}
              onFinish={handleResetPassword}
              layout="vertical"
              size="large"
            >
              <Alert
                message={`OTP sent to ${forgotEmail}. Please check your inbox and enter the 6-digit code below.`}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ borderRadius: '12px', marginBottom: '20px', fontSize: '13px' }}
              />

              <Form.Item
                label={<span style={{ fontWeight: 700 }}>6-Digit OTP Code</span>}
                name="otp"
                rules={[
                  { required: true, message: 'Please enter the 6-digit OTP!' },
                  { len: 6, message: 'OTP must be exactly 6 digits!' }
                ]}
              >
                <Input
                  prefix={<KeyOutlined style={{ color: '#ff6584' }} />}
                  placeholder="Enter 6-digit OTP (e.g. 123456)"
                  maxLength={6}
                  style={{ borderRadius: '10px', letterSpacing: '4px', fontWeight: 800, textAlign: 'center', fontSize: '18px' }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 700 }}>New Password</span>}
                name="newPassword"
                rules={[
                  { required: true, message: 'Please enter a new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Enter new password (min 6 chars)"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 700 }}>Confirm New Password</span>}
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Please confirm your new password!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Confirm new password"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Button
                  type="link"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setForgotStep(0)}
                  style={{ padding: 0, color: '#64748b', fontSize: '13px' }}
                >
                  Change Email
                </Button>

                <Button
                  type="link"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || otpLoading}
                  style={{ padding: 0, fontSize: '13px', fontWeight: 600, color: countdown > 0 ? '#94a3b8' : '#ff6584' }}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </Button>
              </div>

              <Form.Item style={{ marginBottom: '8px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={resetLoading}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    height: '44px',
                    fontWeight: 700,
                    fontSize: '15px',
                    background: '#001529',
                    borderColor: '#001529',
                    boxShadow: '0 4px 14px rgba(0, 21, 41, 0.25)'
                  }}
                >
                  Reset Password &amp; Sign In
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Login;
