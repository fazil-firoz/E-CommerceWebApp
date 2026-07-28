import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message, Space, Switch, Divider, Spin, Alert, Tooltip, Modal, Tag } from 'antd';
import {
  CrownOutlined, LockOutlined, UnlockOutlined, SaveOutlined,
  AppstoreOutlined, SettingOutlined, WhatsAppOutlined, SafetyCertificateOutlined, ControlOutlined,
  CheckCircleOutlined, StopOutlined, ReloadOutlined, TagOutlined, PrinterOutlined, HeartOutlined,
  DeleteOutlined, WarningOutlined, ExclamationCircleOutlined, BgColorsOutlined, StarOutlined
} from '@ant-design/icons';
import { superAdminApi } from '../../api/superAdminApi';
import { themeApi } from '../../api/themeApi';

const { Title, Text, Paragraph } = Typography;

const SuperAdminManagement = () => {
  const [authForm] = Form.useForm();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('super_admin_verified') === 'true';
  });
  const [verifying, setVerifying] = useState(false);
  const [loadingControls, setLoadingControls] = useState(false);
  const [savingControls, setSavingControls] = useState(false);

  // Theme Management State
  const [themes, setThemes] = useState([
    {
      id: 1,
      themeName: 'Default Store Theme (Original)',
      themeKey: 'default',
      primaryColor: '#1890ff',
      secondaryColor: '#722ed1',
      backgroundColor: '#f5f7fa',
      accentColor: '#ff4d4f',
      isActive: true
    },
    {
      id: 2,
      themeName: 'Kawaii Cute Pink Store',
      themeKey: 'kawaii',
      primaryColor: '#ff6584',
      secondaryColor: '#ff85c0',
      backgroundColor: '#fff5f7',
      accentColor: '#ff2a6d',
      isActive: false
    },
    {
      id: 3,
      themeName: 'Fancy Dress & Fashion Boutique',
      themeKey: 'fancy_dress',
      primaryColor: '#d47a8d',
      secondaryColor: '#e8b4b8',
      backgroundColor: '#fdfbf7',
      accentColor: '#9b2c2c',
      isActive: false
    },
    {
      id: 4,
      themeName: 'Luxe Emerald & Gold Store',
      themeKey: 'luxe_emerald',
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      backgroundColor: '#f0fdf4',
      accentColor: '#d97706',
      isActive: false
    }
  ]);
  const [activatingThemeId, setActivatingThemeId] = useState(null);

  // Reset Database State
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [resetting, setResetting] = useState(false);

  // Default controls fallback
  const defaultControls = {
    isShopSettingsMenuEnabled: true,
    isUIControlMenuEnabled: true,
    isShipmentSettingsMenuEnabled: true,
    isInvoiceSettingsMenuEnabled: true,
    isTaxSettingsMenuEnabled: true,
    isReportsMenuEnabled: true,
    isCouponMenuEnabled: true,
    isWhatsAppFloatingWidgetEnabled: true,
    isPrintInvoiceEnabled: true,
    isProductBadgeEnabled: true,
    isWishlistEnabled: true,
    isHeroBannerEnabled: true,
    isCategoriesSectionEnabled: true,
    isFeaturedProductsEnabled: true,
    isNewArrivalsEnabled: true,
    isBestSellersEnabled: true,
    isPromoBannerEnabled: true,
    isWhyChooseUsEnabled: true,
    isMarqueeEnabled: true,
    isKawaiiScrollStripEnabled: true,
    isBadgeRibbonEnabled: true
  };

  // Control state
  const [controls, setControls] = useState(defaultControls);

  const getCtrl = (key) => {
    if (!controls) return true;
    return controls[key] !== false;
  };

  const fetchControls = async () => {
    setLoadingControls(true);
    try {
      const res = await superAdminApi.getControl();
      if (res.success && res.data) {
        setControls({ ...defaultControls, ...res.data });
      }
    } catch (err) {
      console.error('Failed to load Super Admin control flags', err);
    } finally {
      setLoadingControls(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const res = await themeApi.getAllThemes();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setThemes(res.data);
      }
    } catch (err) {
      console.error('Failed to load shop themes', err);
    }
  };

  const handleSelectTheme = async (themeId) => {
    setActivatingThemeId(themeId);
    try {
      const res = await themeApi.setActiveTheme(themeId);
      if (res.success) {
        message.success(res.message || 'Theme activated successfully!');
        window.dispatchEvent(new Event('shopThemeUpdated'));
        fetchThemes();
      } else {
        message.error(res.message || 'Failed to activate theme');
      }
    } catch (err) {
      message.error('Error setting shop theme');
    } finally {
      setActivatingThemeId(null);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchControls();
      fetchThemes();
    }
  }, [isUnlocked]);

  const handleLogin = async () => {
    try {
      const values = await authForm.validateFields();
      setVerifying(true);
      const res = await superAdminApi.verify(values.username, values.password);
      if (res.success) {
        sessionStorage.setItem('super_admin_verified', 'true');
        setIsUnlocked(true);
        message.success('Super Admin verification successful!');
        fetchControls();
        fetchThemes();
      } else {
        message.error(res.message || 'Invalid Super Admin credentials');
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('super_admin_verified');
    setIsUnlocked(false);
    authForm.resetFields();
    message.info('Super Admin session locked');
  };

  const handleSaveControls = async () => {
    setSavingControls(true);
    try {
      const res = await superAdminApi.updateControl(controls);
      if (res.success && res.data) {
        setControls({ ...defaultControls, ...res.data });
        message.success('Super Admin control settings saved successfully!');
        // Dispatch custom event so AdminLayout & CustomerLayout react immediately
        window.dispatchEvent(new Event('superAdminControlUpdated'));
      } else {
        message.error(res.message || 'Failed to update controls');
      }
    } catch (err) {
      message.error('Error saving control settings');
    } finally {
      setSavingControls(false);
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmationInput.trim().toUpperCase() !== 'RESET DATABASE') {
      message.error('Please type RESET DATABASE exactly to confirm.');
      return;
    }

    setResetting(true);
    try {
      const res = await superAdminApi.resetDatabase(resetConfirmationInput.trim());
      if (res.success) {
        setIsResetModalVisible(false);
        setResetConfirmationInput('');
        Modal.success({
          title: '🎉 Factory Reset Complete',
          content: 'All Products, Categories, Orders, Customers, Coupons, and Financial Records have been permanently purged. The system database is fresh and ready for a new client/company setup.',
          onOk: () => {
            fetchControls();
            window.dispatchEvent(new Event('superAdminControlUpdated'));
          }
        });
      } else {
        message.error(res.message || 'Database reset failed');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to execute database reset');
    } finally {
      setResetting(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div style={{ maxWidth: '460px', margin: '40px auto 0' }}>
        <Card style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #722ed1, #1890ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 6px 16px rgba(114, 46, 209, 0.3)'
            }}>
              <CrownOutlined style={{ fontSize: '32px', color: '#fff' }} />
            </div>
            <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Super Admin Access Required</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Enter Super Admin credentials to unlock system menu and feature controllers.
            </Text>
          </div>

          <Form form={authForm} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              name="username"
              label="Super Admin Username"
              rules={[{ required: true, message: 'Please enter Super Admin username' }]}
            >
              <Input size="large" prefix={<CrownOutlined style={{ color: '#722ed1' }} />} placeholder="e.g. superadmin" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Super Admin Password"
              rules={[{ required: true, message: 'Please enter Super Admin password' }]}
            >
              <Input.Password size="large" prefix={<LockOutlined style={{ color: '#722ed1' }} />} placeholder="Enter password" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={verifying}
              icon={<UnlockOutlined />}
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #722ed1, #1890ff)',
                borderColor: 'transparent',
                fontWeight: 700,
                height: '44px'
              }}
            >
              Verify & Unlock Console
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CrownOutlined style={{ color: '#722ed1' }} /> Super Admin Control Console
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Manage core system menu visibilities and feature access switches.
          </Text>
        </div>

        <Space size={12}>
          <Button icon={<ReloadOutlined />} onClick={fetchControls} loading={loadingControls}>
            Refresh
          </Button>
          <Button icon={<LockOutlined />} onClick={handleLock} danger style={{ borderRadius: '8px' }}>
            Lock Session
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={savingControls}
            onClick={handleSaveControls}
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #722ed1, #1890ff)',
              borderColor: 'transparent',
              fontWeight: 700
            }}
          >
            Save Control Flags
          </Button>
        </Space>
      </div>

      {loadingControls ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="Loading Super Admin controls..." />
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
          {/* Section 1: Menu Controller */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AppstoreOutlined style={{ color: '#1890ff' }} /> Section 1: Menu Controllers
                </span>
              }
              style={{ borderRadius: '16px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Paragraph type="secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>
                Toggle menu visibilities for regular admins. When disabled, the menu will be completely hidden from the navigation sidebar and blocked from access.
              </Paragraph>

              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* Shop Settings Menu Toggle */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isShopSettingsMenuEnabled ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <SettingOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                      <Text strong style={{ fontSize: '14px' }}>Shop Settings Menu</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Controls `/admin/shop-settings` menu visibility
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isShopSettingsMenuEnabled}
                    onChange={(checked) => setControls({ ...controls, isShopSettingsMenuEnabled: checked })}
                  />
                </div>

                {/* UI Control Menu Toggle */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isUIControlMenuEnabled !== false ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <ControlOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                      <Text strong style={{ fontSize: '14px' }}>UI Control Menu</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Controls `/admin/ui-control` menu visibility (Homepage Hero & Banners)
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isUIControlMenuEnabled !== false}
                    onChange={(checked) => setControls({ ...controls, isUIControlMenuEnabled: checked })}
                  />
                </div>

                {/* Shipment Settings Menu Toggle */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isShipmentSettingsMenuEnabled ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <AppstoreOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                      <Text strong style={{ fontSize: '14px' }}>Shipment Settings Menu</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Controls `/admin/shipment-settings` menu visibility
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isShipmentSettingsMenuEnabled}
                    onChange={(checked) => setControls({ ...controls, isShipmentSettingsMenuEnabled: checked, isAppControlMenuEnabled: checked })}
                  />
                </div>

                {/* Invoice Settings Menu Toggle */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isInvoiceSettingsMenuEnabled ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <SettingOutlined style={{ fontSize: '18px', color: '#fa8c16' }} />
                      <Text strong style={{ fontSize: '14px' }}>Invoice Settings Menu</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Controls `/admin/invoice-settings` menu visibility
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isInvoiceSettingsMenuEnabled}
                    onChange={(checked) => setControls({ ...controls, isInvoiceSettingsMenuEnabled: checked })}
                  />
                </div>

                {/* Tax Settings Menu Toggle */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isTaxSettingsMenuEnabled !== false ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <SettingOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
                      <Text strong style={{ fontSize: '14px' }}>Tax Settings Menu</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Controls `/admin/tax-settings` menu visibility
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isTaxSettingsMenuEnabled !== false}
                    onChange={(checked) => setControls({ ...controls, isTaxSettingsMenuEnabled: checked })}
                  />
                </div>

                {/* Reports Menu Toggle */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isReportsMenuEnabled !== false ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <SettingOutlined style={{ fontSize: '18px', color: '#722ed1' }} />
                      <Text strong style={{ fontSize: '14px' }}>Reports Menu</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Controls `/admin/reports` menu visibility
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isReportsMenuEnabled !== false}
                    onChange={(checked) => setControls({ ...controls, isReportsMenuEnabled: checked })}
                  />
                </div>

                {/* Coupon Code Menu Toggle */}
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isCouponMenuEnabled !== false ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <TagOutlined style={{ fontSize: '18px', color: '#722ed1' }} />
                      <Text strong style={{ fontSize: '14px' }}>Coupon Code Menu</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Controls `/admin/coupons` menu visibility
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isCouponMenuEnabled !== false}
                    onChange={(checked) => setControls({ ...controls, isCouponMenuEnabled: checked })}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          {/* Section 2: Feature Access Controller */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SafetyCertificateOutlined style={{ color: '#52c41a' }} /> Section 2: Feature Access Controllers
                </span>
              }
              style={{ borderRadius: '16px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Paragraph type="secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>
                Enable or disable active customer storefront features dynamically without restarting the server.
              </Paragraph>

              <Space direction="vertical" size={20} style={{ width: '100%' }}>
                {/* WhatsApp Floating Icon Toggle */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isWhatsAppFloatingWidgetEnabled ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <WhatsAppOutlined style={{ fontSize: '20px', color: '#25D366' }} />
                      <Text strong style={{ fontSize: '15px' }}>WhatsApp Floating Widget</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Shows or hides the floating WhatsApp button on storefront pages
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isWhatsAppFloatingWidgetEnabled}
                    onChange={(checked) => setControls({ ...controls, isWhatsAppFloatingWidgetEnabled: checked })}
                  />
                </div>

                {/* Print Purchase Invoice Button Toggle */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isPrintInvoiceEnabled !== false ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <PrinterOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                      <Text strong style={{ fontSize: '15px' }}>Print Purchase Invoice Button</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Enables or disables the Print Invoice button inside Order Management
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isPrintInvoiceEnabled !== false}
                    onChange={(checked) => setControls({ ...controls, isPrintInvoiceEnabled: checked })}
                  />
                </div>

                {/* Product Badge & Labels Dropdown Toggle */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isProductBadgeEnabled !== false ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <TagOutlined style={{ fontSize: '20px', color: '#fa8c16' }} />
                      <Text strong style={{ fontSize: '15px' }}>Product Badge / Label Dropdown</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Enables or disables product badge selection (New, Best Seller, Popular, Limited Stock) in Product Creation
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isProductBadgeEnabled !== false}
                    onChange={(checked) => setControls({ ...controls, isProductBadgeEnabled: checked })}
                  />
                </div>

                {/* Wishlist Feature Toggle */}
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  background: controls.isWishlistEnabled !== false ? '#f6ffed' : '#fff1f0',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Space align="center" size={8}>
                      <HeartOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                      <Text strong style={{ fontSize: '15px' }}>Wishlist Feature</Text>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Enables or disables customer wishlist heart icons on product cards and header wishlist counter
                      </Text>
                    </div>
                  </div>

                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    checked={controls.isWishlistEnabled !== false}
                    onChange={(checked) => setControls({ ...controls, isWishlistEnabled: checked })}
                  />
                </div>

                <Alert
                  type="info"
                  showIcon
                  message="Extensible Super Admin Control Table"
                  description="Future system modules, payment gateways, and promotion features can be linked directly to this SuperAdminControl entity."
                />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Section 3: Homepage UI Section Controller */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card
              title={
                <span style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SettingOutlined style={{ color: '#ff4d4f' }} /> Section 3: Homepage UI Section Controller
                </span>
              }
              style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Paragraph type="secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>
                Super Admin control to dynamically show or hide individual layout sections on the customer Homepage.
              </Paragraph>

              <Row gutter={[16, 16]}>
                {[
                  { key: 'isHeroBannerEnabled', label: 'Hero Banner Section', desc: 'Main interactive hero showcase with glowing call-to-action' },
                  { key: 'isMarqueeEnabled', label: 'Infinite Marquee Ticker Ribbon', desc: 'Scrolling ticker ribbon below Hero Banner with promo text & emojis' },
                  { key: 'isCategoriesSectionEnabled', label: 'Categories Section', desc: 'Grid of toy categories with icon cards and item counts' },
                  { key: 'isFeaturedProductsEnabled', label: 'Featured Products Section', desc: 'Curated featured products with ribbon badges' },
                  { key: 'isNewArrivalsEnabled', label: 'New Arrivals Section', desc: 'Freshly added items grid' },
                  { key: 'isBestSellersEnabled', label: 'Best Sellers Section', desc: 'Top selling popular toys grid' },
                  { key: 'isPromoBannerEnabled', label: 'Promo Banner Section', desc: 'Promotional discount campaign banner' },
                  { key: 'isWhyChooseUsEnabled', label: 'Why Choose Us Section', desc: 'Store trust badges (Fast Shipping, Safe Toys, 24/7 Support)' },
                  { key: 'isKawaiiScrollStripEnabled', label: '🎀 Kawaii 3D Scroll Strip', desc: 'Floating 3D emoji chip strip scrolling between navbar and ribbon' },
                  { key: 'isBadgeRibbonEnabled', label: '✨ Badge Ribbon Ticker', desc: '3-second rotating tagline ribbon below the kawaii strip' }
                ].map((sec) => (
                  <Col xs={24} sm={12} lg={8} key={sec.key}>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0',
                      background: getCtrl(sec.key) ? '#f6ffed' : '#fff1f0',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div>
                        <Text strong style={{ fontSize: '14px', display: 'block' }}>{sec.label}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{sec.desc}</Text>
                      </div>
                      <Switch
                        checkedChildren={<CheckCircleOutlined />}
                        unCheckedChildren={<StopOutlined />}
                        checked={getCtrl(sec.key)}
                        onChange={(checked) => setControls((prev) => ({ ...(prev || defaultControls), [sec.key]: checked }))}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Section 4: Shop Theme Selector & Multi-Client Styling Controller */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card
              title={
                <span style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BgColorsOutlined style={{ color: '#ff6584' }} /> Section 4: Shop Theme Selector (Multi-Client Brands)
                </span>
              }
              style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <Paragraph type="secondary" style={{ fontSize: '13px', marginBottom: '20px' }}>
                Select the active shop brand theme. Changes apply dynamically across the entire customer store area without touching the Admin panel.
              </Paragraph>

              <Row gutter={[20, 20]}>
                {(themes || []).map((t) => (
                  <Col xs={24} sm={12} lg={8} key={t.id}>
                    <Card
                      style={{
                        borderRadius: '16px',
                        border: t.isActive ? `2px solid ${t.primaryColor}` : '1px solid #e2e8f0',
                        background: t.isActive ? '#fff' : '#fafafa',
                        boxShadow: t.isActive ? `0 8px 24px ${t.primaryColor}25` : '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'all 0.3s ease'
                      }}
                      styles={{ body: { padding: '20px' } }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <Text strong style={{ fontSize: '16px', display: 'block', color: '#0f172a' }}>{t.themeName}</Text>
                          <Tag style={{ borderRadius: '10px', marginTop: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                            {t.themeKey}
                          </Tag>
                        </div>
                        {t.isActive ? (
                          <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 700 }}>
                            ACTIVE
                          </Tag>
                        ) : null}
                      </div>

                      {/* Color Swatch Preview */}
                      <div style={{ background: t.backgroundColor, padding: '12px', borderRadius: '12px', border: '1px solid #f0f0f0', marginBottom: '16px' }}>
                        <Text style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Palette Preview:</Text>
                        <Space size={8}>
                          <Tooltip title={`Primary: ${t.primaryColor}`}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.primaryColor, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                          </Tooltip>
                          <Tooltip title={`Secondary: ${t.secondaryColor}`}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.secondaryColor, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                          </Tooltip>
                          <Tooltip title={`Accent: ${t.accentColor}`}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.accentColor, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
                          </Tooltip>
                          <Tooltip title={`Background: ${t.backgroundColor}`}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.backgroundColor, border: '1px solid #ccc', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                          </Tooltip>
                        </Space>
                      </div>

                      <Button
                        type={t.isActive ? "default" : "primary"}
                        block
                        loading={activatingThemeId === t.id}
                        disabled={t.isActive}
                        onClick={() => handleSelectTheme(t.id)}
                        style={{
                          borderRadius: '10px',
                          fontWeight: 700,
                          height: '38px',
                          background: t.isActive ? '#f5f5f5' : t.primaryColor,
                          borderColor: t.isActive ? '#d9d9d9' : t.primaryColor,
                          color: t.isActive ? '#8c8c8c' : '#ffffff'
                        }}
                      >
                        {t.isActive ? 'Current Theme' : 'Activate Theme'}
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Section 5: Danger Zone & System Factory Reset */}
        <Row style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card
              style={{
                borderRadius: '16px',
                border: '1px solid #ffccc7',
                background: '#fff2f0',
                boxShadow: '0 4px 12px rgba(255, 77, 79, 0.08)'
              }}
              title={
                <Space>
                  <WarningOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                  <Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
                    Danger Zone — Factory Database Reset
                  </Text>
                </Space>
              }
            >
              <Row align="middle" justify="space-between" gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <Space direction="vertical" size={4}>
                    <Text strong style={{ fontSize: '15px', color: '#cf1322' }}>
                      Clear All Database Tables for New Company / Client Handover
                    </Text>
                    <Text type="secondary" style={{ fontSize: '13px', color: '#595959' }}>
                      This action will permanently purge all <strong>Products, Categories, Orders, Order Items, Customers, Saved Addresses, Payments, Coupons, Financial Reports,</strong> and <strong>Shop Settings</strong>. 
                      Super Admin login credentials and system menu control flags remain preserved.
                    </Text>
                  </Space>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setResetConfirmationInput('');
                      setIsResetModalVisible(true);
                    }}
                    style={{
                      borderRadius: '8px',
                      fontWeight: 700,
                      boxShadow: '0 4px 10px rgba(255, 77, 79, 0.3)'
                    }}
                  >
                    Reset All Tables
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Factory Reset Modal */}
        <Modal
          title={
            <Space align="center">
              <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '22px' }} />
              <Text strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
                Confirm Factory Database Reset
              </Text>
            </Space>
          }
          open={isResetModalVisible}
          onCancel={() => {
            if (!resetting) {
              setIsResetModalVisible(false);
              setResetConfirmationInput('');
            }
          }}
          footer={[
            <Button
              key="cancel"
              disabled={resetting}
              onClick={() => {
                setIsResetModalVisible(false);
                setResetConfirmationInput('');
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              danger
              loading={resetting}
              disabled={resetConfirmationInput.trim().toUpperCase() !== 'RESET DATABASE'}
              icon={<DeleteOutlined />}
              onClick={handleResetDatabase}
              style={{ fontWeight: 700 }}
            >
              Confirm & Purge Database
            </Button>
          ]}
        >
          <Space direction="vertical" size={16} style={{ width: '100%', marginTop: '12px' }}>
            <Alert
              type="error"
              showIcon
              message="CRITICAL WARNING: Irreversible Action"
              description="You are about to wipe all business data from the database. Once confirmed, this data CANNOT be recovered!"
            />

            <div style={{ background: '#fafafa', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <Text strong style={{ display: 'block', marginBottom: '6px' }}>Tables to be purged:</Text>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#595959', lineHeight: '1.6' }}>
                <li>Products & Product Images</li>
                <li>Categories & Sub-collections</li>
                <li>Orders & Order Items Breakdown</li>
                <li>Customer Records & Saved Addresses</li>
                <li>Coupons & Discount History</li>
                <li>Payment Transactions & Sales Reports</li>
                <li>Shop Settings & Store Profile Details</li>
              </ul>
            </div>

            <div>
              <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                To prevent accidental deletion, type <Text code style={{ color: '#ff4d4f', fontWeight: 700 }}>RESET DATABASE</Text> below:
              </Text>
              <Input
                placeholder="Type RESET DATABASE here..."
                value={resetConfirmationInput}
                onChange={(e) => setResetConfirmationInput(e.target.value)}
                size="large"
                style={{
                  borderRadius: '8px',
                  borderColor: resetConfirmationInput.trim().toUpperCase() === 'RESET DATABASE' ? '#52c41a' : undefined
                }}
              />
            </div>
          </Space>
        </Modal>
        </>
      )}
    </Space>
  );
};

export default SuperAdminManagement;
