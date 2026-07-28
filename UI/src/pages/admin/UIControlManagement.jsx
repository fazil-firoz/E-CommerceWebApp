import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Typography, message, Space, Spin } from 'antd';
import { ControlOutlined, SaveOutlined, ArrowLeftOutlined, PictureOutlined, MessageOutlined, TagOutlined } from '@ant-design/icons';
import { shopApi } from '../../api/shopApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const UIControlManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shopData, setShopData] = useState(null);

  const navigate = useNavigate();

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
    fetchShopDetails();
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
                <Text strong style={{ color: '#1890ff', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PictureOutlined /> 🌟 Hero Banner Customization (Title, Subtitle & 4-Slide Auto Carousel)
                </Text>
              }
              size="small"
              style={{ background: '#fafafa', borderRadius: '10px' }}
            >
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

            {/* Marquee Ticker Ribbon Controls */}
            <Card
              title={
                <Text strong style={{ color: '#722ed1', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageOutlined /> 🎀 Infinite Marquee Ticker Customization
                </Text>
              }
              size="small"
              style={{ background: '#f9f0ff', borderRadius: '10px', border: '1px solid #d3adf7' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item name="marqueeText" label="Infinite Marquee Scrolling Text (Use bullet • or emojis to separate messages)">
                    <Input.TextArea rows={2} placeholder="💖 FREE EXPRESS GIFT WRAPPING • ✨ 100% AUTHENTIC KAWAII MERCH • 🔥 TRENDING ON TIKTOK & INSTAGRAM • 🏷️ USE CODE KAWAII30 FOR EXTRA 30% OFF • ⭐ 50,000+ HAPPY SMILES" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Promo Banner Controls */}
            <Card
              title={
                <Text strong style={{ color: '#ff4d4f', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TagOutlined /> 🎉 Promo Banner Customization
                </Text>
              }
              size="small"
              style={{ background: '#fff2f0', borderRadius: '10px', border: '1px solid #ffccc7' }}
            >
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
        </Form>
      </Card>
    </Space>
  );
};

export default UIControlManagement;
