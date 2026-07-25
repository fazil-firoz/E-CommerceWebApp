import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message, Space, Switch, Divider, Spin, Alert, Tooltip } from 'antd';
import {
  CrownOutlined, LockOutlined, UnlockOutlined, SaveOutlined,
  AppstoreOutlined, SettingOutlined, WhatsAppOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, StopOutlined, ReloadOutlined, TagOutlined
} from '@ant-design/icons';
import { superAdminApi } from '../../api/superAdminApi';

const { Title, Text, Paragraph } = Typography;

const SuperAdminManagement = () => {
  const [authForm] = Form.useForm();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loadingControls, setLoadingControls] = useState(false);
  const [savingControls, setSavingControls] = useState(false);

  // Control state
  const [controls, setControls] = useState({
    isShopSettingsMenuEnabled: true,
    isShipmentSettingsMenuEnabled: true,
    isInvoiceSettingsMenuEnabled: true,
    isTaxSettingsMenuEnabled: true,
    isReportsMenuEnabled: true,
    isWhatsAppFloatingWidgetEnabled: true
  });

  const fetchControls = async () => {
    setLoadingControls(true);
    try {
      const res = await superAdminApi.getControl();
      if (res.success && res.data) {
        setControls(res.data);
      }
    } catch (err) {
      message.error('Failed to load Super Admin control flags');
    } finally {
      setLoadingControls(false);
    }
  };

  useEffect(() => {
    const verified = sessionStorage.getItem('super_admin_verified');
    if (verified === 'true') {
      setIsUnlocked(true);
      fetchControls();
    }
  }, []);

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
        setControls(res.data);
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
      )}
    </Space>
  );
};

export default SuperAdminManagement;
