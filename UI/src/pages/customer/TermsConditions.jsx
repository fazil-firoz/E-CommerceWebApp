import React from 'react';
import { Typography, Card, Space, Divider, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const TermsConditions = () => {
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { title: <Link to="/">Home</Link> },
        { title: 'Terms & Conditions' }
      ]} />

      <Card style={{ borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Space align="center" size={12} style={{ marginBottom: '8px' }}>
          <FileTextOutlined style={{ fontSize: '28px', color: '#722ed1' }} />
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Terms & Conditions</Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
          Please read these terms carefully before placing an order on ToyVerse.
        </Text>

        <Divider style={{ margin: '12px 0 24px' }} />

        <Title level={4}>1. Acceptance of Terms</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          By accessing or using the ToyVerse web platform, placing an order, or browsing products, you agree to be bound by these Terms and Conditions.
        </Paragraph>

        <Title level={4} style={{ marginTop: '24px' }}>2. Product Information & Pricing</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          We make every effort to display accurate product descriptions, MRP, selling prices, and image representations. All prices listed on our website are inclusive of applicable Goods and Services Tax (GST).
        </Paragraph>

        <Title level={4} style={{ marginTop: '24px' }}>3. Order Acceptance & Shipping</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          Receipt of an order confirmation email or invoice does not signify our final acceptance of your order. ToyVerse reserves the right to cancel or limit order quantities in cases of stock unavailability or pricing errors. Shipping charges are calculated based on store rules and free shipping thresholds.
        </Paragraph>

        <Title level={4} style={{ marginTop: '24px' }}>4. Intellectual Property</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          All brand trademarks, shop logos, website content, images, graphics, and designs are the exclusive property of ToyVerse and protected by applicable copyright and trademark laws.
        </Paragraph>

        <Title level={4} style={{ marginTop: '24px' }}>5. Contact & Inquiries</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          If you have questions regarding our Terms and Conditions, please contact us at <Link to="/contact">Support Desk</Link>.
        </Paragraph>
      </Card>
    </Space>
  );
};

export default TermsConditions;
