import React from 'react';
import { Typography, Card, Space, Divider, Breadcrumb, Alert, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { SyncOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const RefundPolicy = () => {
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { title: <Link to="/">Home</Link> },
        { title: 'Refund & Return Policy' }
      ]} />

      <Card style={{ borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Space align="center" size={12} style={{ marginBottom: '8px' }}>
          <SyncOutlined style={{ fontSize: '28px', color: '#52c41a' }} />
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Refund & Return Policy</Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
          Hassle-free 7-day replacement and refund policy for your peace of mind.
        </Text>

        <Alert
          message="7-Day Guarantee"
          description="If your order arrives damaged, defective, or incorrect, you can request a replacement or full refund within 7 days of delivery date."
          type="success"
          showIcon
          style={{ borderRadius: '12px', marginBottom: '24px' }}
        />

        <Divider style={{ margin: '12px 0 24px' }} />

        <Title level={4}>1. Return Eligibility Criteria</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          To be eligible for a replacement or return, the following conditions must be met:
        </Paragraph>
        <ul style={{ color: '#595959', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>The return request must be raised within <strong>7 calendar days</strong> from the delivery date.</li>
          <li>The toy must be unused, unwashed, and in its original manufacturer box packaging with all tags and accessories.</li>
          <li>For transit damage or missing item claims, a <strong>continuous unboxing video</strong> recorded upon receiving the parcel is required.</li>
        </ul>

        <Title level={4} style={{ marginTop: '24px' }}>2. Non-Returnable Items</Title>
        <ul style={{ color: '#595959', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Items damaged due to misuse, altered parts, or improper battery installation.</li>
          <li>Products returned without original product box packaging or missing parts.</li>
          <li>Clearance sale items explicitly marked as non-returnable.</li>
        </ul>

        <Title level={4} style={{ marginTop: '24px' }}>3. How to Request a Return or Replacement</Title>
        <Row gutter={[16, 16]} style={{ marginTop: '12px' }}>
          <Col xs={24} md={8}>
            <Card size="small" style={{ borderRadius: '12px', background: '#fafafa', textAlign: 'center' }}>
              <Title level={5}>Step 1: Contact Support</Title>
              <Text type="secondary">Send your Order ID & unboxing video/photos to support@toyverse.com or WhatsApp.</Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ borderRadius: '12px', background: '#fafafa', textAlign: 'center' }}>
              <Title level={5}>Step 2: Pickup / Inspection</Title>
              <Text type="secondary">Our courier partner will inspect and arrange reverse pickup from your address.</Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ borderRadius: '12px', background: '#fafafa', textAlign: 'center' }}>
              <Title level={5}>Step 3: Replacement / Refund</Title>
              <Text type="secondary">Once verified, a fresh item is dispatched or refund processed within 3-5 days.</Text>
            </Card>
          </Col>
        </Row>

        <Title level={4} style={{ marginTop: '28px' }}>4. Refund Timelines</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          Refunds are credited to your original payment method (Bank Account / UPI / Card) within <strong>3 to 5 business days</strong> after item inspection at our central warehouse.
        </Paragraph>
      </Card>
    </Space>
  );
};

export default RefundPolicy;
