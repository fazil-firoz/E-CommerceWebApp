import React from 'react';
import { Typography, Card, Collapse, Space, Breadcrumb, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';
import { QuestionCircleOutlined, PhoneOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Faq = () => {
  const faqItems = [
    {
      key: '1',
      label: <Text strong style={{ fontSize: '15px' }}>1. How do I track my order status?</Text>,
      children: (
        <Paragraph style={{ color: '#595959', margin: 0, lineHeight: '1.7' }}>
          Once your order is shipped, you will receive an SMS and email notification with your tracking number and courier link. You can also view live tracking details anytime by contacting our support desk.
        </Paragraph>
      )
    },
    {
      key: '2',
      label: <Text strong style={{ fontSize: '15px' }}>2. Are all toys non-toxic and child-safe?</Text>,
      children: (
        <Paragraph style={{ color: '#595959', margin: 0, lineHeight: '1.7' }}>
          Yes! 100% of our products undergo safety testing to comply with international and BIS safety standards. All plastics used are BPA-free, non-toxic, and feature smooth child-friendly rounded edges.
        </Paragraph>
      )
    },
    {
      key: '3',
      label: <Text strong style={{ fontSize: '15px' }}>3. What is your 7-Day Replacement & Return Policy?</Text>,
      children: (
        <Paragraph style={{ color: '#595959', margin: 0, lineHeight: '1.7' }}>
          If your toy arrives defective, damaged, or incorrect, you can request a hassle-free replacement or refund within 7 days of delivery. Original box packaging must be preserved. Read our full <Link to="/refund-policy">Refund Policy</Link> for details.
        </Paragraph>
      )
    },
    {
      key: '4',
      label: <Text strong style={{ fontSize: '15px' }}>4. Do you offer Free Shipping?</Text>,
      children: (
        <Paragraph style={{ color: '#595959', margin: 0, lineHeight: '1.7' }}>
          Yes! Orders above ₹1,000 qualify for FREE standard shipping nationwide. For orders below ₹1,000, a nominal shipping charge is calculated during checkout.
        </Paragraph>
      )
    },
    {
      key: '5',
      label: <Text strong style={{ fontSize: '15px' }}>5. What payment methods do you accept?</Text>,
      children: (
        <Paragraph style={{ color: '#595959', margin: 0, lineHeight: '1.7' }}>
          We accept all major payment methods including Credit Cards, Debit Cards, Net Banking, UPI (Google Pay, PhonePe, Paytm), and Cash on Delivery (COD) where available.
        </Paragraph>
      )
    },
    {
      key: '6',
      label: <Text strong style={{ fontSize: '15px' }}>6. How long does delivery take?</Text>,
      children: (
        <Paragraph style={{ color: '#595959', margin: 0, lineHeight: '1.7' }}>
          Standard delivery takes 3 to 5 business days for major cities and 5 to 7 days for remote pincodes. Express delivery is available for 1 to 2 business day delivery in metro areas.
        </Paragraph>
      )
    },
    {
      key: '7',
      label: <Text strong style={{ fontSize: '15px' }}>7. Can I cancel or modify my order after placing it?</Text>,
      children: (
        <Paragraph style={{ color: '#595959', margin: 0, lineHeight: '1.7' }}>
          Orders can be cancelled before dispatch. Once dispatched, you can decline the parcel at delivery or initiate a return within 7 days of arrival.
        </Paragraph>
      )
    }
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { title: <Link to="/">Home</Link> },
        { title: 'Frequently Asked Questions (FAQs)' }
      ]} />

      <Card style={{ borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Space align="center" size={12} style={{ marginBottom: '8px' }}>
          <QuestionCircleOutlined style={{ fontSize: '28px', color: '#faad14' }} />
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Frequently Asked Questions</Title>
        </Space>
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          Find quick answers to common questions about orders, shipping, safety, and returns.
        </Text>

        <Collapse items={faqItems} defaultActiveKey={['1', '2', '3']} style={{ borderRadius: '12px', background: '#fff' }} />

        {/* Still Need Help Card */}
        <Card style={{ borderRadius: '16px', background: '#e6f7ff', border: '1px solid #91d5ff', marginTop: '32px', textAlign: 'center' }}>
          <Title level={4} style={{ color: '#0050b3', margin: '0 0 8px' }}>Still Have Questions?</Title>
          <Paragraph style={{ color: '#003a8c', marginBottom: '16px' }}>
            Our customer support team is happy to assist you with order inquiries, product recommendations, or bulk orders.
          </Paragraph>
          <Space wrap>
            <Link to="/contact">
              <Button type="primary" icon={<MessageOutlined />} size="large" style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529' }}>
                Contact Support Team
              </Button>
            </Link>
          </Space>
        </Card>
      </Card>
    </Space>
  );
};

export default Faq;
