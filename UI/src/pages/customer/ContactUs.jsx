import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Space, Input, Button, Form, message, Divider, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { 
  PhoneOutlined, MailOutlined, EnvironmentOutlined, WhatsAppOutlined, 
  SendOutlined, ClockCircleOutlined, InstagramOutlined, ShopOutlined 
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

  const shopName = shopInfo?.shopName || 'Store';
  
  // Format clean address without floating empty commas
  const addressParts = [
    shopInfo?.addressLine1,
    shopInfo?.addressLine2,
    shopInfo?.city,
    shopInfo?.state ? (shopInfo?.pincode ? `${shopInfo.state} - ${shopInfo.pincode}` : shopInfo.state) : shopInfo?.pincode,
    shopInfo?.country
  ].filter(p => p && p.trim() !== '');

  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Store Main Branch, City Center, India';
  
  const phone1 = shopInfo?.phone1 || '+91 9876543210';
  const cleanPhone = phone1.replace(/[^0-9+]/g, '');

  const whatsapp = shopInfo?.whatsAppNumber || phone1;
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, '');

  const email1 = shopInfo?.email1 || 'support@store.com';
  const openingHours = shopInfo?.openingHours || 'Mon - Sat: 9:00 AM - 8:00 PM';
  const instagramUrl = shopInfo?.instagramUrl || 'https://instagram.com';

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await shopApi.sendContactMessage(values);
      if (res.success) {
        message.success(res.message || 'Thank you! Your message has been sent directly to our company inbox.');
        form.resetFields();
      } else {
        message.error(res.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact message error:', err);
      message.error(err?.response?.data?.message || 'Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
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
          We would love to hear from you! Get in touch for order support, product inquiries, or feedback.
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
                  style={{ borderRadius: '8px', background: '#ec4899', borderColor: '#ec4899' }}
                >
                  Send Message
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Store Info Cards */}
          <Col xs={24} md={10}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {/* Store Address */}
              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #1890ff', background: '#fff' }}>
                <Space align="start" size={14}>
                  <EnvironmentOutlined style={{ fontSize: '24px', color: '#1890ff', marginTop: '2px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Store Address</Text>
                    <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>{fullAddress}</Text>
                  </div>
                </Space>
              </Card>

              {/* Phone Support */}
              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #52c41a', background: '#fff' }}>
                <Space align="start" size={14}>
                  <PhoneOutlined style={{ fontSize: '24px', color: '#52c41a', marginTop: '2px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Phone Support</Text>
                    <a href={`tel:${cleanPhone}`} style={{ fontSize: '15px', fontWeight: 700, color: '#1f1f1f' }}>
                      {phone1} <Text type="secondary" style={{ fontSize: '12px', color: '#52c41a' }}>(Click to Call 📞)</Text>
                    </a>
                  </div>
                </Space>
              </Card>

              {/* WhatsApp Hotline */}
              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #25D366', background: '#fff' }}>
                <Space align="start" size={14}>
                  <WhatsAppOutlined style={{ fontSize: '24px', color: '#25D366', marginTop: '2px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>WhatsApp Hotline</Text>
                    <a
                      href={`https://wa.me/${cleanWhatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '15px', fontWeight: 700, color: '#1f1f1f' }}
                    >
                      {whatsapp} <Text type="secondary" style={{ fontSize: '12px', color: '#25D366' }}>(Click to Chat 💬)</Text>
                    </a>
                  </div>
                </Space>
              </Card>

              {/* Email Support */}
              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #ec4899', background: '#fff' }}>
                <Space align="start" size={14}>
                  <MailOutlined style={{ fontSize: '24px', color: '#ec4899', marginTop: '2px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Email Support</Text>
                    <a href={`mailto:${email1}`} style={{ fontSize: '14px', fontWeight: 600, color: '#ec4899' }}>
                      {email1}
                    </a>
                  </div>
                </Space>
              </Card>

              {/* Instagram Card */}
              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #E1306C', background: '#fff' }}>
                <Space align="start" size={14}>
                  <InstagramOutlined style={{ fontSize: '24px', color: '#E1306C', marginTop: '2px' }} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: '14px' }}>Instagram Official</Text>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '14px', fontWeight: 600, color: '#E1306C' }}
                    >
                      Follow @{shopName.replace(/\s+/g, '').toLowerCase()} ↗
                    </a>
                  </div>
                </Space>
              </Card>

              {/* Business Hours */}
              <Card style={{ borderRadius: '14px', borderLeft: '4px solid #faad14', background: '#fff' }}>
                <Space align="start" size={14}>
                  <ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14', marginTop: '2px' }} />
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
