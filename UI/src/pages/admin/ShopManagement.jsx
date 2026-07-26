import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, Row, Col, Typography, Upload, message, Space, Divider, Spin } from 'antd';
import { ShopOutlined, PhoneOutlined, EnvironmentOutlined, FileTextOutlined, ShareAltOutlined, UploadOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { shopApi } from '../../api/shopApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ShopManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

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
      else setUploadingLogo(false);
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
    },
    {
      key: 'banners',
      label: <span>🎨 Homepage Hero & Promo Banners</span>,
      children: (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {/* Hero Banner Controls */}
          <Card title={<Text strong style={{ color: '#1890ff', fontSize: '15px' }}>🌟 Hero Banner Customization (Title, Subtitle & 4-Slide Auto Carousel)</Text>} size="small" style={{ background: '#fafafa', borderRadius: '10px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="heroTitle" label="Hero Main Title">
                  <Input placeholder="Where Joy & Imagination Come Alive!" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="heroDescription" label="Hero Subtitle / Description">
                  <Input.TextArea rows={2} placeholder="Explore our handpicked collection of certified safe STEM toys..." />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Text strong style={{ fontSize: '13px', color: '#595959', display: 'block', marginBottom: '8px' }}>
                  Auto-Sliding Hero Carousel Images (Set up to 4 Image URLs / Links):
                </Text>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="heroImageUrl1" label="Hero Slide Image #1 URL">
                  <Input placeholder="https://images.unsplash.com/photo-..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="heroImageUrl2" label="Hero Slide Image #2 URL">
                  <Input placeholder="https://images.unsplash.com/photo-..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="heroImageUrl3" label="Hero Slide Image #3 URL">
                  <Input placeholder="https://images.unsplash.com/photo-..." />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="heroImageUrl4" label="Hero Slide Image #4 URL">
                  <Input placeholder="https://images.unsplash.com/photo-..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Promo Banner Controls */}
          <Card title={<Text strong style={{ color: '#ff4d4f', fontSize: '15px' }}>🎉 Promo Banner Customization</Text>} size="small" style={{ background: '#fff2f0', borderRadius: '10px', border: '1px solid #ffccc7' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10}>
                <Form.Item name="promoTitle" label="Promo Banner Heading">
                  <Input placeholder="Summer Carnival Sale — Enjoy Up to 30% OFF!" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={10}>
                <Form.Item name="promoDescription" label="Promo Banner Subtitle">
                  <Input.TextArea rows={2} placeholder="Apply coupon codes at checkout to unlock instant extra savings..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item name="promoCouponCode" label="Coupon Code Display">
                  <Input placeholder="TOY30" style={{ textTransform: 'uppercase', fontWeight: 700 }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size={12}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')} style={{ borderRadius: '6px' }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Shop Details Master Screen</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>Configure store branding, contact info, tax registration, and expanded address settings.</Text>
          </div>
        </Space>

        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          loading={saving}
          onClick={handleSave}
          style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529', height: '40px', padding: '0 24px' }}
        >
          Save All Changes
        </Button>
      </div>

      <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="identity" items={items} />
        </Form>
      </Card>
    </Space>
  );
};

export default ShopManagement;
