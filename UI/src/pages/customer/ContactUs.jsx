import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Space, Input, Button, Form, message, Divider, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { 
  PhoneOutlined, MailOutlined, EnvironmentOutlined, WhatsAppOutlined, 
  SendOutlined, ClockCircleOutlined, ShopOutlined 
} from '@ant-design/icons';
import { shopApi } from '../../api/shopApi';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ContactUs = () => {
  const [shopInfo, setShopInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

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

  const shopName = shopInfo?.shopName || 'ToyVerse Store';
  const fullAddress = shopInfo ? `${shopInfo.addressLine1}${shopInfo.addressLine2 ? ', ' + shopInfo.addressLine2 : ''}, ${shopInfo.city}, ${shopInfo.state} - ${shopInfo.pincode}, ${shopInfo.country}` : 'ToyVerse Central Warehouse, City Center';
  const phone1 = shopInfo?.phone1 || '+91 9876543210';
  const whatsapp = shopInfo?.whatsAppNumber || phone1;
  const email1 = shopInfo?.email1 || 'support@toyverse.com';
  const openingHours = shopInfo?.openingHours || 'Mon - Sat: 9:00 AM - 8:00 PM';

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setTimeout(() => {
      message.success('Thank you! Your message has been sent. Our team will contact you shortly.');
      form.resetFields();
      setSubmitting(false);
    }, 1000);
  };

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { title: <Link to="/">Home</Link> },
        { title: 'Contact Us' }
      ]} />

      <Card style={{ borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Contact {shopName}</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: '20px' }}>
          We would love to hear from you! Get in touch for order support, toy inquiries, or feedback.
        </Text>

        <Divider style={{ margin: '12px 0 24px' }} />

        <Row gutter={[24, 24]}>
          {/* Form */}
          <Col xs={24} md={14}>
            <Card style={{ borderRadius: '16px', background: '#fafafa', borderColor: '#f0f0f0' }}>
              <Title level={4} style={{ marginBottom: '16px' }}>Send Us a Message</Title>
              <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="name" label="Your Name" rules={[{ required: true, message: 'Please enter your name' }]}>
                      <Input placeholder="John Doe" size="large" style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone" label="Mobile Number" rules={[{ required: true, message: 'Please enter mobile number' }]}>
                      <Input placeholder="+91 9876543210" size="large" style={{ borderRadius: '8px' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                  <Input placeholder="john@example.com" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
                <Form.Item name="subject" label="Subject">
                  <Input placeholder="Product Inquiry / Order Status / Feedback" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>
                <Form.Item name="message" label="Your Message" rules={[{ required: true, message: 'Please write your message' }]}>
                  <TextArea rows={4} placeholder="Write your message here..." style={{ borderRadius: '8px' }} />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  loading={submitting}
                  size="large"
                  block
                  style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529' }}
                >
                  Send Message
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Store Info Cards */}
          <Col xs={24} md={10}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #1890ff' }}>
                <Space align="start" size={14}>
                  <EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Store Address</Text>
                    <Text type="secondary">{fullAddress}</Text>
                  </div>
                </Space>
              </Card>

              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #52c41a' }}>
                <Space align="start" size={14}>
                  <PhoneOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Phone Support</Text>
                    <Text style={{ fontWeight: 600 }}>{phone1}</Text>
                  </div>
                </Space>
              </Card>

              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #25D366' }}>
                <Space align="start" size={14}>
                  <WhatsAppOutlined style={{ fontSize: '24px', color: '#25D366' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>WhatsApp Hotline</Text>
                    <Text style={{ fontWeight: 600 }}>{whatsapp}</Text>
                  </div>
                </Space>
              </Card>

              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #722ed1' }}>
                <Space align="start" size={14}>
                  <MailOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Email Support</Text>
                    <Text style={{ fontWeight: 600 }}>{email1}</Text>
                  </div>
                </Space>
              </Card>

              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #faad14' }}>
                <Space align="start" size={14}>
                  <ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Business Hours</Text>
                    <Text type="secondary">{openingHours}</Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default ContactUs;
