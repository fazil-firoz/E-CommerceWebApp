import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Col, Row, Button, Typography, Space, Spin, Tag, message } from 'antd';
import {
  RightOutlined, FireOutlined, AppstoreOutlined,
  RocketOutlined, SafetyCertificateOutlined, SyncOutlined,
  CustomerServiceOutlined, StarFilled, HeartFilled, HeartOutlined,
  ArrowRightOutlined, ShoppingCartOutlined, GiftOutlined
} from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { shopApi } from '../../api/shopApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, shopRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll({ limit: 8 }),
          shopApi.getSettings().catch(() => ({ success: false }))
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (prodRes.success) setLatestProducts((prodRes.data || []).slice(0, 8));
        if (shopRes.success && shopRes.data) setShopSettings(shopRes.data);
      } catch (err) {
        message.error('Failed to load store content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading your kawaii world..." />
      </div>
    );
  }

  const shopName = shopSettings?.shopName || 'Store';
  const motto = shopSettings?.motto || 'Cute aesthetic items curated just for you ♡';
  const logoUrl = shopSettings?.logoUrl ? resolveProductImageUrl(shopSettings.logoUrl) : null;

  const categoryEmojis = ['🎀', '🧸', '🌸', '🎁', '💖', '🦋', '✨', '🍰', '🌈', '💫', '🎠', '🧁'];

  return (
    <Space direction="vertical" size={36} style={{ width: '100%' }}>
      {/* Kawaii Animations & Responsive Styles */}
      <style>{`
        @keyframes kawaiiFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes kawaiiFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(2deg); }
          75% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes kawaiiPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes shimmerPink {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        .kawaii-hero {
          animation: kawaiiFadeUp 0.8s ease-out;
        }
        .kawaii-shop-title {
          font-size: 48px;
          font-weight: 900;
          background: linear-gradient(135deg, #ec4899 0%, #f472b6 25%, #be185d 50%, #ec4899 75%, #f9a8d4 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerPink 4s linear infinite;
          display: inline-block;
          line-height: 1.1;
          letter-spacing: -1px;
        }
        .kawaii-feature-card {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }
        .kawaii-feature-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 16px 32px rgba(236, 72, 153, 0.12) !important;
        }
        .kawaii-cat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kawaii-cat-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
          box-shadow: 0 16px 32px rgba(236, 72, 153, 0.15) !important;
          border-color: #f9a8d4 !important;
        }
        .kawaii-cat-card:hover .kawaii-cat-emoji {
          animation: kawaiiPulse 0.6s ease infinite;
        }
        .kawaii-prod-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kawaii-prod-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 16px 32px rgba(236, 72, 153, 0.1) !important;
          border-color: #fce7f3 !important;
        }
        .kawaii-prod-card:hover .kawaii-prod-img {
          transform: scale(1.05);
        }
        .kawaii-hero-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kawaii-hero-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 28px rgba(236, 72, 153, 0.35) !important;
        }
        .kawaii-sparkle {
          position: absolute;
          color: #f9a8d4;
          animation: sparkle 3s ease-in-out infinite;
          pointer-events: none;
        }
        .kawaii-float {
          animation: kawaiiFloat 6s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .kawaii-shop-title { font-size: 32px !important; }
          .kawaii-hero-content { padding: 32px 20px !important; }
          .kawaii-hero-visual { display: none !important; }
          .kawaii-feature-row { gap: 8px !important; }
        }
        @media (max-width: 480px) {
          .kawaii-shop-title { font-size: 26px !important; }
        }
      `}</style>

      {/* ═══ HERO BANNER ═══ */}
      <div className="kawaii-hero" style={{
        background: 'linear-gradient(145deg, #fff5f7 0%, #fce7f3 30%, #fdf2f8 60%, #ffffff 100%)',
        borderRadius: '28px',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(236, 72, 153, 0.08)',
        border: '1px solid #fce7f3'
      }}>
        {/* Decorative Sparkles */}
        <div className="kawaii-sparkle" style={{ top: '15%', left: '8%', fontSize: '20px' }}>✦</div>
        <div className="kawaii-sparkle" style={{ top: '25%', right: '15%', fontSize: '16px', animationDelay: '1s' }}>✧</div>
        <div className="kawaii-sparkle" style={{ bottom: '20%', left: '25%', fontSize: '14px', animationDelay: '2s' }}>✦</div>
        <div className="kawaii-sparkle" style={{ top: '60%', right: '30%', fontSize: '18px', animationDelay: '0.5s' }}>♡</div>
        <div className="kawaii-sparkle" style={{ bottom: '15%', right: '10%', fontSize: '16px', animationDelay: '1.5s' }}>✧</div>

        <Row align="middle" gutter={0} style={{ position: 'relative', zIndex: 2 }}>
          <Col xs={24} md={14}>
            <div className="kawaii-hero-content" style={{ padding: '52px 48px' }}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* Mini Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 16px', borderRadius: '30px',
                  background: 'rgba(236, 72, 153, 0.08)',
                  border: '1px solid rgba(236, 72, 153, 0.15)',
                  width: 'fit-content'
                }}>
                  <HeartFilled style={{ color: '#ec4899', fontSize: '12px' }} />
                  <Text style={{ color: '#be185d', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Kawaii Aesthetic Shop
                  </Text>
                </div>

                {/* Animated Title */}
                <div>
                  <Title level={1} style={{ margin: 0, fontSize: '28px', color: '#4a4a4a', fontWeight: 600, lineHeight: '1.3' }}>
                    Welcome to
                  </Title>
                  <span className="kawaii-shop-title">{shopName}</span>
                </div>

                {/* Description */}
                <Paragraph style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.7', margin: '4px 0 8px', maxWidth: '480px' }}>
                  {motto} Discover handpicked cute items, adorable accessories, and charming collectibles that make every day special. ✨
                </Paragraph>

                {/* CTA Buttons */}
                <Space wrap size={12}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => navigate('/products')}
                    className="kawaii-hero-btn"
                    icon={<ShoppingCartOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                      border: 'none', height: '50px', padding: '0 28px',
                      borderRadius: '25px', fontSize: '15px', fontWeight: 700,
                      boxShadow: '0 6px 20px rgba(236, 72, 153, 0.3)'
                    }}
                  >
                    Shop Now
                  </Button>

                  <Button
                    size="large"
                    onClick={() => navigate('/about')}
                    className="kawaii-hero-btn"
                    style={{
                      height: '50px', padding: '0 24px', borderRadius: '25px',
                      fontSize: '15px', fontWeight: 600,
                      border: '2px solid #f9a8d4', color: '#ec4899',
                      background: '#fff'
                    }}
                  >
                    About Us ♡
                  </Button>
                </Space>
              </Space>
            </div>
          </Col>

          {/* Hero Visual */}
          <Col xs={0} md={10} className="kawaii-hero-visual" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '32px' }}>
            <div className="kawaii-float" style={{
              position: 'relative', padding: '20px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(236, 72, 153, 0.15)',
              boxShadow: '0 8px 32px rgba(236, 72, 153, 0.08)'
            }}>
              {logoUrl ? (
                <img src={logoUrl} alt={shopName} style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '200px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>
                  🎀
                </div>
              )}

              {/* Floating Badges */}
              <div style={{
                position: 'absolute', top: '-14px', left: '-14px',
                background: '#fff', padding: '6px 14px', borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.15)',
                fontWeight: 700, fontSize: '12px', color: '#be185d',
                animation: 'kawaiiFloat 4s ease-in-out infinite'
              }}>
                ⭐ Loved by 1000+
              </div>
              <div style={{
                position: 'absolute', bottom: '-14px', right: '-14px',
                background: 'linear-gradient(135deg, #ec4899, #f472b6)', color: '#fff',
                padding: '6px 14px', borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.3)',
                fontWeight: 700, fontSize: '12px',
                animation: 'kawaiiFloat 4s ease-in-out 2s infinite'
              }}>
                🚚 Free Shipping
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ═══ FEATURE HIGHLIGHTS ═══ */}
      <Row gutter={[12, 12]} className="kawaii-feature-row">
        {[
          { icon: <RocketOutlined />, color: '#ec4899', title: 'Free Shipping', desc: 'On orders over ₹1,000' },
          { icon: <SafetyCertificateOutlined />, color: '#f472b6', title: '100% Genuine', desc: 'Certified authentic items' },
          { icon: <SyncOutlined />, color: '#ec4899', title: '7-Day Returns', desc: 'Hassle-free replacements' },
          { icon: <CustomerServiceOutlined />, color: '#f472b6', title: 'Quick Support', desc: 'WhatsApp & Call hotline' }
        ].map((f, i) => (
          <Col xs={12} sm={6} key={i}>
            <Card
              size="small"
              className="kawaii-feature-card"
              style={{
                borderRadius: '18px', textAlign: 'center',
                border: '1px solid #fce7f3', background: '#fff'
              }}
              bodyStyle={{ padding: '16px 10px' }}
            >
              <div style={{ fontSize: '24px', color: f.color, marginBottom: '6px' }}>{f.icon}</div>
              <Text strong style={{ display: 'block', fontSize: '13px', color: '#1f1f1f' }}>{f.title}</Text>
              <Text style={{ fontSize: '11px', color: '#9ca3af' }}>{f.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ═══ CATEGORIES ═══ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1f1f1f' }}>
              <span style={{ color: '#ec4899' }}>♡</span> Browse Categories
            </Title>
            <Text style={{ color: '#9ca3af', fontSize: '13px' }}>Find exactly what you're looking for</Text>
          </div>
          <Link to="/products" style={{ fontWeight: 600, color: '#ec4899', fontSize: '14px' }}>
            View All <ArrowRightOutlined />
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {categories.map((cat, idx) => (
            <Col xs={12} sm={8} md={6} lg={4} key={cat.id}>
              <Card
                hoverable
                className="kawaii-cat-card"
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                style={{
                  borderRadius: '20px', textAlign: 'center',
                  border: '1px solid #fce7f3', background: '#fff'
                }}
                bodyStyle={{ padding: '20px 12px' }}
              >
                <div className="kawaii-cat-emoji" style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px', fontSize: '24px',
                  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.08)'
                }}>
                  {categoryEmojis[idx % categoryEmojis.length]}
                </div>
                <Text strong style={{ fontSize: '14px', color: '#1f1f1f', display: 'block' }}>{cat.name}</Text>
                <Text style={{ fontSize: '11px', color: '#d1d5db' }}>Explore →</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* ═══ HOT NEW ARRIVALS ═══ */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1f1f1f' }}>
              <span style={{ color: '#ec4899' }}>✨</span> New Arrivals
            </Title>
            <Text style={{ color: '#9ca3af', fontSize: '13px' }}>Fresh drops just for you</Text>
          </div>
          <Link to="/products" style={{ fontWeight: 600, color: '#ec4899', fontSize: '14px' }}>
            Shop All <ArrowRightOutlined />
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {latestProducts.map((prod) => {
            const mainImage = prod.images?.find(img => img.isMain) || { imageUrl: prod.imageUrls?.[0], zoomScale: 1.0 };
            const mainImageUrl = mainImage?.imageUrl || prod.imageUrls?.[0];
            const zoom = mainImage?.zoomScale || 1.0;
            const discountPercent = prod.mrp > prod.price ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : 0;

            return (
              <Col xs={12} sm={12} md={8} lg={6} key={prod.id}>
                <Card
                  hoverable
                  className="kawaii-prod-card"
                  cover={
                    <div
                      style={{
                        position: 'relative', overflow: 'hidden',
                        borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
                        cursor: 'pointer', width: '100%', aspectRatio: '1/1',
                        background: '#fdf2f8'
                      }}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      {discountPercent > 0 && (
                        <Tag style={{
                          position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                          fontWeight: 700, borderRadius: '12px', margin: 0,
                          background: '#ec4899', color: '#fff', border: 'none',
                          fontSize: '11px', padding: '2px 8px'
                        }}>
                          -{discountPercent}%
                        </Tag>
                      )}
                      <img
                        alt={prod.name}
                        className="kawaii-prod-img"
                        src={resolveProductImageUrl(mainImageUrl, 'thumb')}
                        loading="lazy"
                        style={{
                          height: '100%', width: '100%', objectFit: 'cover', display: 'block',
                          transform: `scale(${zoom})`, transition: 'transform 0.4s ease'
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/products/${prod.id}`)}
                  style={{
                    borderRadius: '20px', border: '1px solid #fce7f3',
                    boxShadow: '0 2px 8px rgba(236, 72, 153, 0.04)',
                    overflow: 'hidden'
                  }}
                  bodyStyle={{ padding: '14px 16px' }}
                >
                  <Text style={{ fontSize: '12px', color: '#d1d5db' }}>{prod.categoryName}</Text>
                  <Title level={5} style={{ margin: '2px 0 8px', fontWeight: 700, color: '#1f1f1f', fontSize: '14px' }}>
                    {prod.name}
                  </Title>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: '17px', color: '#ec4899' }}>
                        ₹{prod.price.toLocaleString('en-IN')}
                      </Text>
                      {prod.mrp > prod.price && (
                        <Text delete style={{ fontSize: '11px', color: '#d1d5db', marginLeft: '5px' }}>
                          ₹{prod.mrp.toLocaleString('en-IN')}
                        </Text>
                      )}
                    </div>
                    <Tag
                      color={prod.stockQuantity > 0 ? undefined : 'red'}
                      style={{
                        borderRadius: '8px', fontWeight: 600, margin: 0,
                        fontSize: '10px', padding: '1px 6px',
                        background: prod.stockQuantity > 0 ? '#fdf2f8' : undefined,
                        color: prod.stockQuantity > 0 ? '#ec4899' : undefined,
                        border: prod.stockQuantity > 0 ? '1px solid #fce7f3' : undefined
                      }}
                    >
                      {prod.stockQuantity > 0 ? '♡ In Stock' : 'Sold Out'}
                    </Tag>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ═══ CTA BANNER ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)',
        borderRadius: '24px', padding: '40px 36px',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div className="kawaii-sparkle" style={{ top: '20%', left: '10%', fontSize: '20px', color: '#fff' }}>✦</div>
        <div className="kawaii-sparkle" style={{ bottom: '20%', right: '10%', fontSize: '20px', color: '#fff', animationDelay: '1s' }}>♡</div>
        <Title level={3} style={{ color: '#fff', margin: '0 0 8px', fontWeight: 800, position: 'relative', zIndex: 2 }}>
          Can't decide? Explore our full catalog! ✨
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '15px', margin: '0 0 20px', position: 'relative', zIndex: 2 }}>
          Hundreds of kawaii items waiting for you — from plushies to accessories and more.
        </Paragraph>
        <Button
          size="large"
          onClick={() => navigate('/products')}
          className="kawaii-hero-btn"
          style={{
            background: '#fff', color: '#ec4899', border: 'none',
            height: '48px', padding: '0 32px', borderRadius: '24px',
            fontWeight: 700, fontSize: '15px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            position: 'relative', zIndex: 2
          }}
        >
          Browse All Items <ArrowRightOutlined />
        </Button>
      </div>
    </Space>
  );
};

export default Home;
