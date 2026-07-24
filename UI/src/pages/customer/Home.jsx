import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Col, Row, Button, Typography, Space, Spin, Tag, message } from 'antd';
import { 
  RightOutlined, FireOutlined, AppstoreOutlined, 
  RocketOutlined, SafetyCertificateOutlined, SyncOutlined, 
  CustomerServiceOutlined, StarFilled, ShopOutlined, ArrowRightOutlined 
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
        <Spin size="large" tip="Loading Storefront..." />
      </div>
    );
  }

  const shopName = shopSettings?.shopName || 'ToyVerse';
  const motto = shopSettings?.motto || 'Your portal to imagination, joy, and endless play.';
  const logoUrl = shopSettings?.logoUrl ? resolveProductImageUrl(shopSettings.logoUrl) : null;

  return (
    <Space direction="vertical" size={36} style={{ width: '100%' }}>
      {/* Inline styles for keyframe animations */}
      <style>{`
        @keyframes shimmerGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        .animated-shop-title {
          background: linear-gradient(135deg, #ffffff 0%, #ffe58f 30%, #69c0ff 70%, #ffffff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerGradient 5s linear infinite;
          font-weight: 900;
          letter-spacing: -1px;
          display: inline-block;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
        }
        .hero-action-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-action-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 25px rgba(24, 144, 255, 0.4) !important;
        }
        .cat-card-hover {
          transition: all 0.3s ease;
        }
        .cat-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(0, 21, 41, 0.08) !important;
          border-color: #4096ff !important;
        }
      `}</style>

      {/* Elegant Animated Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #001529 0%, #002140 40%, #003a8c 100%)',
        borderRadius: '28px',
        padding: '56px 48px',
        color: '#fff',
        boxShadow: '0 16px 40px rgba(0, 21, 41, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glowing Decorative Orbs */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(24,144,255,0.25) 0%, rgba(24,144,255,0) 70%)',
          animation: 'pulseGlow 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-25%',
          left: '30%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(114,46,209,0.25) 0%, rgba(114,46,209,0) 70%)',
          animation: 'pulseGlow 8s ease-in-out infinite'
        }} />

        <Row align="middle" gutter={[36, 36]} style={{ position: 'relative', zIndex: 2 }}>
          <Col xs={24} md={14}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {/* Premium Store Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '30px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Tag color="#ff4d4f" style={{ borderRadius: '12px', margin: 0, fontWeight: 700 }}>
                  PREMIUM TOY SHOP
                </Tag>
                <Text style={{ color: '#e6f7ff', fontSize: '13px', fontWeight: 600 }}>
                  ✨ 100% Certified Safe & Genuine
                </Text>
              </div>

              {/* Animated Shop Name Headline */}
              <Title level={1} style={{ margin: 0, fontSize: '46px', lineHeight: '1.15' }}>
                Welcome to <span className="animated-shop-title">{shopName}</span>
              </Title>

              {/* Motto & Description */}
              <Paragraph style={{ color: '#e6f7ff', fontSize: '18px', lineHeight: '1.6', margin: '4px 0 16px', maxWidth: '90%' }}>
                {motto} Discover handpicked educational toys, STEM kits, plushies, and action figures designed for endless joy and growth.
              </Paragraph>

              {/* Action Buttons */}
              <Space wrap size={16}>
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => navigate('/products')}
                  className="hero-action-btn"
                  icon={<RocketOutlined />}
                  style={{ 
                    background: 'linear-gradient(135deg, #1677ff 0%, #0050b3 100%)', 
                    border: 'none', 
                    height: '52px', 
                    padding: '0 28px',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: 700,
                    boxShadow: '0 6px 20px rgba(22, 119, 255, 0.35)'
                  }}
                >
                  Explore Collection
                </Button>
                
                <Button 
                  size="large" 
                  onClick={() => navigate('/about')}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.12)', 
                    color: '#fff', 
                    border: '1px solid rgba(255, 255, 255, 0.3)', 
                    backdropFilter: 'blur(10px)',
                    height: '52px', 
                    padding: '0 24px',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  About Us &rarr;
                </Button>
              </Space>
            </Space>
          </Col>

          {/* Hero Right Visual Showcase */}
          <Col xs={24} md={10} style={{ textAlign: 'center' }}>
            <div style={{
              position: 'relative',
              display: 'inline-block',
              padding: '16px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}>
              {logoUrl ? (
                <img 
                  src={logoUrl}
                  alt={shopName}
                  style={{
                    maxHeight: '160px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
                  }}
                />
              ) : (
                <img 
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=500&auto=format&fit=crop"
                  alt="Toys Collection"
                  style={{
                    width: '100%',
                    maxHeight: '260px',
                    borderRadius: '16px',
                    objectFit: 'cover'
                  }}
                />
              )}

              {/* Floating Badge Chips */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '-12px',
                background: '#fff',
                color: '#001529',
                padding: '6px 14px',
                borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                fontWeight: 700,
                fontSize: '13px',
                animation: 'floatBadge 4s ease-in-out infinite'
              }}>
                ⭐ 4.9 Parent Rating
              </div>

              <div style={{
                position: 'absolute',
                bottom: '-12px',
                right: '-12px',
                background: '#52c41a',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '20px',
                boxShadow: '0 4px 14px rgba(82, 196, 26, 0.4)',
                fontWeight: 700,
                fontSize: '13px',
                animation: 'floatBadge 4s ease-in-out 2s infinite'
              }}>
                🚚 Express Delivery
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Store Features Highlight Bar */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: '16px', textAlign: 'center', border: '1px solid #f0f0f0', background: '#fff' }}>
            <RocketOutlined style={{ fontSize: '26px', color: '#1890ff', marginBottom: '8px' }} />
            <Text strong style={{ display: 'block', fontSize: '14px' }}>Free Shipping</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>On orders over ₹1,000</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: '16px', textAlign: 'center', border: '1px solid #f0f0f0', background: '#fff' }}>
            <SafetyCertificateOutlined style={{ fontSize: '26px', color: '#52c41a', marginBottom: '8px' }} />
            <Text strong style={{ display: 'block', fontSize: '14px' }}>100% Non-Toxic</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>Certified child-safe toys</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: '16px', textAlign: 'center', border: '1px solid #f0f0f0', background: '#fff' }}>
            <SyncOutlined style={{ fontSize: '26px', color: '#faad14', marginBottom: '8px' }} />
            <Text strong style={{ display: 'block', fontSize: '14px' }}>7-Day Returns</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>Hassle-free replacements</Text>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: '16px', textAlign: 'center', border: '1px solid #f0f0f0', background: '#fff' }}>
            <CustomerServiceOutlined style={{ fontSize: '26px', color: '#722ed1', marginBottom: '8px' }} />
            <Text strong style={{ display: 'block', fontSize: '14px' }}>Parent Support</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>WhatsApp & Call Hotline</Text>
          </Card>
        </Col>
      </Row>

      {/* Categories Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              <AppstoreOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> Explore Toy Categories
            </Title>
            <Text type="secondary">Browse by age, interest, and play category</Text>
          </div>
          <Link to="/products" style={{ fontWeight: 600, color: '#1890ff' }}>
            View All Toys <ArrowRightOutlined />
          </Link>
        </div>

        <Row gutter={[20, 20]}>
          {categories.map((cat) => (
            <Col xs={12} sm={8} md={6} lg={4.8} key={cat.id}>
              <Card
                hoverable
                className="cat-card-hover"
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                style={{
                  borderRadius: '18px',
                  textAlign: 'center',
                  border: '1px solid #f0f0f0',
                  background: '#fff'
                }}
                bodyStyle={{ padding: '20px 14px' }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #e6f7ff 0%, #bae0ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '26px'
                }}>
                  🧸
                </div>
                <Text strong style={{ fontSize: '15px', color: '#1f1f1f', display: 'block' }}>{cat.name}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>Explore &rarr;</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Latest Products Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              <FireOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} /> Hot New Arrivals
            </Title>
            <Text type="secondary">Latest toys added to {shopName}</Text>
          </div>
          <Link to="/products" style={{ fontWeight: 600, color: '#ff4d4f' }}>
            Shop All Arrivals <ArrowRightOutlined />
          </Link>
        </div>
        
        <Row gutter={[20, 20]}>
          {latestProducts.map((prod) => {
            const mainImage = prod.images?.find(img => img.isMain) || { imageUrl: prod.imageUrls?.[0], zoomScale: 1.0 };
            const mainImageUrl = mainImage?.imageUrl || prod.imageUrls?.[0];
            const zoom = mainImage?.zoomScale || 1.0;
            const discountPercent = prod.mrp > prod.price ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : 0;

            return (
              <Col xs={24} sm={12} md={8} lg={6} key={prod.id}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{ 
                        position: 'relative', 
                        overflow: 'hidden', 
                        borderTopLeftRadius: '18px', 
                        borderTopRightRadius: '18px', 
                        cursor: 'pointer',
                        width: '100%',
                        aspectRatio: '4/3',
                        background: '#fafafa'
                      }}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      {discountPercent > 0 && (
                        <Tag color="#ff4d4f" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, fontWeight: 700, borderRadius: '8px' }}>
                          -{discountPercent}% OFF
                        </Tag>
                      )}
                      <img
                        alt={prod.name}
                        src={resolveProductImageUrl(mainImageUrl, 'thumb')}
                        loading="lazy"
                        style={{ 
                          height: '100%', 
                          width: '100%', 
                          objectFit: 'cover', 
                          display: 'block',
                          transform: `scale(${zoom})`,
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    </div>
                  }
                  onClick={() => navigate(`/products/${prod.id}`)}
                  style={{
                    borderRadius: '18px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    border: '1px solid #f0f0f0'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Card.Meta
                    title={
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1f1f1f' }}>
                        {prod.name}
                      </span>
                    }
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%', marginTop: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {prod.categoryName}
                          </Text>
                          <span style={{ color: '#faad14', fontSize: '12px' }}>
                            <StarFilled /> 4.9
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <div>
                            <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                              ₹{prod.price.toLocaleString('en-IN')}
                            </Text>
                            {prod.mrp > prod.price && (
                              <Text delete style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '6px' }}>
                                ₹{prod.mrp.toLocaleString('en-IN')}
                              </Text>
                            )}
                          </div>
                          <Tag color={prod.stockQuantity > 0 ? 'green' : 'red'} style={{ borderRadius: '6px', fontWeight: 600, margin: 0 }}>
                            {prod.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </Tag>
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </Space>
  );
};

export default Home;
