import React from 'react';
import { Typography, Card, Space, Divider, Breadcrumb, Row, Col, Tag, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { RocketOutlined, TruckOutlined, ClockCircleOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const ShippingPolicy = () => {
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { title: <Link to="/">Home</Link> },
        { title: 'Shipping & Delivery Policy' }
      ]} />

      <Card style={{ borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Space align="center" size={12} style={{ marginBottom: '8px' }}>
          <RocketOutlined style={{ fontSize: '28px', color: '#ec4899' }} />
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Shipping & Delivery Policy</Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
          Fast, safe, and reliable nationwide delivery for all toy orders.
        </Text>

        <Alert
          message="Free Express Shipping Available!"
          description="Orders above ₹1,000 qualify for FREE standard shipping nationwide. Fast 2 to 5 business day delivery across major Indian cities."
          type="info"
          showIcon
          style={{ borderRadius: '12px', marginBottom: '24px' }}
        />

        <Divider style={{ margin: '12px 0 24px' }} />

        {/* Delivery Timelines Row */}
        <Title level={4}>1. Delivery Timelines & Charges</Title>
        <Row gutter={[16, 16]} style={{ marginTop: '12px', marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ borderRadius: '14px', background: '#fafafa', borderLeft: '4px solid #ec4899' }}>
              <Space align="center" style={{ marginBottom: '8px' }}>
                <TruckOutlined style={{ fontSize: '20px', color: '#ec4899' }} />
                <Text strong style={{ fontSize: '15px' }}>Standard Delivery</Text>
              </Space>
              <Paragraph style={{ margin: 0, fontSize: '12px', color: '#595959' }}>
                Delivered within <strong>3 to 5 business days</strong>. Standard fee applies for orders under ₹1,000.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ borderRadius: '14px', background: '#f6ffed', borderLeft: '4px solid #52c41a' }}>
              <Space align="center" style={{ marginBottom: '8px' }}>
                <RocketOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                <Text strong style={{ fontSize: '15px' }}>Superfast Express</Text>
              </Space>
              <Paragraph style={{ margin: 0, fontSize: '12px', color: '#595959' }}>
                Delivered within <strong>1 to 2 business days</strong> in tier-1 metro cities (Bangalore, Chennai, Mumbai, Delhi).
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card size="small" style={{ borderRadius: '14px', background: '#fff7e6', borderLeft: '4px solid #fa8c16' }}>
              <Space align="center" style={{ marginBottom: '8px' }}>
                <EnvironmentOutlined style={{ fontSize: '20px', color: '#fa8c16' }} />
                <Text strong style={{ fontSize: '15px' }}>Rest of India</Text>
              </Space>
              <Paragraph style={{ margin: 0, fontSize: '12px', color: '#595959' }}>
                Delivered within <strong>5 to 7 business days</strong> to remote pincodes via national parcel networks.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Title level={4}>2. Order Processing & Tracking</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          All orders placed before 3:00 PM are dispatched on the same business day from our main warehouse. Once dispatched, you will receive an SMS and email notification containing:
        </Paragraph>
        <ul style={{ color: '#595959', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Courier Partner Name (BlueDart, DTDC, Delhivery, FedEx).</li>
          <li>Live Tracking Number & Direct Tracking Link.</li>
          <li>Estimated Arrival Date.</li>
        </ul>

        <Title level={4} style={{ marginTop: '24px' }}>3. Packaging & Child Safety Standards</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          We package every toy parcel with heavy-duty bubble wrap and reinforced outer boxes to ensure zero transit damage. Fragile electronic and battery-operated toys undergo double-box protective packaging.
        </Paragraph>

        <Title level={4} style={{ marginTop: '24px' }}>4. Transit Damages & Missing Items</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          Please inspect the outer package seal at the time of delivery. If the package appears tampered with or heavily damaged, please notify the delivery executive immediately and record a short unboxing video. Contact our <Link to="/contact">Support Team</Link> within 48 hours for immediate replacement.
        </Paragraph>
      </Card>
    </Space>
  );
};

export default ShippingPolicy;
