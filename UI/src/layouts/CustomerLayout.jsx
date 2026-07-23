import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Button, Space, Typography, Tooltip, Avatar, Row, Col, Divider } from 'antd';
import {
  ShoppingCartOutlined, ShopOutlined, HomeOutlined,
  DashboardOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, WhatsAppOutlined, ClockCircleOutlined,
  FacebookOutlined, InstagramOutlined, TwitterOutlined, YoutubeOutlined,
  SafetyCertificateOutlined, LockOutlined, RocketOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { CartContext } from '../context/CartContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import LoginDrawer from '../components/LoginDrawer';
import { shopApi } from '../api/shopApi';
import { resolveProductImageUrl } from '../utils/imageHelper';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const CustomerLayout = () => {
  const { cartCount } = useContext(CartContext);
  const { isAuthenticated } = useContext(AdminAuthContext);
  const { customer, isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);

  // Fetch shop settings for footer data
  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) {
          setShopSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch shop info for footer', err);
      }
    };
    fetchShopInfo();
  }, []);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: <Link to="/products">Toys Catalog</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">About Us</Link>,
    },
    {
      key: '/contact',
      icon: <PhoneOutlined />,
      label: <Link to="/contact">Contact</Link>,
    },
  ];

  const shopName = shopSettings?.shopName || 'ToyVerse';
  const motto = shopSettings?.motto || 'Your portal to imagination, joy, and endless play.';
  const logoUrl = shopSettings?.logoUrl ? resolveProductImageUrl(shopSettings.logoUrl) : null;
  const fullAddress = shopSettings 
    ? `${shopSettings.addressLine1}${shopSettings.addressLine2 ? ', ' + shopSettings.addressLine2 : ''}, ${shopSettings.city}, ${shopSettings.state} - ${shopSettings.pincode}` 
    : 'ToyVerse Main Branch, City Center';

  const phone1 = shopSettings?.phone1 || '+91 9876543210';
  const whatsapp = shopSettings?.whatsAppNumber || phone1;
  const email1 = shopSettings?.email1 || 'support@toyverse.com';
  const openingHours = shopSettings?.openingHours || 'Mon - Sat: 9:00 AM - 8:00 PM';

  const fb = shopSettings?.facebookUrl;
  const insta = shopSettings?.instagramUrl;
  const twitter = shopSettings?.twitterUrl;
  const yt = shopSettings?.youTubeUrl;

  return (
    <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <Header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          {logoUrl ? (
            <img src={logoUrl} alt={shopName} style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain', marginRight: '10px' }} />
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)',
              width: '40px', height: '40px',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '12px',
              boxShadow: '0 4px 10px rgba(255, 77, 79, 0.3)'
            }}>
              <ShopOutlined style={{ color: '#fff', fontSize: '20px' }} />
            </div>
          )}
          <Typography.Title level={4} style={{
            margin: 0,
            background: 'linear-gradient(45deg, #1890ff, #722ed1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}>
            {shopName}
          </Typography.Title>
        </div>

        {/* Nav menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, marginLeft: '24px', borderBottom: 'none' }}
        />

        {/* Right actions */}
        <Space size={8} align="center">
          {/* Customer Login / Avatar */}
          <Tooltip title={isLoggedIn ? `Signed in as ${customer?.email}` : 'Sign in'} placement="bottom">
            <Button
              type="text"
              onClick={() => setLoginDrawerOpen(true)}
              style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                padding: '0 10px'
              }}
            >
              {isLoggedIn ? (
                <Avatar
                  size={32}
                  style={{
                    background: 'linear-gradient(135deg, #1677ff, #4096ff)',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {customer?.name?.[0]?.toUpperCase()}
                </Avatar>
              ) : (
                <div style={{
                  width: '32px', height: '32px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#595959'
                }}>
                  <UserOutlined style={{ fontSize: '15px' }} />
                </div>
              )}
            </Button>
          </Tooltip>

          {/* Cart */}
          <Link to="/cart">
            <Badge count={cartCount} offset={[2, 0]} color="#52c41a">
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: '22px', color: '#1890ff' }} />}
                style={{ height: '40px', display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '0 10px' }}
              >
                <span style={{ marginLeft: '4px', fontWeight: 600, color: '#1890ff' }}>Cart</span>
              </Button>
            </Badge>
          </Link>

          {/* Admin quick access */}
          {isAuthenticated && (
            <Button
              type="primary"
              ghost
              icon={<DashboardOutlined />}
              onClick={() => navigate('/admin')}
              style={{ borderRadius: '8px' }}
            >
              Dashboard
            </Button>
          )}
        </Space>
      </Header>

      {/* Main Content View */}
      <Content style={{ flex: 1, padding: '24px 50px', background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>

      {/* Premium Professional Customer Footer */}
      <Footer style={{ background: '#001529', color: '#ffffffd9', padding: '48px 50px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            
            {/* Column 1: Shop Brand & Motto */}
            <Col xs={24} sm={12} md={7}>
              <Space align="center" style={{ marginBottom: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)',
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShopOutlined style={{ color: '#fff', fontSize: '18px' }} />
                </div>
                <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>
                  {shopName}
                </Title>
              </Space>
              <Paragraph style={{ color: '#ffffff80', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                {motto}
              </Paragraph>
              <Space size={12}>
                {fb ? <a href={fb} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: '18px' }}><FacebookOutlined /></a> : <FacebookOutlined style={{ color: '#ffffff60', fontSize: '18px' }} />}
                {insta ? <a href={insta} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: '18px' }}><InstagramOutlined /></a> : <InstagramOutlined style={{ color: '#ffffff60', fontSize: '18px' }} />}
                {twitter ? <a href={twitter} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: '18px' }}><TwitterOutlined /></a> : <TwitterOutlined style={{ color: '#ffffff60', fontSize: '18px' }} />}
                {yt ? <a href={yt} target="_blank" rel="noreferrer" style={{ color: '#fff', fontSize: '18px' }}><YoutubeOutlined /></a> : <YoutubeOutlined style={{ color: '#ffffff60', fontSize: '18px' }} />}
              </Space>
            </Col>

            {/* Column 2: Quick Links */}
            <Col xs={12} sm={12} md={5}>
              <Title level={5} style={{ color: '#fff', marginBottom: '16px', fontWeight: 700 }}>
                Quick Links
              </Title>
              <Space direction="vertical" size={10} style={{ width: '100%', fontSize: '13px' }}>
                <Link to="/" style={{ color: '#ffffffa6' }}>Home</Link>
                <Link to="/products" style={{ color: '#ffffffa6' }}>Toys Catalog</Link>
                <Link to="/cart" style={{ color: '#ffffffa6' }}>Shopping Cart</Link>
                <Link to="/about" style={{ color: '#ffffffa6' }}>About Us</Link>
                <Link to="/contact" style={{ color: '#ffffffa6' }}>Contact Us</Link>
              </Space>
            </Col>

            {/* Column 3: Customer Care & Policies */}
            <Col xs={12} sm={12} md={6}>
              <Title level={5} style={{ color: '#fff', marginBottom: '16px', fontWeight: 700 }}>
                Policies & Help
              </Title>
              <Space direction="vertical" size={10} style={{ width: '100%', fontSize: '13px' }}>
                <Link to="/privacy-policy" style={{ color: '#ffffffa6' }}>Privacy Policy</Link>
                <Link to="/refund-policy" style={{ color: '#ffffffa6' }}>Refund & Return Policy</Link>
                <Link to="/terms-conditions" style={{ color: '#ffffffa6' }}>Terms & Conditions</Link>
                <Link to="/shipping-policy" style={{ color: '#ffffffa6' }}>Shipping & Delivery Policy</Link>
                <Link to="/faqs" style={{ color: '#ffffffa6' }}>Help & FAQs</Link>
              </Space>
            </Col>

            {/* Column 4: Contact & Hotlines */}
            <Col xs={24} sm={12} md={6}>
              <Title level={5} style={{ color: '#fff', marginBottom: '16px', fontWeight: 700 }}>
                Reach Us
              </Title>
              <Space direction="vertical" size={12} style={{ width: '100%', fontSize: '13px', color: '#ffffffa6' }}>
                <Space align="start">
                  <EnvironmentOutlined style={{ color: '#1890ff', marginTop: '3px' }} />
                  <span>{fullAddress}</span>
                </Space>
                <Space align="center">
                  <PhoneOutlined style={{ color: '#52c41a' }} />
                  <span><strong>Call:</strong> {phone1}</span>
                </Space>
                <Space align="center">
                  <WhatsAppOutlined style={{ color: '#25D366' }} />
                  <span><strong>WhatsApp:</strong> {whatsapp}</span>
                </Space>
                <Space align="center">
                  <MailOutlined style={{ color: '#722ed1' }} />
                  <span><strong>Email:</strong> {email1}</span>
                </Space>
                <Space align="center">
                  <ClockCircleOutlined style={{ color: '#faad14' }} />
                  <span>{openingHours}</span>
                </Space>
              </Space>
            </Col>

          </Row>

          <Divider style={{ borderColor: '#ffffff1a', margin: '32px 0 20px' }} />

          {/* Sub-Footer Bar */}
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text style={{ color: '#ffffff60', fontSize: '12px' }}>
                {shopName} ©{new Date().getFullYear()} All rights reserved. Designed for child safety & joy.
              </Text>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space size={16} style={{ color: '#ffffff80', fontSize: '12px' }}>
                <span><LockOutlined style={{ color: '#52c41a' }} /> 256-Bit SSL Secured</span>
                <span><SafetyCertificateOutlined style={{ color: '#1890ff' }} /> Certified Toys</span>
                <span><RocketOutlined style={{ color: '#faad14' }} /> Fast Delivery</span>
              </Space>
            </Col>
          </Row>
        </div>
      </Footer>

      {/* Customer Login Drawer */}
      <LoginDrawer open={loginDrawerOpen} onClose={() => setLoginDrawerOpen(false)} />
    </Layout>
  );
};

export default CustomerLayout;
