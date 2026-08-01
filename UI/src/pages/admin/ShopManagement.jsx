import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, Row, Col, Typography, Upload, message, Space, Divider, Spin, Grid } from 'antd';
import { ShopOutlined, PhoneOutlined, EnvironmentOutlined, FileTextOutlined, ShareAltOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { shopApi } from '../../api/shopApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ShopManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const screens = useBreakpoint();
  const isMobile = screens.lg === false || (screens.xs && !screens.lg);

  const navigate = useNavigate();

  const fetchShopDetails = async () => {
    setLoading(true);
    try {
      const response = await shopApi.getSettings();
      if (response.success && response.data) {
        const data = response.data;
        form.setFieldsValue(data);
        setLogoUrl(data.logoUrl || '');
        setFaviconUrl(data.faviconUrl || '');
      }
    } catch (err) {
      message.error('Failed to load shop settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, []);

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
        message.success(`${isFavicon ? 'Favicon' : 'Logo'} uploaded successfully!`);
      } else {
        message.error(response.message || 'Upload failed');
      }
    } catch (err) {
      message.error('Image upload failed');
    } finally {
      if (isFavicon) setUploadingFavicon(false);
      else setUploadingFavicon(false);
    }
    return false;
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
      label: <span><ShopOutlined /> Store Identity</span>,
      children: (
        <Row gutter={[20, 20]}>
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
                <Text strong style={{ display: 'block' }}>Store Header Logo:</Text>
                <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {logoUrl ? (
                    <img 
                      src={resolveProductImageUrl(logoUrl)} 
                      alt="Shop Logo" 
                      style={{ maxHeight: '50px', maxWidth: '140px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #d9d9d9', padding: '4px', background: '#fff' }} 
                    />
                  ) : (
                    <div style={{ width: '90px', height: '44px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontSize: '11px', color: '#999' }}>No Logo</div>
                  )}
                  <Upload beforeUpload={(file) => handleLogoUpload(file, false)} showUploadList={false}>
                    <Button icon={<UploadOutlined />} loading={uploadingLogo} size="small">
                      Upload Logo
                    </Button>
                  </Upload>
                </div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', wordBreak: 'break-all' }}>Saved to: <code>wwwroot/uploads/shopdata/</code></Text>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <div>
                <Text strong style={{ display: 'block' }}>Browser Favicon Icon:</Text>
                <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
      label: <span><PhoneOutlined /> Contact & Emails</span>,
      children: (
        <Row gutter={[16, 16]}>
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
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="phone1" label="Primary Phone / Helpline" rules={[{ required: true, message: 'Please enter primary phone' }]}>
              <Input placeholder="+91 98765 43210" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="phone2" label="Secondary Phone">
              <Input placeholder="+91 98765 43211" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
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
        <Row gutter={[16, 16]}>
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
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please enter city' }]}>
              <Input placeholder="e.g. Kochi" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please enter state' }]}>
              <Input placeholder="e.g. Kerala" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
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
      label: <span><FileTextOutlined /> Tax & Reg.</span>,
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="gstNo" label="GSTIN / GST Number">
              <Input placeholder="32ABCDE1234F1Z5" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="regNo" label="Business Reg. Number">
              <Input placeholder="REG-TOY-2026-99" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="panNo" label="PAN Number">
              <Input placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      key: 'social',
      label: <span><ShareAltOutlined /> Social & Hours</span>,
      children: (
        <Row gutter={[16, 16]}>
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
          <Col xs={24}>
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
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Space align="center" size={12}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')} style={{ borderRadius: '6px' }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800, fontSize: isMobile ? '20px' : '24px' }}>
              Shop Details Master Screen
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Configure store branding, contact info, tax registration, and expanded address settings.
            </Text>
          </div>
        </Space>

        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          loading={saving}
          onClick={handleSave}
          style={{
            borderRadius: '8px',
            background: '#001529',
            borderColor: '#001529',
            height: '40px',
            padding: '0 24px',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          Save All Changes
        </Button>
      </div>

      <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: isMobile ? '4px' : '16px' }}>
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="identity" items={items} />
        </Form>
      </Card>
    </Space>
  );
};

export default ShopManagement;
