import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message, Space, Spin, Tag, Alert } from 'antd';
import { ControlOutlined, SaveOutlined, ArrowLeftOutlined, PictureOutlined, MessageOutlined, TagOutlined, StopOutlined } from '@ant-design/icons';
import { shopApi } from '../../api/shopApi';
import { superAdminApi } from '../../api/superAdminApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const UIControlManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [superAdminControl, setSuperAdminControl] = useState({
    isHeroBannerEnabled: true,
    isBadgeRibbonEnabled: true,
    isMarqueeEnabled: true,
    isPromoBannerEnabled: true
  });

  const navigate = useNavigate();

  const fetchSuperAdminControls = async () => {
    try {
      const res = await superAdminApi.getControlFlags();
      if (res.success && res.data) {
        setSuperAdminControl(res.data);
      }
    } catch (err) {
      console.error('Failed to load Super Admin controls', err);
    }
  };

  const fetchShopDetails = async () => {
    setLoading(true);
    try {
      const response = await shopApi.getSettings();
      if (response.success && response.data) {
        setShopData(response.data);
        form.setFieldsValue(response.data);
      }
    } catch (err) {
      message.error('Failed to load UI control settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminControls();
    fetchShopDetails();

    window.addEventListener('superAdminControlUpdated', fetchSuperAdminControls);
    return () => window.removeEventListener('superAdminControlUpdated', fetchSuperAdminControls);
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...shopData,
        ...values
      };

      const response = await shopApi.updateSettings(payload);
      if (response.success) {
        message.success('Homepage Hero & Promo Banners saved successfully!');
        if (response.data) {
          setShopData(response.data);
          form.setFieldsValue(response.data);
        }
      } else {
        message.error(response.message || 'Failed to save UI control settings');
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
        <Spin size="large" tip="Loading UI & Banner Control Settings..." />
      </div>
    );
  }

  const isHeroBannerDisabled = superAdminControl.isHeroBannerEnabled === false;
  const isBadgeRibbonDisabled = superAdminControl.isBadgeRibbonEnabled === false;
  const isMarqueeDisabled = superAdminControl.isMarqueeEnabled === false;
  const isPromoBannerDisabled = superAdminControl.isPromoBannerEnabled === false;

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Space align="center" size={12}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/shop-settings')} style={{ borderRadius: '6px' }} />
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ControlOutlined style={{ color: '#1890ff' }} /> UI Control & Homepage Banners
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Configure Homepage Hero carousel, Infinite Marquee Ticker ribbon, and Promo Banner settings.
            </Text>
          </div>
        </Space>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529', height: '40px', padding: '0 24px' }}
        >
          Save All UI Settings
        </Button>
      </div>

      <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Form form={form} layout="vertical">
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            
            {/* Hero Banner Controls */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ color: isHeroBannerDisabled ? '#8c8c8c' : '#1890ff', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PictureOutlined /> 🌟 Hero Banner Customization (Title, Subtitle & 4-Slide Auto Carousel)
                  </Text>
                  {isHeroBannerDisabled && (
                    <Tag color="red" icon={<StopOutlined />} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                      Disabled by Super Admin
                    </Tag>
                  )}
                </div>
              }
              size="small"
              style={{
                background: isHeroBannerDisabled ? '#f5f5f5' : '#fafafa',
                borderRadius: '10px',
                border: isHeroBannerDisabled ? '1px dashed #d9d9d9' : '1px solid #f0f0f0',
                opacity: isHeroBannerDisabled ? 0.75 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isHeroBannerDisabled && (
                <Alert
                  type="warning"
                  showIcon
                  message="Hero Banner Section Disabled"
                  description="This layout section has been disabled by Super Admin. Enable 'Hero Banner Section' in Super Admin Control to unlock these inputs."
                  style={{ marginBottom: '16px', borderRadius: '8px' }}
                />
              )}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item name="heroTitle" label="Hero Main Title">
                    <Input placeholder="Where Joy & Imagination Come Alive!" size="large" disabled={isHeroBannerDisabled} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="heroDescription" label="Hero Subtitle / Description">
                    <Input.TextArea rows={2} placeholder="Explore our handpicked collection of certified safe STEM toys..." disabled={isHeroBannerDisabled} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Text strong style={{ fontSize: '13px', color: isHeroBannerDisabled ? '#8c8c8c' : '#595959', display: 'block', marginBottom: '8px' }}>
                    Auto-Sliding Hero Carousel Images (Set up to 4 Image URLs / Links):
                  </Text>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="heroImageUrl1" label="Hero Slide Image #1 URL">
                    <Input placeholder="https://images.unsplash.com/photo-..." disabled={isHeroBannerDisabled} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="heroImageUrl2" label="Hero Slide Image #2 URL">
                    <Input placeholder="https://images.unsplash.com/photo-..." disabled={isHeroBannerDisabled} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="heroImageUrl3" label="Hero Slide Image #3 URL">
                    <Input placeholder="https://images.unsplash.com/photo-..." disabled={isHeroBannerDisabled} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item name="heroImageUrl4" label="Hero Slide Image #4 URL">
                    <Input placeholder="https://images.unsplash.com/photo-..." disabled={isHeroBannerDisabled} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Navbar Top Badge Ribbon Controls */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ color: isBadgeRibbonDisabled ? '#8c8c8c' : '#52c41a', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ControlOutlined /> 🏷️ Top Navbar Badge Ribbon (3-Second Auto-Rotating Messages)
                  </Text>
                  {isBadgeRibbonDisabled && (
                    <Tag color="red" icon={<StopOutlined />} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                      Disabled by Super Admin
                    </Tag>
                  )}
                </div>
              }
              size="small"
              style={{
                background: isBadgeRibbonDisabled ? '#f5f5f5' : '#f6ffed',
                borderRadius: '10px',
                border: isBadgeRibbonDisabled ? '1px dashed #d9d9d9' : '1px solid #b7eb8f',
                opacity: isBadgeRibbonDisabled ? 0.75 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isBadgeRibbonDisabled && (
                <Alert
                  type="warning"
                  showIcon
                  message="Badge Ribbon Ticker Disabled"
                  description="Top Navbar Badge Ribbon has been disabled by Super Admin. Enable 'Badge Ribbon Ticker' in Super Admin Control to unlock these inputs."
                  style={{ marginBottom: '16px', borderRadius: '8px' }}
                />
              )}
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item name="badgeRibbonText" label="Navbar Top Badge Ribbon Messages (Use bullet • or commas to separate rotating messages)">
                    <Input.TextArea rows={2} placeholder="✨ Surprisingly Affordable • 💖 100% Genuine & Certified Products..." disabled={isBadgeRibbonDisabled} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Marquee Ticker Ribbon Controls */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ color: isMarqueeDisabled ? '#8c8c8c' : '#722ed1', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageOutlined /> 🎀 Infinite Marquee Ticker Customization
                  </Text>
                  {isMarqueeDisabled && (
                    <Tag color="red" icon={<StopOutlined />} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                      Disabled by Super Admin
                    </Tag>
                  )}
                </div>
              }
              size="small"
              style={{
                background: isMarqueeDisabled ? '#f5f5f5' : '#f9f0ff',
                borderRadius: '10px',
                border: isMarqueeDisabled ? '1px dashed #d9d9d9' : '1px solid #d3adf7',
                opacity: isMarqueeDisabled ? 0.75 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isMarqueeDisabled && (
                <Alert
                  type="warning"
                  showIcon
                  message="Infinite Marquee Ticker Disabled"
                  description="Marquee Ticker Ribbon has been disabled by Super Admin. Enable 'Infinite Marquee Ticker Ribbon' in Super Admin Control to unlock these inputs."
                  style={{ marginBottom: '16px', borderRadius: '8px' }}
                />
              )}
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item name="marqueeText" label="Infinite Marquee Scrolling Text (Use bullet • or emojis to separate messages)">
                    <Input.TextArea rows={2} placeholder="💖 FREE EXPRESS GIFT WRAPPING • ✨ 100% AUTHENTIC KAWAII MERCH..." disabled={isMarqueeDisabled} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Promo Banner Controls */}
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ color: isPromoBannerDisabled ? '#8c8c8c' : '#ff4d4f', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TagOutlined /> 🎉 Promo Banner Customization
                  </Text>
                  {isPromoBannerDisabled && (
                    <Tag color="red" icon={<StopOutlined />} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                      Disabled by Super Admin
                    </Tag>
                  )}
                </div>
              }
              size="small"
              style={{
                background: isPromoBannerDisabled ? '#f5f5f5' : '#fff2f0',
                borderRadius: '10px',
                border: isPromoBannerDisabled ? '1px dashed #d9d9d9' : '1px solid #ffccc7',
                opacity: isPromoBannerDisabled ? 0.75 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {isPromoBannerDisabled && (
                <Alert
                  type="warning"
                  showIcon
                  message="Promo Banner Section Disabled"
                  description="Promo Banner Section has been disabled by Super Admin. Enable 'Promo Banner Section' in Super Admin Control to unlock these inputs."
                  style={{ marginBottom: '16px', borderRadius: '8px' }}
                />
              )}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={10}>
                  <Form.Item name="promoTitle" label="Promo Banner Heading">
                    <Input placeholder="Summer Carnival Sale — Enjoy Up to 30% OFF!" size="large" disabled={isPromoBannerDisabled} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={10}>
                  <Form.Item name="promoDescription" label="Promo Banner Subtitle">
                    <Input.TextArea rows={2} placeholder="Apply coupon codes at checkout to unlock instant extra savings..." disabled={isPromoBannerDisabled} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={4}>
                  <Form.Item name="promoCouponCode" label="Coupon Code Display">
                    <Input placeholder="TOY30" style={{ textTransform: 'uppercase', fontWeight: 700 }} disabled={isPromoBannerDisabled} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

          </Space>
        </Form>
      </Card>
    </Space>
  );
};

export default UIControlManagement;
