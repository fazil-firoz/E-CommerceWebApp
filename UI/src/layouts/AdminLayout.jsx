import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Modal, Form, Input, message, Dropdown, Avatar, Drawer, Grid } from 'antd';
import {
  DashboardOutlined,
  FolderOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShopOutlined,
  ControlOutlined,
  BarChartOutlined,
  UserOutlined,
  KeyOutlined,
  LockOutlined,
  DownOutlined,
  CrownOutlined,
  TruckOutlined,
  FileTextOutlined,
  PercentageOutlined,
  TagOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { shopApi } from '../api/shopApi';
import { adminApi } from '../api/adminApi';
import { superAdminApi } from '../api/superAdminApi';

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
  const { admin, logout, isAuthenticated } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  
  // Mobile breakpoint check (less than lg / 992px)
  const isMobile = screens.lg === false || (screens.xs && !screens.lg);
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);
  const [superAdminControl, setSuperAdminControl] = useState({
    isShopSettingsMenuEnabled: true,
    isUIControlMenuEnabled: true,
    isAppControlMenuEnabled: true,
    isWhatsAppFloatingWidgetEnabled: true
  });

  // Change Password Modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) {
          setShopSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch shop settings for admin layout', err);
      }
    };

    const fetchSuperAdminControls = async () => {
      try {
        const res = await superAdminApi.getControl();
        if (res.success && res.data) {
          setSuperAdminControl(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch Super Admin controls', err);
      }
    };

    fetchShopInfo();
    fetchSuperAdminControls();

    window.addEventListener('superAdminControlUpdated', fetchSuperAdminControls);
    return () => window.removeEventListener('superAdminControlUpdated', fetchSuperAdminControls);
  }, []);

  // Close mobile drawer when navigating to a new route
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirm password do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await adminApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (res.success) {
        message.success(res.message || 'Password changed successfully!');
        setPasswordModalOpen(false);
        form.resetFields();
      } else {
        message.error(res.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Change password error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Current password is incorrect or request failed';
      message.error(errMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin" onClick={() => setMobileDrawerOpen(false)}>Dashboard</Link>,
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: <Link to="/admin/categories" onClick={() => setMobileDrawerOpen(false)}>Categories</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products" onClick={() => setMobileDrawerOpen(false)}>Products</Link>,
    },
    {
      key: '/admin/orders',
      icon: <SolutionOutlined />,
      label: <Link to="/admin/orders" onClick={() => setMobileDrawerOpen(false)}>Orders</Link>,
    },
    ...(superAdminControl.isReportsMenuEnabled !== false ? [{
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: <Link to="/admin/reports" onClick={() => setMobileDrawerOpen(false)}>Reports</Link>,
    }] : []),
    ...(superAdminControl.isCouponMenuEnabled !== false ? [{
      key: '/admin/coupons',
      icon: <TagOutlined />,
      label: <Link to="/admin/coupons" onClick={() => setMobileDrawerOpen(false)}>Coupons</Link>,
    }] : []),
    ...(superAdminControl.isShipmentSettingsMenuEnabled !== false && superAdminControl.isAppControlMenuEnabled !== false ? [{
      key: '/admin/shipment-settings',
      icon: <TruckOutlined />,
      label: <Link to="/admin/shipment-settings" onClick={() => setMobileDrawerOpen(false)}>Shipment Settings</Link>,
    }] : []),
    ...(superAdminControl.isInvoiceSettingsMenuEnabled !== false ? [{
      key: '/admin/invoice-settings',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/invoice-settings" onClick={() => setMobileDrawerOpen(false)}>Invoice Settings</Link>,
    }] : []),
    ...(superAdminControl.isTaxSettingsMenuEnabled !== false ? [{
      key: '/admin/tax-settings',
      icon: <PercentageOutlined />,
      label: <Link to="/admin/tax-settings" onClick={() => setMobileDrawerOpen(false)}>Tax Settings</Link>,
    }] : []),
    ...(superAdminControl.isShopSettingsMenuEnabled !== false ? [{
      key: '/admin/shop-settings',
      icon: <ShopOutlined />,
      label: <Link to="/admin/shop-settings" onClick={() => setMobileDrawerOpen(false)}>Shop Settings</Link>,
    }] : []),
    ...(superAdminControl.isUIControlMenuEnabled !== false ? [{
      key: '/admin/ui-control',
      icon: <ControlOutlined />,
      label: <Link to="/admin/ui-control" onClick={() => setMobileDrawerOpen(false)}>UI Control</Link>,
    }] : []),
    {
      key: '/admin/super-admin',
      icon: <CrownOutlined style={{ color: '#722ed1' }} />,
      label: <Link to="/admin/super-admin" onClick={() => setMobileDrawerOpen(false)}>Super Admin</Link>,
    },
  ];

  const adminProfileDropdownItems = [
    {
      key: 'change-password',
      icon: <KeyOutlined style={{ color: '#fa8c16' }} />,
      label: <span style={{ fontWeight: 500 }}>Change Password</span>,
      onClick: () => setPasswordModalOpen(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
      label: <span style={{ fontWeight: 500, color: '#ff4d4f' }}>Logout</span>,
      onClick: logout,
    },
  ];

  const shopName = shopSettings?.shopName || 'Shop';

  const sidebarContent = (
    <div style={{ background: '#001529', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: '#002140',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Typography.Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800, fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {shopName} Admin
        </Typography.Title>
        {isMobile && (
          <Button
            type="text"
            icon={<CloseOutlined style={{ color: '#fff', fontSize: '16px' }} />}
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ padding: '12px 0', flex: 1, borderRight: 0 }}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* Desktop Sider */}
      {!isMobile && (
        <Sider
          width={240}
          style={{
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
            background: '#001529',
            height: '100vh',
            position: 'sticky',
            top: 0,
            left: 0
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Menu Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={270}
        styles={{ body: { padding: 0, background: '#001529' } }}
        headerStyle={{ display: 'none' }}
      >
        {sidebarContent}
      </Drawer>

      <Layout style={{ flex: 1, width: '100%', minWidth: 0 }}>
        <Header style={{
          background: '#fff',
          padding: isMobile ? '0 12px' : '0 24px',
          height: '64px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          zIndex: 10,
          position: 'sticky',
          top: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isMobile && (
              <Button
                type="default"
                icon={<MenuOutlined style={{ fontSize: '18px', color: '#001529' }} />}
                onClick={() => setMobileDrawerOpen(true)}
                style={{
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderColor: '#d9d9d9'
                }}
              />
            )}
            <Typography.Text strong style={{ fontSize: isMobile ? '14px' : '15px', color: '#001529' }}>
              ⚙️ <span className={isMobile ? 'mobile-hide-text' : ''}>Admin Console</span>
            </Typography.Text>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              style={{ borderRadius: '6px', display: 'flex', alignItems: 'center' }}
              size={isMobile ? 'small' : 'default'}
            >
              <span className={isMobile ? 'mobile-hide-text' : ''}>Storefront</span>
            </Button>

            <Dropdown menu={{ items: adminProfileDropdownItems }} trigger={['click']} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f5f5f5',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  border: '1px solid #e8e8e8',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <Typography.Text strong style={{ fontSize: '13px', color: '#141414', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {admin?.username || 'Admin'}
                </Typography.Text>
                <DownOutlined style={{ fontSize: '10px', color: '#8c8c8c' }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{
          margin: isMobile ? '8px' : '16px',
          padding: isMobile ? '12px' : '20px',
          background: '#fff',
          borderRadius: '12px',
          minHeight: '280px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflowX: 'auto',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Change Password Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
            <span>Change Admin Password</span>
          </div>
        }
        open={passwordModalOpen}
        onCancel={() => { setPasswordModalOpen(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
        style={{ borderRadius: '12px' }}
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>
          Enter your current password and set your new password below.
        </Typography.Paragraph>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePassword}
          requiredMark={false}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter current password"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter new password (min 6 characters)"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Re-enter new password"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <Button
              onClick={() => { setPasswordModalOpen(false); form.resetFields(); }}
              style={{ borderRadius: '6px' }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={changingPassword}
              style={{ borderRadius: '6px', background: '#001529', borderColor: '#001529' }}
            >
              Update Password
            </Button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminLayout;
