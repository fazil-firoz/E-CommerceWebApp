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
  const [logoError, setLogoError] = useState(false);
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

  // Dynamic 3-Second Rotating Tagline Ribbon (Configured via UI Control)
  const defaultPhrases = [
    '✨ Surprisingly Affordable',
    '💖 100% Genuine & Certified Products',
    '🚀 Fast Express Doorstep Delivery',
    '⭐ 50,000+ Happy Smiles Delivered',
    '🎁 Free Gift Wrapping On All Orders'
  ];

  const parsedPhrases = shopSettings?.badgeRibbonText
    ? shopSettings.badgeRibbonText.split(/•|,|\|/).map(s => s.trim()).filter(Boolean)
    : [];

  const rotatingPhrases = parsedPhrases.length > 0 ? parsedPhrases : defaultPhrases;
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [rotatingPhrases.length]);

  const menuItems = [
    {
      key: '/',
      // icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/products',
      // icon: <ShopOutlined />,
      label: <Link to="/products">Products</Link>,
    }
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

    /* 3-Second Word Ticker Keyframes */
    @keyframes kawaii-word-slide {
      0% { opacity: 0; transform: translateY(-6px); }
      15% { opacity: 1; transform: translateY(0); }
      85% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(6px); }
    }
    .kawaii-word-ticker {
      animation: kawaii-word-slide 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* ===== KAWAII FLOATING OBJECTS SCROLL STRIP (100% Straight Line) ===== */
    @keyframes kawaii-scroll-left {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .kawaii-strip-track {
      display: flex;
      align-items: center;
      gap: 0;
      animation: kawaii-scroll-left 28s linear infinite;
      will-change: transform;
      width: max-content;
      height: 48px;
    }

    .kawaii-strip-track:hover {
      animation-play-state: paused;
    }

    .kawaii-3d-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 6px 16px;
      height: 36px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
      white-space: nowrap;
      cursor: default;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      user-select: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    .kawaii-3d-chip:hover {
      transform: translateY(-2px) scale(1.05);
      animation-play-state: paused;
    }

    .kawaii-3d-chip .chip-emoji {
      font-size: 18px;
      display: inline-flex;
      align-items: center;
      line-height: 1;
    }

    .kawaii-strip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${primaryColor}70;
      margin: 0 14px;
      flex-shrink: 0;
    }
  `;

  const isHomePage = location.pathname === '/';

  return (
    <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%' }}>
      {/* Dynamic theme style injection */}
      <style>{menuThemeStyle}</style>
      {/* =============================================== */}
      {/* STICKY NAVBAR — shown on all pages EXCEPT home  */}
      {/* =============================================== */}
      {!isHomePage && (
      <Header className="mobile-header-padding" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
        lineHeight: '64px',
        background: '#ffffff',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        {/* Brand Logo & Name (Styled matching ELLA LUMIA signboard) */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }} onClick={() => navigate('/')}>
          {logoUrl && !logoError ? (
            <img
              src={logoUrl}
              alt={shopName}
              onError={() => setLogoError(true)}
              style={{ maxHeight: '36px', maxWidth: '100px', objectFit: 'contain' }}
            />
          ) : (
            <div style={{
              background: `linear-gradient(135deg, ${activeTheme?.primaryColor || '#ff6584'} 0%, ${activeTheme?.secondaryColor || '#ff85c0'} 100%)`,
              width: '34px', height: '34px',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${activeTheme?.primaryColor || '#ff6584'}40`,
              flexShrink: 0
            }}>
              <ShopOutlined style={{ color: '#fff', fontSize: '18px' }} />
            </div>
          )}
          <Typography.Title level={4} className="store-brand-title mobile-brand-title" style={{
            margin: 0,
            color: '#2d3748',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            transition: 'color 0.3s ease'
          }}>
            {shopName}
          </Typography.Title>
        </div>

        {/* Centered Nav menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="customer-nav"
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            borderBottom: 'none',
            background: 'transparent',
            transition: 'all 0.3s ease'
          }}
        />

        {/* Right actions (Perfectly Aligned) */}
        <Space size={8} align="center">
          {/* Customer Login / Avatar */}
          <Tooltip title={isLoggedIn ? `Signed in as ${customer?.email}` : 'Sign in'} placement="bottom">
            <Button
              type="text"
              onClick={() => setLoginDrawerOpen(true)}
              style={{
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '10px',
                padding: '0 6px'
              }}
            >
              {isLoggedIn ? (
                <Avatar
                  size={30}
                  style={{
                    background: `linear-gradient(135deg, ${activeTheme?.primaryColor || '#ff6584'}, ${activeTheme?.secondaryColor || '#ff85c0'})`,
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {customer?.name?.[0]?.toUpperCase()}
                </Avatar>
              ) : (
                <div style={{
                  width: '30px', height: '30px',
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

          {/* Wishlist Header Icon */}
          {superAdminControl.isWishlistEnabled !== false && (
            <Link to="/wishlist">
              <Badge count={wishlistCount} offset={[2, 0]} color={activeTheme?.accentColor || '#ff4d4f'}>
                <Button
                  type="text"
                  icon={<HeartFilled style={{ fontSize: '19px', color: activeTheme?.accentColor || '#ff4d4f' }} />}
                  style={{ height: '38px', display: 'flex', alignItems: 'center', borderRadius: '10px', padding: '0 6px' }}
                >
                  <span className="mobile-hide-label" style={{ marginLeft: '4px', fontWeight: 700, fontSize: '13px', color: activeTheme?.accentColor || '#ff4d4f' }}>Wishlist</span>
                </Button>
              </Badge>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart">
            <Badge count={cartCount} offset={[2, 0]} color="#52c41a">
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: '21px', color: activeTheme?.primaryColor || '#1890ff' }} />}
                style={{ height: '38px', display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '0 6px' }}
              >
                <span className="mobile-hide-label" style={{ marginLeft: '4px', fontWeight: 600, color: activeTheme?.primaryColor || '#1890ff' }}>Cart</span>
              </Button>
            </Badge>
          </Link>

          {/* Admin quick access */}
          {isAuthenticated && (
            <Button
              type="primary"
              ghost
              size="small"
              icon={<DashboardOutlined />}
              onClick={() => navigate('/admin')}
              style={{ borderRadius: '6px' }}
            >
              <span className="mobile-hide-label">Dashboard</span>
            </Button>
          )}
        </Space>
      </Header>
      )}



      {/* ===== 3D KAWAII FLOATING OBJECTS SCROLL STRIP — home page only ===== */}
      {isHomePage && superAdminControl.isKawaiiScrollStripEnabled !== false && (
      <div style={{
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${activeTheme?.backgroundColor || '#fff5f7'} 0%, #ffffff 40%, ${activeTheme?.backgroundColor || '#fff5f7'} 100%)`,
        borderBottom: `1px solid ${primaryColor}22`,
        padding: '6px 0',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Subtle side fade masks */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
          background: `linear-gradient(90deg, ${activeTheme?.backgroundColor || '#fff5f7'} 0%, transparent 6%, transparent 94%, ${activeTheme?.backgroundColor || '#fff5f7'} 100%)`
        }} />
        <div className="kawaii-strip-track">
          {[
            { emoji: '🧸', label: 'Teddy Bears', color: `${primaryColor}18`, border: `${primaryColor}30`, delay: '0s', dur: '3.0s' },
            { emoji: '🌸', label: 'Kawaii Gifts', color: '#fff0f5', border: '#ffb3c6', delay: '0.4s', dur: '3.4s' },
            { emoji: '🎀', label: 'Gift Wrapping', color: '#f9f0ff', border: '#d3adf7', delay: '0.8s', dur: '2.8s' },
            { emoji: '🚀', label: 'Fast Delivery', color: '#e6f7ff', border: '#91d5ff', delay: '0.2s', dur: '3.6s' },
            { emoji: '✨', label: 'Premium Quality', color: '#fffbe6', border: '#ffe58f', delay: '0.6s', dur: '3.1s' },
            { emoji: '🎮', label: 'Fun & Play', color: '#f6ffed', border: '#b7eb8f', delay: '1.0s', dur: '2.9s' },
            { emoji: '💖', label: 'Made with Love', color: '#fff1f0', border: '#ffccc7', delay: '0.3s', dur: '3.3s' },
            { emoji: '🌈', label: 'Bright Colors', color: '#e6fffb', border: '#87e8de', delay: '0.7s', dur: '3.5s' },
            { emoji: '🎁', label: 'Special Offers', color: `${primaryColor}14`, border: `${primaryColor}28`, delay: '0.5s', dur: '3.2s' },
            { emoji: '⭐', label: '5-Star Rated',  color: '#fffbe6', border: '#ffd666', delay: '0.9s', dur: '2.7s' },
            { emoji: '🦄', label: 'Unique & Rare',  color: '#f9f0ff', border: '#c9b4f5', delay: '1.1s', dur: '3.7s' },
            { emoji: '🍬', label: 'Sweet Deals',   color: '#fff0f5', border: '#ffadd2', delay: '0.1s', dur: '3.0s' },
          ].flatMap((item, i) => [
            <div
              key={`chip-${i}`}
              className="kawaii-3d-chip"
              style={{
                background: item.color,
                border: `1.5px solid ${item.border}`,
                boxShadow: `0 6px 20px ${item.border}50, inset 0 1px 0 rgba(255,255,255,0.7)`,
                '--bob-delay': item.delay,
                '--bob-dur': item.dur,
                animationDelay: item.delay,
              }}
            >
              <span className="chip-emoji" style={{ '--bob-delay': item.delay, '--bob-dur': item.dur }}>{item.emoji}</span>
              <span style={{ color: '#374151', fontWeight: 700, fontSize: '12px', letterSpacing: '0.4px' }}>{item.label}</span>
            </div>,
            <div key={`dot-${i}`} className="kawaii-strip-dot" />
          ])}
          {/* Duplicated set for seamless loop */}
          {[
            { emoji: '🧸', label: 'Teddy Bears', color: `${primaryColor}18`, border: `${primaryColor}30`, delay: '0s', dur: '3.0s' },
            { emoji: '🌸', label: 'Kawaii Gifts', color: '#fff0f5', border: '#ffb3c6', delay: '0.4s', dur: '3.4s' },
            { emoji: '🎀', label: 'Gift Wrapping', color: '#f9f0ff', border: '#d3adf7', delay: '0.8s', dur: '2.8s' },
            { emoji: '🚀', label: 'Fast Delivery', color: '#e6f7ff', border: '#91d5ff', delay: '0.2s', dur: '3.6s' },
            { emoji: '✨', label: 'Premium Quality', color: '#fffbe6', border: '#ffe58f', delay: '0.6s', dur: '3.1s' },
            { emoji: '🎮', label: 'Fun & Play', color: '#f6ffed', border: '#b7eb8f', delay: '1.0s', dur: '2.9s' },
            { emoji: '💖', label: 'Made with Love', color: '#fff1f0', border: '#ffccc7', delay: '0.3s', dur: '3.3s' },
            { emoji: '🌈', label: 'Bright Colors', color: '#e6fffb', border: '#87e8de', delay: '0.7s', dur: '3.5s' },
            { emoji: '🎁', label: 'Special Offers', color: `${primaryColor}14`, border: `${primaryColor}28`, delay: '0.5s', dur: '3.2s' },
            { emoji: '⭐', label: '5-Star Rated',  color: '#fffbe6', border: '#ffd666', delay: '0.9s', dur: '2.7s' },
            { emoji: '🦄', label: 'Unique & Rare',  color: '#f9f0ff', border: '#c9b4f5', delay: '1.1s', dur: '3.7s' },
            { emoji: '🍬', label: 'Sweet Deals',   color: '#fff0f5', border: '#ffadd2', delay: '0.1s', dur: '3.0s' },
          ].flatMap((item, i) => [
            <div
              key={`chip-b-${i}`}
              className="kawaii-3d-chip"
              style={{
                background: item.color,
                border: `1.5px solid ${item.border}`,
                boxShadow: `0 6px 20px ${item.border}50, inset 0 1px 0 rgba(255,255,255,0.7)`,
                '--bob-delay': item.delay,
                '--bob-dur': item.dur,
                animationDelay: item.delay,
              }}
            >
              <span className="chip-emoji" style={{ '--bob-delay': item.delay, '--bob-dur': item.dur }}>{item.emoji}</span>
              <span style={{ color: '#374151', fontWeight: 700, fontSize: '12px', letterSpacing: '0.4px' }}>{item.label}</span>
            </div>,
            <div key={`dot-b-${i}`} className="kawaii-strip-dot" />
          ])}
        </div>
      </div>
      )}

      {/* 3-Second Auto-Rotating Words Ribbon — home page only */}
      {isHomePage && superAdminControl.isBadgeRibbonEnabled !== false && (
      <div style={{
        background: activeTheme?.backgroundColor || '#fff5f7',
        borderBottom: `1px solid ${primaryColor}15`,
        padding: '7px 16px',
        textAlign: 'center',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.4px',
        color: '#475569',
        overflow: 'hidden'
      }}>
        <div key={phraseIndex} className="kawaii-word-ticker">
          <span style={{ color: primaryColor, fontWeight: 800 }}>{rotatingPhrases[phraseIndex]}</span>
        </div>
      </div>
      )}

      {/* Clean Perfectly Aligned Simple Nav Row — HOME PAGE ONLY */}
      {isHomePage && (
        <div style={{
          background: activeTheme?.backgroundColor || '#fff5f7',
          borderBottom: `1px solid ${primaryColor}18`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          padding: '10px 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            width: '100%',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            boxSizing: 'border-box'
          }}>
            <Link to="/" style={{
              color: location.pathname === '/' ? primaryColor : '#475569',
              fontWeight: location.pathname === '/' ? 800 : 600,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              borderBottom: location.pathname === '/' ? `2px solid ${primaryColor}` : '2px solid transparent',
              paddingBottom: '2px'
            }}>
              <HomeOutlined style={{ color: primaryColor, fontSize: '15px' }} /> Home
            </Link>

            <Link to="/products" style={{
              color: location.pathname.startsWith('/products') ? primaryColor : '#475569',
              fontWeight: location.pathname.startsWith('/products') ? 800 : 600,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              borderBottom: location.pathname.startsWith('/products') ? `2px solid ${primaryColor}` : '2px solid transparent',
              paddingBottom: '2px'
            }}>
              <ShopOutlined style={{ color: primaryColor, fontSize: '15px' }} /> Products
            </Link>

            <span style={{ color: '#cbd5e1', fontWeight: 300, fontSize: '14px' }}>|</span>

            {/* Wishlist Link */}
            {superAdminControl.isWishlistEnabled !== false && (
              <Link to="/wishlist" style={{
                color: location.pathname === '/wishlist' ? (activeTheme?.accentColor || '#ff4d4f') : '#475569',
                fontWeight: location.pathname === '/wishlist' ? 800 : 600,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                borderBottom: location.pathname === '/wishlist' ? `2px solid ${activeTheme?.accentColor || '#ff4d4f'}` : '2px solid transparent',
                paddingBottom: '2px'
              }}>
                <Badge count={wishlistCount} size="small" color={activeTheme?.accentColor || '#ff4d4f'}>
                  <HeartFilled style={{ fontSize: '16px', color: activeTheme?.accentColor || '#ff4d4f' }} />
                </Badge>
                Wishlist
              </Link>
            )}

            {/* Cart Link */}
            <Link to="/cart" style={{
              color: location.pathname === '/cart' ? primaryColor : '#475569',
              fontWeight: location.pathname === '/cart' ? 800 : 600,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              borderBottom: location.pathname === '/cart' ? `2px solid ${primaryColor}` : '2px solid transparent',
              paddingBottom: '2px'
            }}>
              <Badge count={cartCount} size="small" color="#52c41a">
                <ShoppingCartOutlined style={{ fontSize: '17px', color: primaryColor }} />
              </Badge>
              Cart
            </Link>

            {/* User Sign in / Profile Icon */}
            <Tooltip title={isLoggedIn ? `Signed in as ${customer?.email}` : 'Sign in'}>
              <div
                onClick={() => setLoginDrawerOpen(true)}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}
              >
                {isLoggedIn ? (
                  <Avatar size={24} style={{ background: primaryColor, fontSize: '11px', fontWeight: 700 }}>
                    {customer?.name?.[0]?.toUpperCase()}
                  </Avatar>
                ) : (
                  <UserOutlined style={{ fontSize: '17px', color: '#475569' }} />
                )}
              </div>
            </Tooltip>

            {/* Admin shortcut */}
            {isAuthenticated && (
              <Tooltip title="Admin Dashboard">
                <DashboardOutlined
                  onClick={() => navigate('/admin')}
                  style={{ fontSize: '16px', color: '#64748b', cursor: 'pointer' }}
                />
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {/* Main Content View */}
      <Content style={{
        flex: 1,
        padding: isHomePage ? '20px 24px 48px' : '20px 24px 48px',
        background: isHomePage ? (activeTheme?.backgroundColor || '#fff5f7') : '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.3s ease',
        width: '100%',
        overflowX: 'hidden'
      }}>
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
