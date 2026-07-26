import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Button, Space, Typography, Tooltip, Avatar, Row, Col, Divider } from 'antd';
import {
  ShoppingCartOutlined, ShopOutlined, HomeOutlined,
  DashboardOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, WhatsAppOutlined, ClockCircleOutlined,
  FacebookOutlined, InstagramOutlined, TwitterOutlined, YoutubeOutlined,
  SafetyCertificateOutlined, LockOutlined, RocketOutlined, InfoCircleOutlined,
  HeartFilled
} from '@ant-design/icons';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { ThemeContext } from '../context/ThemeContext';
import LoginDrawer from '../components/LoginDrawer';
import { shopApi } from '../api/shopApi';
import { superAdminApi } from '../api/superAdminApi';
import { resolveProductImageUrl } from '../utils/imageHelper';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const CustomerLayout = () => {
  const { cartCount } = useContext(CartContext);
  const { wishlistCount } = useContext(WishlistContext);
  const { isAuthenticated } = useContext(AdminAuthContext);
  const { customer, isLoggedIn } = useCustomerAuth();
  const { activeTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);
  const [superAdminControl, setSuperAdminControl] = useState({
    isWhatsAppFloatingWidgetEnabled: true
  });

  // Fetch shop settings for footer data and Super Admin control flags
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

    const fetchSuperAdminControls = async () => {
      try {
        const res = await superAdminApi.getControl();
        if (res.success && res.data) {
          setSuperAdminControl(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch Super Admin control flags', err);
      }
    };

    fetchShopInfo();
    fetchSuperAdminControls();

    window.addEventListener('superAdminControlUpdated', fetchSuperAdminControls);
    return () => window.removeEventListener('superAdminControlUpdated', fetchSuperAdminControls);
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
      label: <Link to="/products">Products</Link>,
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

  const shopName = shopSettings?.shopName || 'Store';
  const motto = shopSettings?.motto || 'Your portal to imagination, joy, and endless play.';
  const logoUrl = shopSettings?.logoUrl ? resolveProductImageUrl(shopSettings.logoUrl) : null;
  
  const addressParts = [
    shopSettings?.addressLine1,
    shopSettings?.addressLine2,
    shopSettings?.city,
    shopSettings?.state ? (shopSettings?.pincode ? `${shopSettings.state} - ${shopSettings.pincode}` : shopSettings.state) : shopSettings?.pincode,
    shopSettings?.country
  ].filter(p => p && p.trim() !== '');

  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Store Main Branch, City Center, India';

  const phone1 = shopSettings?.phone1 || '+91 9876543210';
  const whatsappNumberRaw = shopSettings?.whatsAppNumber || shopSettings?.phone1 || '9876543210';
  const cleanWhatsappNumber = whatsappNumberRaw.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(`Hello ${shopName}! I have an inquiry about products on your store.`)}`;

  const email1 = shopSettings?.email1 || 'support@store.com';
  const openingHours = shopSettings?.openingHours || 'Mon - Sat: 9:00 AM - 8:00 PM';

  const fb = shopSettings?.facebookUrl;
  const insta = shopSettings?.instagramUrl;
  const twitter = shopSettings?.twitterUrl;
  const yt = shopSettings?.youTubeUrl;

  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const headerBg = activeTheme?.headerBgColor || '#ffffff';

  // Dynamic CSS to override Ant Design Menu active/hover colors with theme & import signboard font
  const menuThemeStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;800;900&family=Syne:wght@700;800&family=Outfit:wght@600;700;800&display=swap');

    .store-brand-title {
      font-family: 'Orbitron', 'Syne', 'Outfit', -apple-system, sans-serif !important;
    }

    /* Nav menu active/hover colors */
    .customer-nav.ant-menu-horizontal {
      height: 72px !important;
      line-height: 72px !important;
    }
    .customer-nav.ant-menu-horizontal > .ant-menu-item {
      display: inline-flex !important;
      align-items: center !important;
      font-size: 15px !important;
      font-weight: 700 !important;
    }
    .customer-nav.ant-menu-horizontal > .ant-menu-item-selected a,
    .customer-nav.ant-menu-horizontal > .ant-menu-item-selected span,
    .customer-nav.ant-menu-horizontal > .ant-menu-item-selected .ant-menu-title-content a,
    .customer-nav.ant-menu-horizontal > .ant-menu-item-active a,
    .customer-nav.ant-menu-horizontal > .ant-menu-item-active span {
      color: ${primaryColor} !important;
    }
    .customer-nav.ant-menu-horizontal > .ant-menu-item-selected::after {
      border-bottom-color: ${primaryColor} !important;
    }
    .customer-nav.ant-menu-horizontal > .ant-menu-item:hover::after {
      border-bottom-color: ${primaryColor} !important;
    }
    .customer-nav.ant-menu-horizontal > .ant-menu-item:hover a,
    .customer-nav.ant-menu-horizontal > .ant-menu-item:hover span {
      color: ${primaryColor} !important;
    }

    /* Search button - Ant Design v4 & v5 */
    .themed-search-input .ant-input-search-button,
    .themed-search-input .ant-btn.ant-btn-primary,
    .themed-search-input button[type=button].ant-btn-primary {
      background: ${primaryColor} !important;
      background-color: ${primaryColor} !important;
      border-color: ${primaryColor} !important;
      color: #fff !important;
    }
    .themed-search-input .ant-input-search-button:hover,
    .themed-search-input .ant-btn.ant-btn-primary:hover {
      background: ${primaryColor}cc !important;
      background-color: ${primaryColor}cc !important;
      border-color: ${primaryColor}cc !important;
    }
    /* Input focus ring */
    .themed-search-input .ant-input:focus,
    .themed-search-input .ant-input-affix-wrapper:focus-within,
    .themed-search-input .ant-input-affix-wrapper-focused {
      border-color: ${primaryColor} !important;
      box-shadow: 0 0 0 2px ${primaryColor}28 !important;
    }
  `;

  return (
    <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic theme style injection */}
      <style>{menuThemeStyle}</style>
      {/* Sticky Header - Blended Glassmorphism */}
      <Header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '72px',
        lineHeight: '72px',
        background: activeTheme?.backgroundColor
          ? `linear-gradient(180deg, ${activeTheme.backgroundColor} 0%, ${activeTheme.backgroundColor}cc 100%)`
          : 'rgba(255, 245, 247, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: `0 4px 20px ${activeTheme?.primaryColor || '#ff6584'}15`,
        borderBottom: `1px solid ${activeTheme?.primaryColor || '#ff6584'}25`,
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        {/* Brand Logo & Name (Styled matching ELLA LUMIA signboard) */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }} onClick={() => navigate('/')}>
          {logoUrl ? (
            <img src={logoUrl} alt={shopName} style={{ maxHeight: '44px', maxWidth: '140px', objectFit: 'contain' }} />
          ) : (
            <div style={{
              background: `linear-gradient(135deg, ${activeTheme?.primaryColor || '#ff6584'} 0%, ${activeTheme?.secondaryColor || '#ff85c0'} 100%)`,
              width: '42px', height: '42px',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${activeTheme?.primaryColor || '#ff6584'}40`,
              flexShrink: 0
            }}>
              <ShopOutlined style={{ color: '#fff', fontSize: '22px' }} />
            </div>
          )}
          <Typography.Title level={4} className="store-brand-title" style={{
            margin: 0,
            color: activeTheme?.primaryColor || '#ff6584',
            fontSize: '22px',
            fontWeight: 900,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
            transition: 'color 0.3s ease'
          }}>
            {shopName}
          </Typography.Title>
        </div>

        {/* Nav menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="customer-nav"
          style={{ flex: 1, marginLeft: '28px', borderBottom: 'none', background: 'transparent', transition: 'all 0.3s ease' }}
        />

        {/* Right actions (Perfectly Aligned) */}
        <Space size={12} align="center">
          {/* Customer Login / Avatar */}
          <Tooltip title={isLoggedIn ? `Signed in as ${customer?.email}` : 'Sign in'} placement="bottom">
            <Button
              type="text"
              onClick={() => setLoginDrawerOpen(true)}
              style={{
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '10px',
                padding: '0 12px'
              }}
            >
              {isLoggedIn ? (
                <Avatar
                  size={34}
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme?.primaryColor || '#ff6584'}, ${activeTheme?.secondaryColor || '#ff85c0'})`,
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {customer?.name?.[0]?.toUpperCase()}
                </Avatar>
              ) : (
                <div style={{
                  width: '34px', height: '34px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#595959'
                }}>
                  <UserOutlined style={{ fontSize: '16px' }} />
                </div>
              )}
            </Button>
          </Tooltip>

          {/* Wishlist Header Icon */}
          {superAdminControl.isWishlistEnabled !== false && (
            <Link to="/wishlist">
              <Badge count={wishlistCount} offset={[2, 0]} color={activeTheme?.accentColor || '#ff4d4f'}>
                <Button
                  type="text"
                  icon={<HeartFilled style={{ fontSize: '20px', color: activeTheme?.accentColor || '#ff4d4f' }} />}
                  style={{ height: '42px', display: 'flex', alignItems: 'center', borderRadius: '10px', padding: '0 12px' }}
                >
                  <span style={{ marginLeft: '6px', fontWeight: 700, fontSize: '14px', color: activeTheme?.accentColor || '#ff4d4f' }}>Wishlist</span>
                </Button>
              </Badge>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart">
            <Badge count={cartCount} offset={[2, 0]} color="#52c41a">
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: '22px', color: activeTheme?.primaryColor || '#1890ff' }} />}
                style={{ height: '40px', display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '0 10px' }}
              >
                <span style={{ marginLeft: '4px', fontWeight: 600, color: activeTheme?.primaryColor || '#1890ff' }}>Cart</span>
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
      <Content style={{ flex: 1, padding: '24px 50px', background: activeTheme?.backgroundColor || '#fff5f7', display: 'flex', flexDirection: 'column', transition: 'background 0.3s ease' }}>
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
                  <span><strong>Call:</strong> <a href={`tel:${phone1.replace(/[^0-9+]/g, '')}`} style={{ color: '#ffffffd9' }}>{phone1}</a></span>
                </Space>
                <Space align="center">
                  <WhatsAppOutlined style={{ color: '#25D366' }} />
                  <span><strong>WhatsApp:</strong> <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>{whatsappNumberRaw}</a></span>
                </Space>
                <Space align="center">
                  <MailOutlined style={{ color: '#ec4899' }} />
                  <span><strong>Email:</strong> <a href={`mailto:${email1}`} style={{ color: '#ffffffd9' }}>{email1}</a></span>
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

      {/* 💬 Floating WhatsApp Live Chatbot Button (Fixed Bottom-Right with Up & Down Bounce) */}
      {superAdminControl.isWhatsAppFloatingWidgetEnabled && (
        <Tooltip title="Chat with us on WhatsApp" placement="left">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float-widget"
            style={{
              position: 'fixed',
              bottom: '28px',
              right: '28px',
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: '#25D366',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              textDecoration: 'none'
            }}
          >
            <WhatsAppOutlined style={{ fontSize: '32px' }} />
            {/* Subtle active online badge indicator */}
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '13px',
                height: '13px',
                backgroundColor: '#52c41a',
                border: '2px solid #ffffff',
                borderRadius: '50%'
              }}
            />
          </a>
        </Tooltip>
      )}

      {/* Customer Login Drawer */}
      <LoginDrawer open={loginDrawerOpen} onClose={() => setLoginDrawerOpen(false)} />
    </Layout>
  );
};

export default CustomerLayout;
