import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Col, Row, Button, Typography, Space, Spin, message, Tag, Carousel } from 'antd';
import {
  RightOutlined, FireOutlined, AppstoreOutlined, HeartOutlined, HeartFilled,
  StarOutlined, RocketOutlined, SafetyCertificateOutlined, SmileOutlined,
  GiftOutlined, CrownOutlined, ShoppingCartOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { shopApi } from '../../api/shopApi';
import { superAdminApi } from '../../api/superAdminApi';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { ThemeContext } from '../../context/ThemeContext';
import ProductBadge from '../../components/common/ProductBadge';
import HeroScrollAnimation from '../../components/common/HeroScrollAnimation';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { activeTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [superAdminControl, setSuperAdminControl] = useState({
    isWishlistEnabled: true,
    isHeroScrollAnimationEnabled: true,
    isHeroBannerEnabled: true,
    isCategoriesSectionEnabled: true,
    isFeaturedProductsEnabled: true,
    isNewArrivalsEnabled: true,
    isBestSellersEnabled: true,
    isPromoBannerEnabled: true,
    isWhyChooseUsEnabled: true,
    isMarqueeEnabled: true
  });

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const res = await superAdminApi.getControlFlags();
        if (res.success && res.data) {
          setSuperAdminControl(res.data);
        }
      } catch (err) {}
    };

    const fetchData = async () => {
      try {
        const [catRes, prodRes, shopRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll({ pageSize: 24 }),
          shopApi.getSettings()
        ]);

        if (catRes.success) setCategories(catRes.data || []);
        if (prodRes.success) setProducts(prodRes.data || []);
        if (shopRes.success && shopRes.data) setShopSettings(shopRes.data);
      } catch (err) {
        message.error('Failed to load homepage content');
      } finally {
        setLoading(false);
      }
    };

    fetchControls();
    fetchData();

    window.addEventListener('superAdminControlUpdated', fetchControls);
    return () => window.removeEventListener('superAdminControlUpdated', fetchControls);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Unboxing ToyVerse Wonderland..." />
      </div>
    );
  }

  // Dynamic Content with defaults
  const heroTitle = shopSettings?.heroTitle || 'Where Joy & Imagination Come Alive!';
  const heroDescription = shopSettings?.heroDescription || 'Explore our handpicked collection of certified safe STEM toys, educational building blocks, action collectibles, and wooden playsets designed for happy minds.';
  
  const parsedHeroList = shopSettings?.heroImagesList || shopSettings?.heroBannerImages || shopSettings?.heroImages;
  const configuredHeroImages = Array.isArray(parsedHeroList)
    ? parsedHeroList
    : typeof parsedHeroList === 'string'
      ? parsedHeroList.split(',').map(s => s.trim()).filter(Boolean)
      : [
          shopSettings?.heroImageUrl1,
          shopSettings?.heroImageUrl2,
          shopSettings?.heroImageUrl3,
          shopSettings?.heroImageUrl4
        ].filter(url => url && url.trim() !== '');

  const productImages = products.length > 0
    ? products.flatMap(p => p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : (p.imageUrl ? [p.imageUrl] : [])).filter(Boolean)
    : [];

  const defaultHeroImages = [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=480&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=480&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=480&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=480&auto=format&fit=crop'
  ];

  const heroImagesToDisplay = configuredHeroImages.length > 0
    ? configuredHeroImages
    : (productImages.length > 0 ? productImages : defaultHeroImages);

  const promoTitle = shopSettings?.promoTitle || 'Summer Carnival Sale — Enjoy Up to 30% OFF!';
  const promoDescription = shopSettings?.promoDescription || 'Apply coupon codes at checkout to unlock instant extra savings on all wooden playsets and STEM toys.';
  const promoCouponCode = shopSettings?.promoCouponCode || 'TOY30';

  const defaultMarqueeItems = [
    { icon: '💖', text: 'Free Express Gift Wrapping' },
    { icon: '✨', text: '100% Authentic Korean & Japanese Kawaii Merch' },
    { icon: '🔥', text: 'Trending On TikTok & Instagram' },
    { icon: '🏷️', text: 'Use Code KAWAII30 For Extra 30% OFF' },
    { icon: '⭐', text: '50,000+ Happy Smiles Delivered' },
    { icon: '🎀', text: 'Limited Edition Plushies & Cute Stationery' }
  ];

  const rawMarquee = shopSettings?.marqueeText;
  const marqueeItemsToDisplay = (rawMarquee && rawMarquee.trim() !== '')
    ? rawMarquee.split('•').map(t => t.trim()).filter(Boolean).map(t => ({ icon: '', text: t }))
    : defaultMarqueeItems;

  // Filtered product collections
  const featuredProducts = products.slice(0, 8);
  const newArrivals = products.filter(p => (p.badgeLabel || '').toLowerCase() === 'new' || (p.badgeLabel || '').toLowerCase() === 'limited stock').slice(0, 4);
  const displayNewArrivals = newArrivals.length >= 4 ? newArrivals : products.slice(0, 4);
  
  const bestSellers = products.filter(p => (p.badgeLabel || '').toLowerCase() === 'best seller' || (p.badgeLabel || '').toLowerCase() === 'popular').slice(0, 4);
  const displayBestSellers = bestSellers.length >= 4 ? bestSellers : products.slice(4, 8);

  const isWishlistEnabled = superAdminControl.isWishlistEnabled !== false;

  const handleAddToCart = (e, prod) => {
    e.stopPropagation();
    if (prod.stockQuantity > 0) {
      addToCart(prod);
      message.success(`Added ${prod.name} to cart!`);
    }
  };

  // Theme-derived colors (used throughout the page)
  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const secondaryColor = activeTheme?.secondaryColor || '#ff85c0';
  const accentColor = activeTheme?.accentColor || '#ff2a6d';
  const cardBgColor = activeTheme?.cardBgColor || '#ffffff';
  const textColor = activeTheme?.textColor || '#0f172a';

  // Helper product card renderer
  const renderProductCard = (prod) => {
    const mainImage = prod.images?.find(img => img.isMain) || { imageUrl: prod.imageUrls?.[0], zoomScale: 1.0 };
    const mainImageUrl = mainImage?.imageUrl || prod.imageUrls?.[0];
    const zoom = mainImage?.zoomScale || 1.0;

    return (
      <Col xs={12} sm={12} md={8} lg={6} key={prod.id}>
        <Card
          hoverable
          cover={
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                cursor: 'pointer',
                width: '100%',
                aspectRatio: '3/4'
              }}
              onClick={() => navigate(`/products/${prod.id}`)}
            >
              <ProductBadge label={prod.badgeLabel} />
              {isWishlistEnabled && (
                <Button
                  type="text"
                  shape="circle"
                  icon={isInWishlist(prod.id)
                    ? <HeartFilled className="wishlist-heart-active" style={{ color: accentColor, fontSize: '18px' }} />
                    : <HeartOutlined style={{ color: accentColor, fontSize: '18px' }} />}
                  onClick={(e) => toggleWishlist(prod, e)}
                  className="wishlist-heart-btn"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 12,
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
              )}
              {mainImageUrl ? (
                <img
                  alt={prod.name}
                  src={resolveProductImageUrl(mainImageUrl, 'large')}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                  style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'contain',
                    padding: '8px',
                    background: '#ffffff',
                    display: 'block',
                    transform: `scale(${zoom})`,
                    transition: 'transform 0.3s ease'
                  }}
                />
              ) : null}
              <div
                style={{
                  display: mainImageUrl ? 'none' : 'flex',
                  height: '100%',
                  width: '100%',
                  alignItems: 'center',
                  justify: 'center',
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  fontSize: '32px'
                }}
              >
                🧸
              </div>
            </div>
          }
          onClick={() => navigate(`/products/${prod.id}`)}
          style={{
            borderRadius: '10px',
            boxShadow: `0 4px 16px ${primaryColor}14`,
            border: `1px solid ${primaryColor}22`,
            background: cardBgColor,
            transition: 'all 0.3s ease'
          }}
          styles={{ body: { padding: '12px' } }}
        >
          <div onClick={() => navigate(`/products/${prod.id}`)} style={{ cursor: 'pointer', marginBottom: '10px' }}>
            <Text strong style={{ fontSize: '14px', color: textColor, display: 'block', marginBottom: '4px', lineHeight: 1.3, height: '36px', overflow: 'hidden', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {prod.name}
            </Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ fontSize: '16px', color: primaryColor }}>
                  ₹{prod.price.toLocaleString('en-IN')}
                </Text>
                {prod.mrp > prod.price && (
                  <Text delete style={{ fontSize: '11px', color: '#8c8c8c', marginLeft: '4px' }}>
                    ₹{prod.mrp.toLocaleString('en-IN')}
                  </Text>
                )}
              </div>
              <Text
                style={{
                  fontSize: '10px',
                  background: prod.stockQuantity > 0 ? `${primaryColor}15` : '#fff2f0',
                  color: prod.stockQuantity > 0 ? primaryColor : '#ff4d4f',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                {prod.stockQuantity > 0 ? `${prod.stockQuantity} left` : 'Sold Out'}
              </Text>
            </div>
          </div>

          {/* Action buttons — Stacked Vertically & Full Width */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', width: '100%' }}>
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={(e) => handleAddToCart(e, prod)}
              disabled={prod.stockQuantity === 0}
              style={{
                width: '100%',
                borderRadius: '8px',
                height: '34px',
                fontWeight: 700,
                fontSize: '12px',
                borderColor: primaryColor,
                color: primaryColor
              }}
            >
              Add to Cart
            </Button>

            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                if (prod.stockQuantity > 0) {
                  navigate('/checkout', { state: { buyNowItem: { ...prod, quantity: 1 } } });
                }
              }}
              disabled={prod.stockQuantity === 0}
              style={{
                width: '100%',
                borderRadius: '8px',
                height: '34px',
                fontWeight: 700,
                fontSize: '12px',
                background: prod.stockQuantity > 0 ? `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` : undefined,
                border: 'none'
              }}
            >
              Buy Now
            </Button>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <Space direction="vertical" size={40} style={{ width: '100%', paddingBottom: '32px' }}>
      {/* Dynamic Shiny & Floating Heart Keyframe Animations */}
      <style>{`
        @keyframes kawaii-text-shine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .shiny-hero-title {
          background: linear-gradient(120deg, ${textColor} 0%, ${primaryColor} 40%, ${accentColor} 70%, ${textColor} 100%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: kawaii-text-shine 6s ease infinite;
        }
        @keyframes float-heart-up {
          0% { transform: translateY(0px) rotate(0deg) scale(0.8); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(15deg) scale(1.1); opacity: 0.85; }
          100% { transform: translateY(-40px) rotate(-10deg) scale(0.8); opacity: 0; }
        }
        .floating-heart-particle {
          position: absolute;
          pointer-events: none;
          user-select: none;
          z-index: 2;
          animation: float-heart-up 4s ease-in-out infinite;
        }
        @keyframes pulse-aura {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.5; }
        }
        .kawaii-aura-ring {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          border-radius: 36px;
          background: linear-gradient(135deg, ${primaryColor}40, ${accentColor}40);
          filter: blur(16px);
          animation: pulse-aura 3.5s ease-in-out infinite;
          z-index: 0;
        }
        @keyframes kawaii-marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .kawaii-marquee-wrapper {
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
          border-radius: 20px;
          padding: 12px 0;
          box-shadow: 0 6px 20px ${primaryColor}35;
          margin-top: 10px;
        }
        .kawaii-marquee-track {
          display: inline-flex;
          gap: 36px;
          animation: kawaii-marquee-scroll 22s linear infinite;
        }
        .kawaii-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .home-section-spacer {
          margin-top: 44px;
        }

        /* Shining Light Sweep Animation for Coupon Badge */
        @keyframes coupon-code-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shiny-coupon-badge {
          background: linear-gradient(
            110deg,
            #fef08a 0%,
            #ffffff 30%,
            #fef08a 60%,
            #ffffff 85%,
            #fef08a 100%
          ) !important;
          background-size: 200% 100% !important;
          animation: coupon-code-shimmer 2.8s linear infinite !important;
          color: #854d0e !important;
          box-shadow: 0 4px 16px rgba(250, 204, 21, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
          border: 1px solid #fde047 !important;
          display: inline-flex !important;
          align-items: center !important;
        }

        /* Playful Jump & Bouncing Aura Animation for Claim Offer Button */
        @keyframes claim-button-jump {
          0%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 8px 24px rgba(0,0,0,0.18), 0 0 0 0 rgba(255, 255, 255, 0.6);
          }
          40% {
            transform: translateY(-9px) scale(1.06);
            box-shadow: 0 18px 36px rgba(0,0,0,0.28), 0 0 24px 8px rgba(255, 255, 255, 0.85);
          }
          60% {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 12px 28px rgba(0,0,0,0.22), 0 0 14px 4px rgba(255, 255, 255, 0.5);
          }
        }
        .claim-offer-btn {
          animation: claim-button-jump 2.2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite !important;
          transition: transform 0.22s ease, box-shadow 0.22s ease !important;
        }
        .claim-offer-btn:hover {
          transform: scale(1.1) translateY(-4px) !important;
          box-shadow: 0 20px 44px rgba(0,0,0,0.35), 0 0 28px 10px rgba(255,255,255,0.95) !important;
          animation-play-state: paused !important;
        }
      `}</style>

      {/* 0. 3D SCROLL UNBOXING ANIMATION — Controlled by Super Admin */}
      {superAdminControl.isHeroScrollAnimationEnabled !== false && (
        <div style={{ width: '100%', margin: '0 auto' }}>
          <HeroScrollAnimation
            primaryColor={primaryColor}
            accentColor={accentColor}
            backgroundColor={activeTheme?.backgroundColor || '#fad5d9'}
            onNavigateToProducts={() => navigate('/products')}
          />
        </div>
      )}

      {/* 1. SEAMLESS BLENDED HERO BANNER WITH ANIMATED FLOATING HEARTS */}
      {superAdminControl.isHeroBannerEnabled !== false && (
        <div style={{
          background: 'transparent',
          borderRadius: '0px',
          padding: '16px 0 24px',
          color: textColor,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Floating Hearts / Love Sign Particles */}
          <span className="floating-heart-particle" style={{ top: '15%', left: '8%', animationDelay: '0s', fontSize: '22px' }}>💖</span>
          <span className="floating-heart-particle" style={{ top: '65%', left: '4%', animationDelay: '1.2s', fontSize: '18px' }}>💕</span>
          <span className="floating-heart-particle" style={{ top: '25%', left: '42%', animationDelay: '2.5s', fontSize: '20px' }}>✨</span>
          <span className="floating-heart-particle" style={{ top: '75%', right: '12%', animationDelay: '0.8s', fontSize: '24px' }}>💖</span>
          <span className="floating-heart-particle" style={{ top: '18%', right: '6%', animationDelay: '1.9s', fontSize: '20px' }}>🌸</span>
          <span className="floating-heart-particle" style={{ top: '50%', right: '45%', animationDelay: '3.1s', fontSize: '16px' }}>💕</span>

          {/* Ambient soft glow */}
          <div style={{ position: 'absolute', top: '-10%', right: '5%', width: '320px', height: '320px', borderRadius: '50%', background: `radial-gradient(circle, ${primaryColor}18 0%, rgba(255, 255, 255, 0) 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }} />

          <Row align="middle" gutter={[36, 32]}>
            <Col xs={24} md={14} className="hero-text-col">
              <span className="hero-animated-text" style={{
                display: 'inline-block',
                background: `${primaryColor}15`,
                color: primaryColor,
                border: `1px solid ${primaryColor}30`,
                borderRadius: '20px',
                padding: '5px 16px',
                fontWeight: 700,
                fontSize: '12px',
                marginBottom: '14px',
                letterSpacing: '0.4px',
                animationDelay: '0.1s'
              }}>
                🌸 WELCOME TO KAWAII STORE
              </span>

              <Title level={1} className="shiny-hero-title hero-animated-text" style={{
                fontSize: 'clamp(24px, 5.5vw, 40px)',
                fontWeight: 900,
                marginBottom: '14px',
                lineHeight: '1.2',
                letterSpacing: '-0.5px',
                animationDelay: '0.2s'
              }}>
                {heroTitle}
              </Title>

              <Paragraph className="hero-animated-text" style={{
                color: '#475569',
                fontSize: '16px',
                marginBottom: '26px',
                lineHeight: '1.65',
                maxWidth: '520px',
                animationDelay: '0.35s'
              }}>
                {heroDescription}
              </Paragraph>

              <Space size={14} wrap className="hero-animated-text" style={{ marginBottom: '28px', animationDelay: '0.5s' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/products')}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    color: '#ffffff',
                    border: 'none',
                    height: '48px',
                    padding: '0 32px',
                    borderRadius: '24px',
                    fontWeight: 700,
                    fontSize: '15px',
                    boxShadow: `0 6px 20px ${primaryColor}35`
                  }}
                >
                  Shop Collection <RightOutlined style={{ fontSize: '13px' }} />
                </Button>
              </Space>

              {/* Minimal Stats Row */}
              <div className="hero-stats-row hero-animated-text" style={{ display: 'flex', gap: '28px', paddingTop: '20px', borderTop: `1px solid ${primaryColor}18`, animationDelay: '0.65s' }}>
                <div>
                  <Text strong style={{ display: 'block', color: textColor, fontSize: '18px', fontWeight: 800 }}>500+</Text>
                  <Text style={{ color: '#64748b', fontSize: '12px' }}>Kawaii Items</Text>
                </div>
                <div>
                  <Text strong style={{ display: 'block', color: textColor, fontSize: '18px', fontWeight: 800 }}>1,000+</Text>
                  <Text style={{ color: '#64748b', fontSize: '12px' }}>Happy Buyers</Text>
                </div>
                <div>
                  <Text strong style={{ display: 'block', color: textColor, fontSize: '18px', fontWeight: 800 }}>4.9 ★</Text>
                  <Text style={{ color: '#64748b', fontSize: '12px' }}>Rating</Text>
                </div>
              </div>
            </Col>

            {/* Centered Gift Box Showcase Container with Seamless Background Blending & Animated Crossfade */}
            <Col xs={24} md={10} style={{ textAlign: 'center', position: 'relative' }}>
              <div className="hero-giftbox-container">
                {/* Floating Gift Ribbon Bow Badge */}
                <div className="hero-giftbox-ribbon-badge" style={{
                  position: 'absolute',
                  top: '-16px',
                  right: '50%',
                  transform: 'translateX(50%)',
                  zIndex: 12,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  border: `1.5px solid ${primaryColor}40`,
                  borderRadius: '24px',
                  padding: '6px 18px',
                  boxShadow: `0 8px 24px ${primaryColor}30`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '16px' }}>🎁</span>
                  <Text strong style={{ fontSize: '12px', color: primaryColor, letterSpacing: '0.4px' }}>
                    SPECIAL GIFT COLLECTION
                  </Text>
                  <span style={{ fontSize: '14px' }}>✨</span>
                </div>

                {/* Gift Box Container Frame */}
                <div style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'transparent',
                  border: `2px solid ${primaryColor}25`,
                  boxShadow: `0 16px 40px ${primaryColor}20`,
                  position: 'relative',
                  zIndex: 1,
                  padding: '10px'
                }}>
                  <Carousel
                    autoplay
                    autoplaySpeed={2200}
                    fade={true}
                    dots={true}
                    style={{ width: '100%', height: '340px' }}
                  >
                    {heroImagesToDisplay.map((imgUrl, idx) => (
                      <div key={idx} style={{ height: '340px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                        <img
                          src={resolveProductImageUrl(imgUrl)}
                          alt={`Hero Slide ${idx + 1}`}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          style={{
                            width: '100%',
                            height: '340px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto',
                            background: 'transparent',
                            borderRadius: '18px'
                          }}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* INFINITE KAWAII MARQUEE TICKER RIBBON */}
      {superAdminControl.isMarqueeEnabled !== false && (
        <div className="kawaii-marquee-wrapper">
          <div className="kawaii-marquee-track">
            {[...Array(4)].flatMap(() => marqueeItemsToDisplay).map((item, idx) => (
              <div key={idx} className="kawaii-marquee-item">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.text}</span>
                <span style={{ opacity: 0.6, marginLeft: '12px' }}>•</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CATEGORIES SECTION */}
      {superAdminControl.isCategoriesSectionEnabled !== false && categories.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px', color: textColor }}>
              <AppstoreOutlined style={{ marginRight: '10px', color: primaryColor }} /> Explore Collections
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: primaryColor, fontSize: '14px' }}>
              View All <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[20, 20]}>
            {categories.map((cat, index) => {
              const icons = ['🧸', '🏎️', '🧩', '🎨', '🚀', '🏰', '🤖', '🎲'];
              const icon = icons[index % icons.length];
              return (
                <Col xs={12} sm={8} md={6} lg={4.8} key={cat.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                    style={{
                      borderRadius: '20px',
                      textAlign: 'center',
                      border: `1px solid ${primaryColor}22`,
                      background: cardBgColor,
                      boxShadow: `0 4px 14px ${primaryColor}10`,
                      transition: 'all 0.3s ease'
                    }}
                    styles={{ body: { padding: '24px 16px' } }}
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      background: `linear-gradient(135deg, ${primaryColor}18, ${secondaryColor}18)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      fontSize: '28px'
                    }}>
                      {icon}
                    </div>
                    <Text strong style={{ fontSize: '15px', color: textColor, display: 'block' }}>
                      {cat.name}
                    </Text>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {/* 3. FEATURED PRODUCTS */}
      {superAdminControl.isFeaturedProductsEnabled !== false && featuredProducts.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px', color: textColor }}>
              <StarOutlined style={{ marginRight: '10px', color: accentColor }} /> Featured Products
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: primaryColor, fontSize: '14px' }}>
              View All <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[{ xs: 8, sm: 12, md: 16, lg: 20 }, { xs: 10, sm: 14, md: 18, lg: 20 }]}>
            {featuredProducts.map(renderProductCard)}
          </Row>
        </div>
      )}

      {/* 4. NEW ARRIVALS */}
      {superAdminControl.isNewArrivalsEnabled !== false && displayNewArrivals.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px', color: textColor }}>
              <ThunderboltOutlined style={{ marginRight: '10px', color: primaryColor }} /> New Arrivals
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: primaryColor, fontSize: '14px' }}>
              See More <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[{ xs: 8, sm: 12, md: 16, lg: 20 }, { xs: 10, sm: 14, md: 18, lg: 20 }]}>
            {displayNewArrivals.map(renderProductCard)}
          </Row>
        </div>
      )}

      {/* 5. BEST SELLERS */}
      {superAdminControl.isBestSellersEnabled !== false && displayBestSellers.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px', color: textColor }}>
              <CrownOutlined style={{ marginRight: '10px', color: accentColor }} /> Best Sellers
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: primaryColor, fontSize: '14px' }}>
              Browse All <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[{ xs: 8, sm: 12, md: 16, lg: 20 }, { xs: 10, sm: 14, md: 18, lg: 20 }]}>
            {displayBestSellers.map(renderProductCard)}
          </Row>
        </div>
      )}

      {/* 6. PROMO BANNER */}
      {superAdminControl.isPromoBannerEnabled !== false && (
        <Card
          style={{
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            border: 'none',
            boxShadow: `0 10px 30px ${primaryColor}40`,
            color: '#fff',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '24px 20px' } }}
        >
          <Row align="middle" justify="space-between" gutter={[20, 20]}>
            <Col xs={24} md={16} className="promo-banner-text-col">
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Tag className="shiny-coupon-badge" style={{ borderRadius: '20px', padding: '6px 14px', fontWeight: 800, fontSize: '12px', letterSpacing: '0.4px', maxWidth: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  🎉 SPECIAL OFFER: USE CODE {promoCouponCode}
                </Tag>
                <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 900, fontSize: 'clamp(20px, 4.5vw, 32px)', lineHeight: '1.25' }}>
                  {promoTitle}
                </Title>
                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                  {promoDescription}
                </Paragraph>
              </Space>
            </Col>
            <Col xs={24} md={8} className="claim-offer-col" style={{ textAlign: 'center' }}>
              <Button
                size="large"
                className="claim-offer-btn"
                onClick={() => navigate('/products')}
                style={{
                  background: '#ffffff',
                  color: primaryColor,
                  border: 'none',
                  borderRadius: '50px',
                  height: '50px',
                  padding: '0 32px',
                  fontWeight: 900,
                  fontSize: '15px',
                  letterSpacing: '0.3px',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '280px'
                }}
              >
                Claim Offer Now &nbsp;🎁
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* 7. WHY CHOOSE US */}
      {superAdminControl.isWhyChooseUsEnabled !== false && (
        <div>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '32px', fontWeight: 800, fontSize: '26px' }}>
            Why Families Love Shopping With Us
          </Title>

          <Row gutter={[20, 20]}>
            {[
              { icon: <RocketOutlined style={{ fontSize: '32px', color: '#1890ff' }} />, title: 'Lightning Fast Delivery', desc: 'Free express shipping on all orders over ₹500 across India' },
              { icon: <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#52c41a' }} />, title: '100% Non-Toxic & Safe', desc: 'Certified child-safe eco materials tested for happy play' },
              { icon: <SmileOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />, title: '50,000+ Happy Smiles', desc: 'Verified 5-star customer happiness & quality guarantee' },
              { icon: <GiftOutlined style={{ fontSize: '32px', color: '#722ed1' }} />, title: 'Premium Gift Packaging', desc: 'Free festive wrapping & custom greeting card on request' }
            ].map((item, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <Card
                  style={{
                    borderRadius: '20px',
                    textAlign: 'center',
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    height: '100%'
                  }}
                  bodyStyle={{ padding: '32px 20px' }}
                >
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
                  }}>
                    {item.icon}
                  </div>
                  <Title level={4} style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                    {item.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    {item.desc}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Space>
  );
};

export default Home;
