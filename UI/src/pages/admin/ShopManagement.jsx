import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, Row, Col, Typography, Upload, message, Space, Divider, Spin, Modal } from 'antd';
import { ShopOutlined, PhoneOutlined, EnvironmentOutlined, FileTextOutlined, ShareAltOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined, LockOutlined, UnlockOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import { shopApi } from '../../api/shopApi';
import { adminApi } from '../../api/adminApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ShopManagement = () => {
  const [form] = Form.useForm();
  const [authForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Security Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if session is already unlocked
    const unlocked = sessionStorage.getItem('super_admin_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
      fetchShopDetails();
    } else {
      setIsUnlocked(false);
      setAuthModalOpen(true);
    }
  }, []);

  const handleSuperAdminAuth = async () => {
    try {
      const values = await authForm.validateFields();
      setVerifying(true);

      // Verify credentials against Super Admin endpoint
      const response = await shopApi.verifySuperAdmin({
        username: values.username,
        password: values.password
      });

      if (response.success) {
        sessionStorage.setItem('super_admin_unlocked', 'true');
        setIsUnlocked(true);
        setAuthModalOpen(false);
        message.success('Super Admin access granted!');
        fetchShopDetails();
      } else {
        message.error(response.message || 'Invalid Super Admin credentials');
      }
    } catch (err) {
      if (err?.message) message.error(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('super_admin_unlocked');
    setIsUnlocked(false);
    authForm.resetFields();
    setAuthModalOpen(true);
  };

  const handleLogoUpload = async (file, isFavicon = false) => {
    const formData = new FormData();
    formData.append('file', file);

    if (isFavicon) setUploadingFavicon(true);
    else setUploadingLogo(true);

    try {
      const response = await shopApi.uploadLogo(formData);
      if (response.success && response.data) {
        const path = response.data;
        if (isFavicon) {
          setFaviconUrl(path);
          form.setFieldValue('faviconUrl', path);
        } else {
          setLogoUrl(path);
          form.setFieldValue('logoUrl', path);
        }
        message.success(`${isFavicon ? 'Favicon' : 'Logo'} uploaded to wwwroot/uploads/shopdata successfully!`);
      } else {
        message.error(response.message || 'Upload failed');
      }
    } catch (err) {
      message.error('Image upload failed');
    } finally {
      if (isFavicon) setUploadingFavicon(false);
      else setUploadingLogo(false);
    }
    return false; // Prevent automatic XHR upload from Antd
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        logoUrl: logoUrl,
        faviconUrl: faviconUrl
      };

      const response = await shopApi.updateSettings(payload);
      if (response.success) {
        message.success('Shop details & branding saved successfully!');
        if (response.data) {
          form.setFieldsValue(response.data);
        }
      } else {
        message.error(response.message || 'Failed to save shop settings');
      }
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Loading Shop Master Settings..." />
      </div>
    );
  }

  const items = [
    {
      key: 'identity',
      label: <span><ShopOutlined /> Store Identity & Branding</span>,
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <Form.Item name="shopName" label="Shop / Store Name" rules={[{ required: true, message: 'Please enter shop name' }]}>
              <Input size="large" placeholder="e.g. ToyShop Wonderland" />
            </Form.Item>
            <Form.Item name="motto" label="Tagline / Motto">
              <Input.TextArea rows={2} placeholder="e.g. Bringing Smiles & Pure Joy to Every Kid!" />
            </Form.Item>
          </Col>

          <Col xs={24} md={10}>
            <Card title="Store Logo & Favicon" size="small" style={{ background: '#fafafa', borderRadius: '12px' }}>
              <div style={{ marginBottom: '20px' }}>
                <Text strong>Store Header Logo:</Text>
                <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {logoUrl ? (
                    <img 
                      src={resolveProductImageUrl(logoUrl)} 
                      alt="Shop Logo" 
                      style={{ maxHeight: '60px', maxWidth: '160px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #d9d9d9', padding: '4px', background: '#fff' }} 
                    />
                  ) : (
                    <div style={{ width: '100px', height: '50px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontSize: '11px', color: '#999' }}>No Logo</div>
                  )}
                  <Upload beforeUpload={(file) => handleLogoUpload(file, false)} showUploadList={false}>
                    <Button icon={<UploadOutlined />} loading={uploadingLogo} size="small">
                      Upload Logo
                    </Button>
                  </Upload>
                </div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Saved to: <code>wwwroot/uploads/shopdata/</code></Text>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div>
                <Text strong>Browser Favicon Icon:</Text>
                <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {faviconUrl ? (
                    <img 
                      src={resolveProductImageUrl(faviconUrl)} 
                      alt="Favicon" 
                      style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #d9d9d9', padding: '2px', background: '#fff' }} 
                    />
                  ) : (
                    <div style={{ width: '32px', height: '32px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '10px', color: '#999' }}>Icon</div>
                  )}
                  <Upload beforeUpload={(file) => handleLogoUpload(file, true)} showUploadList={false}>
                    <Button icon={<UploadOutlined />} loading={uploadingFavicon} size="small">
                      Upload Favicon
                    </Button>
                  </Upload>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'contact',
      label: <span><PhoneOutlined /> Contact Numbers & Emails</span>,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item name="email1" label="Primary Email" rules={[{ required: true, message: 'Please enter primary email' }]}>
              <Input placeholder="contact@toyshop.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="email2" label="Secondary / Sales Email">
              <Input placeholder="sales@toyshop.com" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="phone1" label="Primary Phone / Helpline" rules={[{ required: true, message: 'Please enter primary phone' }]}>
              <Input placeholder="+91 98765 43210" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="phone2" label="Secondary Phone">
              <Input placeholder="+91 98765 43211" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="phone3" label="Landline / Support Phone">
              <Input placeholder="+91 484 2345678" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="whatsAppNumber" label="WhatsApp Business Number">
              <Input placeholder="+91 98765 43210" />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: 'address',
      label: <span><EnvironmentOutlined /> Store Address</span>,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item name="addressLine1" label="Address Line 1 (Building / Street)" rules={[{ required: true, message: 'Please enter address line 1' }]}>
              <Input placeholder="e.g. 123 Fun & Games Street" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="addressLine2" label="Address Line 2 (Area / Landmark)">
              <Input placeholder="e.g. Near Central Park, MG Road" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please enter city' }]}>
              <Input placeholder="e.g. Kochi" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please enter state' }]}>
              <Input placeholder="e.g. Kerala" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="pincode" label="Pincode / ZIP" rules={[{ required: true, message: 'Please enter pincode' }]}>
              <Input placeholder="e.g. 682001" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="country" label="Country">
              <Input placeholder="India" />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: 'tax',
      label: <span><FileTextOutlined /> Tax & Registration</span>,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={8}>
            <Form.Item name="gstNo" label="GSTIN / GST Number">
              <Input placeholder="32ABCDE1234F1Z5" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="regNo" label="Business Reg. Number">
              <Input placeholder="REG-TOY-2026-99" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="panNo" label="PAN Number">
              <Input placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: 'social',
      label: <span><ShareAltOutlined /> Social Links & Opening Hours</span>,
      children: (
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item name="facebookUrl" label="Facebook Profile URL">
              <Input placeholder="https://facebook.com/yourtoyshop" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="instagramUrl" label="Instagram Handle URL">
              <Input placeholder="https://instagram.com/yourtoyshop" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="twitterUrl" label="Twitter / X URL">
              <Input placeholder="https://twitter.com/yourtoyshop" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="youTubeUrl" label="YouTube Channel URL">
              <Input placeholder="https://youtube.com/c/yourtoyshop" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24}>
            <Form.Item name="openingHours" label="Business Working Hours">
              <Input placeholder="Mon - Sat: 9:00 AM - 9:00 PM | Sun: Closed" />
            </Form.Item>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Super Admin Security Authentication Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
            <span>Super Admin Security Verification</span>
          </Space>
        }
        open={authModalOpen}
        onCancel={() => {
          setAuthModalOpen(false);
          navigate('/admin/orders');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setAuthModalOpen(false);
            navigate('/admin/orders');
          }}>
            Cancel
          </Button>,
          <Button
            key="unlock"
            type="primary"
            icon={<UnlockOutlined />}
            loading={verifying}
            onClick={handleSuperAdminAuth}
            style={{ background: '#001529', borderColor: '#001529' }}
          >
            Authenticate & Unlock
          </Button>
        ]}
        maskClosable={false}
        centered
        width={420}
      >
        <div style={{ padding: '12px 0 20px' }}>
          <Text type="secondary">
            Entering the <strong>Shop Master Settings</strong> screen requires Super Admin authentication.
            Please enter your administrator username & password to proceed.
          </Text>
        </div>
        <Form form={authForm} layout="vertical" onFinish={handleSuperAdminAuth}>
          <Form.Item
            name="username"
            label="Super Admin Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Username" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Super Admin Password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />} placeholder="Password" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Main Master Screen Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size={12}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')} style={{ borderRadius: '6px' }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Shop Details Master Screen</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>Configure store branding, contact info, tax registration, and expanded address settings.</Text>
          </div>
        </Space>
        <Space size={12}>
          <Button 
            icon={<LockOutlined />} 
            onClick={handleLock}
            danger
            style={{ borderRadius: '8px' }}
          >
            Lock Screen
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            loading={saving}
            disabled={!isUnlocked}
            onClick={handleSave}
            style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529', height: '40px', padding: '0 24px' }}
          >
            Save All Changes
          </Button>
        </Space>
      </div>

      {isUnlocked ? (
        <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Form form={form} layout="vertical">
            <Tabs defaultActiveKey="identity" items={items} />
          </Form>
        </Card>
      ) : (
        <Card style={{ borderRadius: '12px', textAlign: 'center', padding: '60px 0' }}>
          <Space direction="vertical" size={16}>
            <LockOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            <Title level={4} style={{ margin: 0 }}>Super Admin Security Lock Active</Title>
            <Text type="secondary">This screen is locked for security. Click Unlock to authenticate.</Text>
            <Button type="primary" icon={<UnlockOutlined />} onClick={() => setAuthModalOpen(true)} style={{ background: '#001529' }}>
              Unlock Master Settings
            </Button>
          </Space>
        </Card>
      )}
    </Space>
  );
};

export default ShopManagement;
