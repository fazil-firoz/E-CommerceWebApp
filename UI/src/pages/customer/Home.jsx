import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Col, Row, Button, Typography, Space, Spin, message, Tag, Carousel, Tooltip } from 'antd';
import {
  RightOutlined, FireOutlined, AppstoreOutlined, HeartOutlined, HeartFilled,
  StarOutlined, RocketOutlined, SafetyCertificateOutlined, SmileOutlined,
  GiftOutlined, CrownOutlined, ShoppingCartOutlined, ThunderboltOutlined,
  CheckCircleOutlined, EyeOutlined, SwapRightOutlined
} from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { shopApi } from '../../api/shopApi';
import { superAdminApi } from '../../api/superAdminApi';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { ThemeContext } from '../../context/ThemeContext';
import ProductBadge from '../../components/common/ProductBadge';
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
    isHeroBannerEnabled: true,
    isCategoriesSectionEnabled: true,
    isFeaturedProductsEnabled: true,
    isNewArrivalsEnabled: true,
    isBestSellersEnabled: true,
    isPromoBannerEnabled: true,
    isWhyChooseUsEnabled: true
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
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <Spin size="large" tip="Unboxing Magical Kawaii Store..." />
      </div>
    );
  }

  // Dynamic Content with defaults
  const heroTitle = shopSettings?.heroTitle || 'Where Magical Joy & Cute Dreams Come Alive!';
  const heroDescription = shopSettings?.heroDescription || 'Explore our handpicked Korean Kawaii plushies, aesthetic stationery, limited edition collectibles, and adorable gifts curated for happy souls.';
  
  const configuredHeroImages = [
    shopSettings?.heroImageUrl1,
    shopSettings?.heroImageUrl2,
    shopSettings?.heroImageUrl3,
    shopSettings?.heroImageUrl4
  ].filter(url => url && url.trim() !== '');

  const defaultHeroImages = [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop'
  ];

  const heroImagesToDisplay = configuredHeroImages.length > 0 ? configuredHeroImages : defaultHeroImages;

  const promoTitle = shopSettings?.promoTitle || 'Kawaii Season Sale — Enjoy Up to 30% OFF!';
  const promoDescription = shopSettings?.promoDescription || 'Apply coupon codes at checkout to unlock instant extra savings on plushies, plush bags, and cute stationery sets.';
  const promoCouponCode = shopSettings?.promoCouponCode || 'KAWAII30';

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
      message.success(`Added ${prod.name} to cart! ✨`);
    }
  };

  // Theme-derived colors
  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const secondaryColor = activeTheme?.secondaryColor || '#ff85c0';
  const accentColor = activeTheme?.accentColor || '#ff2a6d';
  const cardBgColor = activeTheme?.cardBgColor || '#ffffff';
  const textColor = activeTheme?.textColor || '#0f172a';

  // Helper product card renderer (Modern DTC Kawaii style)
  const renderProductCard = (prod) => {
    const mainImage = prod.images?.find(img => img.isMain) || { imageUrl: prod.imageUrls?.[0], zoomScale: 1.0 };
    const mainImageUrl = mainImage?.imageUrl || prod.imageUrls?.[0];
    const zoom = mainImage?.zoomScale || 1.0;
    const discountPct = prod.mrp > prod.price ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : 0;

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={prod.id}>
        <Card
          hoverable
          className="kawaii-product-card"
          cover={
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                cursor: 'pointer',
                width: '100%',
                aspectRatio: '4/3',
                background: '#fafafa'
              }}
              onClick={() => navigate(`/products/${prod.id}`)}
            >
              <ProductBadge label={prod.badgeLabel} />

              {/* Discount Tag Badge */}
              {discountPct > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  zIndex: 10,
                  background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                  -{discountPct}% OFF
                </div>
              )}

              {/* Wishlist Button */}
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
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease'
                  }}
                />
              )}

              <img
                alt={prod.name}
                src={resolveProductImageUrl(mainImageUrl, 'thumb')}
                loading="lazy"
                className="kawaii-card-img"
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                }}
              />
            </div>
          }
          onClick={() => navigate(`/products/${prod.id}`)}
          style={{
            borderRadius: '20px',
            boxShadow: `0 8px 24px ${primaryColor}12`,
            border: `1px solid ${primaryColor}20`,
            background: cardBgColor,
            transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '16px' } }}
        >
          <Card.Meta
            title={
              <span style={{ fontSize: '15px', fontWeight: 800, color: textColor, lineHeight: 1.35, display: 'block' }}>
                {prod.name}
              </span>
            }
            description={
              <Space direction="vertical" size={6} style={{ width: '100%', marginTop: '6px' }}>
                <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
                  {prod.categoryName || 'Kawaii Item'}
                </Text>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div>
                    <Text strong style={{ fontSize: '18px', color: primaryColor, fontWeight: 900 }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </Text>
                    {prod.mrp > prod.price && (
                      <Text delete style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '6px' }}>
                        ₹{prod.mrp.toLocaleString('en-IN')}
                      </Text>
                    )}
                  </div>

                  <Button
                    type="primary"
                    size="small"
                    icon={<ShoppingCartOutlined />}
                    disabled={prod.stockQuantity === 0}
                    onClick={(e) => handleAddToCart(e, prod)}
                    style={{
                      borderRadius: '10px',
                      background: prod.stockQuantity > 0 ? `linear-gradient(135deg, ${primaryColor}, ${accentColor})` : '#cbd5e1',
                      borderColor: 'transparent',
                      fontWeight: 700,
                      height: '34px',
                      padding: '0 14px',
                      boxShadow: prod.stockQuantity > 0 ? `0 4px 12px ${primaryColor}35` : 'none'
                    }}
                  >
                    Add
                  </Button>
                </div>
              </Space>
            }
          />
        </Card>
      </Col>
    );
  };

  return (
    <Space direction="vertical" size={54} style={{ width: '100%', paddingBottom: '40px' }}>
      {/* Dynamic Modern CSS Animations */}
      <style>{`
        @keyframes kawaii-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        @keyframes kawaii-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .kawaii-product-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 16px 36px ${primaryColor}25 !important;
          border-color: ${primaryColor}50 !important;
        }
        .kawaii-product-card:hover .kawaii-card-img {
          transform: scale(1.08) !important;
        }
        .kawaii-floating-badge {
          animation: kawaii-float 4s ease-in-out infinite;
        }
        .kawaii-pulse-badge {
          animation: kawaii-pulse 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* 1. HERO BANNER REDESIGN (Korean Kawaii Modern 2026 DTC Style) */}
      {superAdminControl.isHeroBannerEnabled !== false && (
        <div style={{
          background: activeTheme?.heroBgGradient || `linear-gradient(135deg, #ffffff 0%, ${primaryColor}10 50%, ${secondaryColor}20 100%)`,
          borderRadius: '32px',
          padding: '60px 48px',
          color: textColor,
          boxShadow: `0 24px 48px -12px ${primaryColor}20`,
          border: `1.5px solid ${primaryColor}30`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle pastel ambient background glow graphics */}
          <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '420px', height: '420px', borderRadius: '50%', background: `radial-gradient(circle, ${primaryColor}25 0%, rgba(255, 255, 255, 0) 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '25%', width: '360px', height: '360px', borderRadius: '50%', background: `radial-gradient(circle, ${accentColor}20 0%, rgba(255, 255, 255, 0) 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }} />

          <Row align="middle" gutter={[40, 36]}>
            {/* Left Content Column */}
            <Col xs={24} lg={13}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span className="kawaii-pulse-badge" style={{
                  background: `linear-gradient(135deg, ${primaryColor}20, ${accentColor}20)`,
                  color: primaryColor,
                  border: `1.5px solid ${primaryColor}40`,
                  borderRadius: '30px',
                  padding: '6px 18px',
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🌸 KOREAN KAWAII COLLECTION 2026
                </span>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  <EyeOutlined style={{ color: primaryColor }} /> 14 people looking now
                </span>
              </div>

              <Title level={1} style={{
                color: textColor,
                fontSize: '48px',
                fontWeight: 900,
                marginBottom: '20px',
                lineHeight: '1.18',
                letterSpacing: '-1px'
              }}>
                {heroTitle}
              </Title>

              <Paragraph style={{
                color: '#475569',
                fontSize: '18px',
                marginBottom: '36px',
                lineHeight: '1.65',
                maxWidth: '560px',
                fontWeight: 450
              }}>
                {heroDescription}
              </Paragraph>

              <Space size={16} wrap style={{ marginBottom: '36px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/products')}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    color: '#ffffff',
                    border: 'none',
                    height: '56px',
                    padding: '0 36px',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '16px',
                    boxShadow: `0 10px 28px ${primaryColor}50`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Explore Kawaii Store <SwapRightOutlined style={{ fontSize: '20px' }} />
                </Button>

                <Button
                  size="large"
                  onClick={() => navigate('/products')}
                  style={{
                    color: textColor,
                    borderColor: `${primaryColor}40`,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(8px)',
                    height: '56px',
                    padding: '0 30px',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '16px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                  }}
                >
                  Browse Categories
                </Button>
              </Space>

              {/* Trust Badges Bar */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                paddingTop: '24px',
                borderTop: `1px solid ${primaryColor}20`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleOutlined style={{ color: primaryColor, fontSize: '16px' }} />
                  <Text strong style={{ fontSize: '13px', color: '#334155' }}>100% Authentic</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GiftOutlined style={{ color: accentColor, fontSize: '16px' }} />
                  <Text strong style={{ fontSize: '13px', color: '#334155' }}>Free Gift Wrapping</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
                  <Text strong style={{ fontSize: '13px', color: '#334155' }}>4.9/5 Rating (12.4k+ Reviews)</Text>
                </div>
              </div>
            </Col>

            {/* Right Carousel Showcase & Floating Badge */}
            <Col xs={24} lg={11} style={{ textAlign: 'center', position: 'relative' }}>
              {/* Floating Aesthetic Glassmorphic Card Badge */}
              <div className="kawaii-floating-badge" style={{
                position: 'absolute',
                top: '-14px',
                left: '0px',
                zIndex: 20,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: `1.5px solid ${primaryColor}30`,
                borderRadius: '18px',
                padding: '10px 16px',
                boxShadow: `0 12px 28px ${primaryColor}20`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '18px'
                }}>
                  ✨
                </div>
                <div style={{ textAlign: 'left' }}>
                  <Text strong style={{ display: 'block', fontSize: '12px', color: textColor }}>Super Cute & Safe</Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Child-Safe Eco Materials</Text>
                </div>
              </div>

              {/* Main Showcase Frame */}
              <div style={{
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: `0 24px 48px -10px ${primaryColor}25`,
                maxWidth: '420px',
                margin: '0 auto',
                background: '#ffffff',
                border: `6px solid #ffffff`,
                padding: '4px',
                position: 'relative'
              }}>
                <Carousel autoplay autoplaySpeed={3500} fadeDots>
                  {heroImagesToDisplay.map((imgUrl, idx) => (
                    <div key={idx} style={{ height: '340px', borderRadius: '24px', overflow: 'hidden' }}>
                      <img
                        src={resolveProductImageUrl(imgUrl)}
                        alt={`Kawaii Hero Slide ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '340px',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: '24px'
                        }}
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* 2. CATEGORIES SECTION */}
      {superAdminControl.isCategoriesSectionEnabled !== false && categories.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: '28px', color: textColor }}>
                <AppstoreOutlined style={{ marginRight: '10px', color: primaryColor }} /> Explore Collections
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>Find your favorite aesthetic category</Text>
            </div>
            <Link to="/products" style={{ fontWeight: 800, color: primaryColor, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All Collections <RightOutlined style={{ fontSize: '12px' }} />
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
                      borderRadius: '24px',
                      textAlign: 'center',
                      border: `1.5px solid ${primaryColor}20`,
                      background: cardBgColor,
                      boxShadow: `0 6px 18px ${primaryColor}10`,
                      transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                    }}
                    styles={{ body: { padding: '24px 16px' } }}
                  >
                    <div style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '22px',
                      background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      fontSize: '32px',
                      boxShadow: `0 4px 12px ${primaryColor}15`
                    }}>
                      {icon}
                    </div>
                    <Text strong style={{ fontSize: '15px', color: textColor, display: 'block', fontWeight: 800 }}>
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
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: '28px', color: textColor }}>
                <StarOutlined style={{ marginRight: '10px', color: accentColor }} /> Featured Kawaii Picks
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>Handpicked most adorable items for you</Text>
            </div>
            <Link to="/products" style={{ fontWeight: 800, color: primaryColor, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Full Collection <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[20, 20]}>
            {featuredProducts.map(renderProductCard)}
          </Row>
        </div>
      )}

      {/* 4. NEW ARRIVALS */}
      {superAdminControl.isNewArrivalsEnabled !== false && displayNewArrivals.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: '28px', color: textColor }}>
                <ThunderboltOutlined style={{ marginRight: '10px', color: primaryColor }} /> Fresh New Arrivals
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>Just landed in store this week</Text>
            </div>
            <Link to="/products" style={{ fontWeight: 800, color: primaryColor, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              See More New Arrivals <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[20, 20]}>
            {displayNewArrivals.map(renderProductCard)}
          </Row>
        </div>
      )}

      {/* 5. BEST SELLERS */}
      {superAdminControl.isBestSellersEnabled !== false && displayBestSellers.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: '28px', color: textColor }}>
                <CrownOutlined style={{ marginRight: '10px', color: accentColor }} /> Best Sellers & Customer Favorites
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>Most loved by thousands of happy customers</Text>
            </div>
            <Link to="/products" style={{ fontWeight: 800, color: primaryColor, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Browse Top Favorites <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[20, 20]}>
            {displayBestSellers.map(renderProductCard)}
          </Row>
        </div>
      )}

      {/* 6. PROMO BANNER (Modern Korean Glassmorphic Style) */}
      {superAdminControl.isPromoBannerEnabled !== false && (
        <Card
          style={{
            borderRadius: '32px',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            border: 'none',
            boxShadow: `0 16px 36px ${primaryColor}45`,
            color: '#fff',
            overflow: 'hidden',
            position: 'relative'
          }}
          styles={{ body: { padding: '48px 56px' } }}
        >
          {/* Decorative glow overlay */}
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <Row align="middle" justify="space-between" gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Space direction="vertical" size={12}>
                <Tag color="gold" style={{ borderRadius: '20px', padding: '6px 16px', fontWeight: 900, fontSize: '13px', border: 'none' }}>
                  🎉 SPECIAL OFFER: USE CODE {promoCouponCode}
                </Tag>
                <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 900, fontSize: '36px', letterSpacing: '-0.5px' }}>
                  {promoTitle}
                </Title>
                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '17px', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                  {promoDescription}
                </Paragraph>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Button
                size="large"
                onClick={() => navigate('/products')}
                style={{
                  background: '#ffffff',
                  color: primaryColor,
                  border: 'none',
                  borderRadius: '16px',
                  height: '54px',
                  padding: '0 36px',
                  fontWeight: 900,
                  fontSize: '16px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.18)'
                }}
              >
                Claim Offer Now ✨
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* 7. WHY CHOOSE US (DTC Trust Value Props) */}
      {superAdminControl.isWhyChooseUsEnabled !== false && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Title level={2} style={{ margin: 0, fontWeight: 900, fontSize: '28px', color: textColor }}>
              Why Customers Love Shopping With Us
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>Guaranteed quality & happiness with every package</Text>
          </div>

          <Row gutter={[20, 20]}>
            {[
              { icon: <RocketOutlined style={{ fontSize: '32px', color: primaryColor }} />, title: 'Lightning Fast Shipping', desc: 'Free express shipping on orders over ₹500 across India' },
              { icon: <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#52c41a' }} />, title: '100% Non-Toxic & Safe', desc: 'Certified eco-friendly materials tested for happy play' },
              { icon: <SmileOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />, title: '50,000+ Happy Smiles', desc: 'Verified 5-star customer happiness & quality guarantee' },
              { icon: <GiftOutlined style={{ fontSize: '32px', color: accentColor }} />, title: 'Cute Gift Packaging', desc: 'Free aesthetic gift wrapping & custom greeting card' }
            ].map((item, idx) => (
              <Col xs={24} sm={12} lg={6} key={idx}>
                <Card
                  style={{
                    borderRadius: '24px',
                    textAlign: 'center',
                    border: `1.5px solid ${primaryColor}18`,
                    boxShadow: `0 6px 18px ${primaryColor}08`,
                    background: cardBgColor,
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                  styles={{ body: { padding: '36px 22px' } }}
                >
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${primaryColor}12, ${secondaryColor}12)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px',
                    boxShadow: `0 4px 12px ${primaryColor}12`
                  }}>
                    {item.icon}
                  </div>
                  <Title level={4} style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: textColor }}>
                    {item.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.6' }}>
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
