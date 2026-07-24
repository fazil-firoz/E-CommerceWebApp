import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Space, Divider, Breadcrumb } from 'antd';
import { 
  ShopOutlined, HeartOutlined, SafetyCertificateOutlined, 
  RocketOutlined, SmileOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { shopApi } from '../../api/shopApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Paragraph, Text } = Typography;

const AboutUs = () => {
  const [shopInfo, setShopInfo] = useState(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success) setShopInfo(res.data);
      } catch (err) {
        console.error('Failed to load shop details', err);
      }
    };
    fetchShop();
  }, []);

  const shopName = shopInfo?.shopName || 'ToyVerse';
  const motto = shopInfo?.motto || 'Quality Toys & Infinite Joy for Kids';
  const fullAddress = shopInfo ? `${shopInfo.addressLine1}${shopInfo.addressLine2 ? ', ' + shopInfo.addressLine2 : ''}, ${shopInfo.city}, ${shopInfo.state} - ${shopInfo.pincode}` : 'ToyVerse Headquarters, City Center';

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { title: <Link to="/">Home</Link> },
        { title: 'About Us' }
      ]} />

      {/* Hero Banner */}
      <Card style={{
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0, 21, 41, 0.15)',
        padding: '24px'
      }}>
        <Row align="middle" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Space align="center" size={12} style={{ marginBottom: '12px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #ff7a45 100%)',
                width: '48px', height: '48px',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <ShopOutlined style={{ color: '#fff', fontSize: '24px' }} />
              </div>
              <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>
                Welcome to {shopName}
              </Title>
            </Space>
            <Paragraph style={{ color: '#e6f7ff', fontSize: '16px', margin: 0 }}>
              {motto}. We bring smiles, creativity, and safe playtime to children everywhere with our handpicked collection of toys.
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            {shopInfo?.logoUrl && (
              <img
                src={resolveProductImageUrl(shopInfo.logoUrl)}
                alt="Logo"
                style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', background: '#fff', padding: '8px' }}
              />
            )}
          </Col>
        </Row>
      </Card>

      {/* Our Values Grid */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderRadius: '16px', textAlign: 'center', height: '100%' }}>
            <SafetyCertificateOutlined style={{ fontSize: '36px', color: '#52c41a', marginBottom: '12px' }} />
            <Title level={5}>100% Safe & Non-Toxic</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Every toy is rigorously tested for child safety, non-toxic materials, and smooth edges.
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderRadius: '16px', textAlign: 'center', height: '100%' }}>
            <HeartOutlined style={{ fontSize: '36px', color: '#ec4899', marginBottom: '12px' }} />
            <Title level={5}>Curated with Love</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              From educational puzzles to action figures, we select toys that inspire imagination and learning.
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderRadius: '16px', textAlign: 'center', height: '100%' }}>
            <RocketOutlined style={{ fontSize: '36px', color: '#ec4899', marginBottom: '12px' }} />
            <Title level={5}>Express Delivery</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Fast and secure shipping nationwide so the fun never has to wait.
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderRadius: '16px', textAlign: 'center', height: '100%' }}>
            <SmileOutlined style={{ fontSize: '36px', color: '#faad14', marginBottom: '12px' }} />
            <Title level={5}>Customer Happiness</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Easy returns, responsive support, and transparent policies for complete peace of mind.
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Story & Commitment Section */}
      <Card style={{ borderRadius: '16px' }}>
        <Title level={3} style={{ fontWeight: 800 }}>Our Journey & Commitment</Title>
        <Divider style={{ margin: '12px 0 20px' }} />
        <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#434343' }}>
          At <strong>{shopName}</strong>, we believe play is essential for every child’s cognitive, social, and emotional development. Founded with a passion for high-quality toys, our goal is to offer parents a trustworthy store where every product meets global safety guidelines and brings genuine delight.
        </Paragraph>
        <Paragraph style={{ fontSize: '15px', lineHeight: '1.8', color: '#434343' }}>
          Whether you are looking for infant sensory play items, building blocks, STEM toys, dolls, or outdoor fun gear, {shopName} is your one-stop destination.
        </Paragraph>
      </Card>

      {/* Contact Banner */}
      <Card style={{ borderRadius: '16px', background: '#fafafa', borderColor: '#f0f0f0' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12}>
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: '16px', color: '#001529' }}>Have questions or custom requests?</Text>
              <Text type="secondary">Reach out to our customer happiness team anytime.</Text>
            </Space>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Link to="/contact">
                <Text strong style={{ color: '#ec4899', fontSize: '15px' }}>
                  <EnvironmentOutlined /> Visit Contact Page &rarr;
                </Text>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default AboutUs;
