import React from 'react';
import { Typography, Card, Space, Divider, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = () => {
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { title: <Link to="/">Home</Link> },
        { title: 'Privacy Policy' }
      ]} />

      <Card style={{ borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Space align="center" size={12} style={{ marginBottom: '8px' }}>
          <SafetyCertificateOutlined style={{ fontSize: '28px', color: '#ec4899' }} />
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Privacy Policy</Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
          Last updated: July 2026. Your privacy and data security are paramount to us.
        </Text>

        <Divider style={{ margin: '12px 0 24px' }} />

        <Title level={4}>1. Information We Collect</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          We collect information you provide directly when creating an account, browsing toys, or placing an order:
        </Paragraph>
        <ul style={{ color: '#595959', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li><strong>Personal Details:</strong> Name, Email address, Phone / Mobile number, Shipping and Billing address.</li>
          <li><strong>Order & Transaction Records:</strong> Purchased items, order totals, shipping selections, and payment status logs.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information, and interaction logs for site optimization.</li>
        </ul>

        <Title level={4} style={{ marginTop: '24px' }}>2. How We Use Your Data</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          We use your information strictly to process orders and improve your shopping experience:
        </Paragraph>
        <ul style={{ color: '#595959', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>To fulfill your toy orders, arrange courier delivery, and send order status updates via SMS / Email.</li>
          <li>To process customer support requests and process eligible returns or replacements.</li>
          <li>To prevent fraudulent transactions and maintain platform security.</li>
        </ul>

        <Title level={4} style={{ marginTop: '24px' }}>3. Data Protection & Security</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          We employ industry-standard 256-bit SSL encryption to protect your data in transit and at rest. We never sell or rent your personal information to third-party advertisers. Payment card and banking credentials are handled through secure, PCI-DSS compliant payment gateways.
        </Paragraph>

        <Title level={4} style={{ marginTop: '24px' }}>4. Cookies & Local Storage</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          We use cookies and browser local storage to remember your shopping cart items, active sessions, and user preferences. You can disable cookies in your browser settings, though some features like keeping items in your cart may require local storage.
        </Paragraph>

        <Title level={4} style={{ marginTop: '24px' }}>5. Contact Us Regarding Privacy</Title>
        <Paragraph style={{ color: '#434343', lineHeight: '1.8' }}>
          If you have questions about this Privacy Policy or wish to update or delete your personal records, please reach out via our <Link to="/contact">Contact Support Desk</Link>.
        </Paragraph>
      </Card>
    </Space>
  );
};

export default PrivacyPolicy;
