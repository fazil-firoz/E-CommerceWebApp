import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Button, Space, Typography, Tooltip, Avatar, Row, Col, Divider } from 'antd';
import {
  ShoppingCartOutlined, ShopOutlined, HomeOutlined,
  DashboardOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, WhatsAppOutlined, ClockCircleOutlined,
  FacebookOutlined, InstagramOutlined, TwitterOutlined, YoutubeOutlined,
  SafetyCertificateOutlined, LockOutlined, RocketOutlined, HeartFilled,
  InfoCircleOutlined, HeartOutlined
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

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) setShopSettings(res.data);
      } catch (err) {
        console.error('Failed to fetch shop info for footer', err);
      }
    };
    fetchShopInfo();
  }, []);

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Home</Link> },
    { key: '/products', icon: <ShopOutlined />, label: <Link to="/products">Shop</Link> },
    { key: '/about', icon: <InfoCircleOutlined />, label: <Link to="/about">About</Link> },
    { key: '/contact', icon: <PhoneOutlined />, label: <Link to="/contact">Contact</Link> },
  ];

  const shopName = shopSettings?.shopName || 'Store';
  const motto = shopSettings?.motto || 'Cute aesthetic items curated just for you ♡';
  const logoUrl = shopSettings?.logoUrl ? resolveProductImageUrl(shopSettings.logoUrl) : null;
  const fullAddress = shopSettings
    ? `${shopSettings.addressLine1}${shopSettings.addressLine2 ? ', ' + shopSettings.addressLine2 : ''}, ${shopSettings.city}, ${shopSettings.state} - ${shopSettings.pincode}`
    : 'Store Main Branch';
  const phone1 = shopSettings?.phone1 || '+91 9876543210';
  const whatsapp = shopSettings?.whatsAppNumber || phone1;
  const email1 = shopSettings?.email1 || 'hello@store.com';
  const openingHours = shopSettings?.openingHours || 'Mon - Sat: 10:00 AM - 8:00 PM';
  const fb = shopSettings?.facebookUrl;
  const insta = shopSettings?.instagramUrl;
  const twitter = shopSettings?.twitterUrl;
  const yt = shopSettings?.youTubeUrl;

  return (
    <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Kawaii Header Styles */}
      <style>{`
        .kawaii-header {
          transition: all 0.3s ease;
        }
        .kawaii-header .ant-menu-horizontal {
          border-bottom: none !important;
          background: transparent !important;
        }
        .kawaii-header .ant-menu-horizontal .ant-menu-item {
          color: #6b7280 !important;
          font-weight: 600 !important;
          border-radius: 20px !important;
          transition: all 0.25s ease !important;
        }
        .kawaii-header .ant-menu-horizontal .ant-menu-item:hover,
        .kawaii-header .ant-menu-horizontal .ant-menu-item-selected {
          color: #ec4899 !important;
          background: #fdf2f8 !important;
        }
        .kawaii-header .ant-menu-horizontal .ant-menu-item-selected::after,
        .kawaii-header .ant-menu-horizontal .ant-menu-item::after {
          border-bottom: none !important;
        }
        .kawaii-nav-cart:hover {
          background: #fdf2f8 !important;
        }
        @media (max-width: 768px) {
          .kawaii-header-nav { display: none !important; }
          .kawaii-header-brand-text { font-size: 16px !important; }
        }
      `}</style>

      {/* Sticky Header */}
      <Header className="kawaii-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 12px rgba(236, 72, 153, 0.08)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #fce7f3'
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }} onClick={() => navigate('/')}>
          {logoUrl ? (
            <img src={logoUrl} alt={shopName} style={{ maxHeight: '38px', maxWidth: '110px', objectFit: 'contain' }} />
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
              width: '38px', height: '38px',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(236, 72, 153, 0.3)'
            }}>
              <HeartFilled style={{ color: '#fff', fontSize: '18px' }} />
            </div>
          )}
          <span className="kawaii-header-brand-text" style={{
            fontSize: '20px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {shopName}
          </span>
        </div>

        {/* Nav Menu */}
        <Menu
          className="kawaii-header-nav"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, marginLeft: '24px', borderBottom: 'none', background: 'transparent' }}
        />

        {/* Right Controls */}
        <Space size={6} align="center">
          {/* Customer Account */}
          <Tooltip title={isLoggedIn ? `Hi, ${customer?.name || customer?.email}` : 'Sign in'} placement="bottom">
            <Button
              type="text"
              onClick={() => setLoginDrawerOpen(true)}
              style={{
                height: '40px', display: 'flex', alignItems: 'center',
                borderRadius: '20px', padding: '0 12px', gap: '6px'
              }}
            >
              {isLoggedIn ? (
                <Avatar size={30} style={{
                  background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                  fontSize: '13px', fontWeight: 700
                }}>
                  {customer?.name?.[0]?.toUpperCase()}
                </Avatar>
              ) : (
                <div style={{
                  width: '32px', height: '32px',
                  border: '2px solid #f9a8d4', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ec4899', transition: 'all 0.2s'
                }}>
                  <UserOutlined style={{ fontSize: '14px' }} />
                </div>
              )}
            </Button>
          </Tooltip>

          {/* Cart */}
          <Link to="/cart">
            <Badge count={cartCount} offset={[2, 0]} color="#ec4899">
              <Button
                type="text"
                className="kawaii-nav-cart"
                icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: '#ec4899' }} />}
                style={{ height: '40px', display: 'flex', alignItems: 'center', borderRadius: '20px', padding: '0 12px' }}
              >
                <span style={{ marginLeft: '4px', fontWeight: 600, color: '#ec4899', fontSize: '14px' }}>Cart</span>
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
              style={{ borderRadius: '20px', borderColor: '#ec4899', color: '#ec4899' }}
            >
              Admin
            </Button>
          )}
        </Space>
      </Header>

      {/* Main Content */}
      <Content style={{ flex: 1, padding: '24px 32px', background: '#fdf2f8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>

      {/* Premium Kawaii Footer */}
      <Footer style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #111111 100%)', color: '#ffffffd9', padding: '48px 32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            {/* Col 1: Brand & Motto */}
            <Col xs={24} sm={12} md={7}>
              <Space align="center" style={{ marginBottom: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                  width: '34px', height: '34px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <HeartFilled style={{ color: '#fff', fontSize: '16px' }} />
                </div>
                <Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 800 }}>{shopName}</Title>
              </Space>
              <Paragraph style={{ color: '#ffffff70', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                {motto}
              </Paragraph>
              <Space size={12}>
                {fb ? <a href={fb} target="_blank" rel="noreferrer" style={{ color: '#f472b6', fontSize: '18px' }}><FacebookOutlined /></a> : <FacebookOutlined style={{ color: '#ffffff40', fontSize: '18px' }} />}
                {insta ? <a href={insta} target="_blank" rel="noreferrer" style={{ color: '#f472b6', fontSize: '18px' }}><InstagramOutlined /></a> : <InstagramOutlined style={{ color: '#ffffff40', fontSize: '18px' }} />}
                {twitter ? <a href={twitter} target="_blank" rel="noreferrer" style={{ color: '#f472b6', fontSize: '18px' }}><TwitterOutlined /></a> : <TwitterOutlined style={{ color: '#ffffff40', fontSize: '18px' }} />}
                {yt ? <a href={yt} target="_blank" rel="noreferrer" style={{ color: '#f472b6', fontSize: '18px' }}><YoutubeOutlined /></a> : <YoutubeOutlined style={{ color: '#ffffff40', fontSize: '18px' }} />}
              </Space>
            </Col>

            {/* Col 2: Quick Links */}
            <Col xs={12} sm={12} md={5}>
              <Title level={5} style={{ color: '#f472b6', marginBottom: '16px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Quick Links
              </Title>
              <Space direction="vertical" size={10} style={{ fontSize: '13px' }}>
                <Link to="/" style={{ color: '#ffffffa6' }}>Home</Link>
                <Link to="/products" style={{ color: '#ffffffa6' }}>Shop All</Link>
                <Link to="/cart" style={{ color: '#ffffffa6' }}>My Cart</Link>
                <Link to="/about" style={{ color: '#ffffffa6' }}>About Us</Link>
                <Link to="/contact" style={{ color: '#ffffffa6' }}>Contact Us</Link>
              </Space>
            </Col>

            {/* Col 3: Policies */}
            <Col xs={12} sm={12} md={6}>
              <Title level={5} style={{ color: '#f472b6', marginBottom: '16px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Help & Policies
              </Title>
              <Space direction="vertical" size={10} style={{ fontSize: '13px' }}>
                <Link to="/privacy-policy" style={{ color: '#ffffffa6' }}>Privacy Policy</Link>
                <Link to="/refund-policy" style={{ color: '#ffffffa6' }}>Return & Refund</Link>
                <Link to="/terms-conditions" style={{ color: '#ffffffa6' }}>Terms & Conditions</Link>
                <Link to="/shipping-policy" style={{ color: '#ffffffa6' }}>Shipping Info</Link>
                <Link to="/faqs" style={{ color: '#ffffffa6' }}>FAQs</Link>
              </Space>
            </Col>

            {/* Col 4: Contact */}
            <Col xs={24} sm={12} md={6}>
              <Title level={5} style={{ color: '#f472b6', marginBottom: '16px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Get in Touch
              </Title>
              <Space direction="vertical" size={12} style={{ fontSize: '13px', color: '#ffffffa6' }}>
                <Space align="start"><EnvironmentOutlined style={{ color: '#f472b6', marginTop: '3px' }} /><span>{fullAddress}</span></Space>
                <Space align="center"><PhoneOutlined style={{ color: '#f472b6' }} /><span>{phone1}</span></Space>
                <Space align="center"><WhatsAppOutlined style={{ color: '#25D366' }} /><span>{whatsapp}</span></Space>
                <Space align="center"><MailOutlined style={{ color: '#f472b6' }} /><span>{email1}</span></Space>
                <Space align="center"><ClockCircleOutlined style={{ color: '#f472b6' }} /><span>{openingHours}</span></Space>
              </Space>
            </Col>
          </Row>

          <Divider style={{ borderColor: '#ffffff12', margin: '32px 0 20px' }} />

          {/* Sub-Footer */}
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col xs={24} md={14}>
              <Text style={{ color: '#ffffff50', fontSize: '12px' }}>
                {shopName} ©{new Date().getFullYear()} All rights reserved. Made with <HeartFilled style={{ color: '#ec4899', fontSize: '11px' }} /> for kawaii lovers.
              </Text>
            </Col>
            <Col xs={24} md={10} style={{ textAlign: 'right' }}>
              <Space size={16} style={{ color: '#ffffff60', fontSize: '12px' }}>
                <span><LockOutlined style={{ color: '#f472b6' }} /> Secured</span>
                <span><SafetyCertificateOutlined style={{ color: '#f472b6' }} /> Certified</span>
                <span><RocketOutlined style={{ color: '#f472b6' }} /> Fast Delivery</span>
              </Space>
            </Col>
          </Row>
        </div>
      </Footer>

      <LoginDrawer open={loginDrawerOpen} onClose={() => setLoginDrawerOpen(false)} />
    </Layout>
  );
};

export default CustomerLayout;
