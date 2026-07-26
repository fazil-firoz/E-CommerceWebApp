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
import ProductBadge from '../../components/common/ProductBadge';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
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
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Unboxing ToyVerse Wonderland..." />
      </div>
    );
  }

  // Dynamic Content with defaults
  const heroTitle = shopSettings?.heroTitle || 'Where Joy & Imagination Come Alive!';
  const heroDescription = shopSettings?.heroDescription || 'Explore our handpicked collection of certified safe STEM toys, educational building blocks, action collectibles, and wooden playsets designed for happy minds.';
  
  const configuredHeroImages = [
    shopSettings?.heroImageUrl1,
    shopSettings?.heroImageUrl2,
    shopSettings?.heroImageUrl3,
    shopSettings?.heroImageUrl4
  ].filter(url => url && url.trim() !== '');

  const defaultHeroImages = [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=480&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=480&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=480&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=480&auto=format&fit=crop'
  ];

  const heroImagesToDisplay = configuredHeroImages.length > 0 ? configuredHeroImages : defaultHeroImages;

  const promoTitle = shopSettings?.promoTitle || 'Summer Carnival Sale — Enjoy Up to 30% OFF!';
  const promoDescription = shopSettings?.promoDescription || 'Apply coupon codes at checkout to unlock instant extra savings on all wooden playsets and STEM toys.';
  const promoCouponCode = shopSettings?.promoCouponCode || 'TOY30';

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

  // Helper product card renderer
  const renderProductCard = (prod) => {
    const mainImage = prod.images?.find(img => img.isMain) || { imageUrl: prod.imageUrls?.[0], zoomScale: 1.0 };
    const mainImageUrl = mainImage?.imageUrl || prod.imageUrls?.[0];
    const zoom = mainImage?.zoomScale || 1.0;

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={prod.id}>
        <Card
          hoverable
          cover={
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                cursor: 'pointer',
                width: '100%',
                aspectRatio: '4/3'
              }}
              onClick={() => navigate(`/products/${prod.id}`)}
            >
              <ProductBadge label={prod.badgeLabel} />
              {isWishlistEnabled && (
                <Button
                  type="text"
                  shape="circle"
                  icon={isInWishlist(prod.id) ? <HeartFilled className="wishlist-heart-active" style={{ color: '#ff4d4f', fontSize: '18px' }} /> : <HeartOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />}
                  onClick={(e) => toggleWishlist(prod, e)}
                  className="wishlist-heart-btn"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 12,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
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
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '1px solid #f0f0f0'
          }}
        >
          <Card.Meta
            title={
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#262626' }}>
                {prod.name}
              </span>
            }
            description={
              <Space direction="vertical" size={4} style={{ width: '100%', marginTop: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {prod.categoryName}
                </Text>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <div>
                    <Text strong style={{ fontSize: '17px', color: '#ff4d4f' }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </Text>
                    {prod.mrp > prod.price && (
                      <Text delete style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '6px' }}>
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
                      borderRadius: '8px',
                      background: prod.stockQuantity > 0 ? '#1890ff' : '#bfbfbf',
                      fontWeight: 600
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
    <Space direction="vertical" size={48} style={{ width: '100%', paddingBottom: '32px' }}>
      {/* 1. HERO BANNER */}
      {superAdminControl.isHeroBannerEnabled !== false && (
        <div style={{
          background: 'linear-gradient(135deg, #001529 0%, #1890ff 50%, #722ed1 100%)',
          borderRadius: '28px',
          padding: '64px 48px',
          color: '#fff',
          boxShadow: '0 12px 36px rgba(24, 144, 255, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow graphics */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '35%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,77,79,0.12)', filter: 'blur(40px)' }} />

          <Row align="middle" gutter={[32, 32]}>
            <Col xs={24} md={14}>
              <Tag color="volcano" style={{ borderRadius: '20px', padding: '4px 14px', fontWeight: 700, fontSize: '12px', marginBottom: '16px' }}>
                ✨ DISCOVER MAGICAL PLAYTIME
              </Tag>

              <Title level={1} style={{ color: '#fff', fontSize: '42px', fontWeight: 900, marginBottom: '16px', lineHeight: '1.2' }}>
                {heroTitle}
              </Title>

              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.88)', fontSize: '17px', marginBottom: '32px', lineHeight: '1.6', maxWidth: '540px' }}>
                {heroDescription}
              </Paragraph>

              <Space size={16} wrap>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/products')}
                  style={{
                    background: '#ffffff',
                    color: '#001529',
                    border: 'none',
                    height: '52px',
                    padding: '0 32px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '16px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  Explore All Products <RightOutlined />
                </Button>

                <Button
                  ghost
                  size="large"
                  onClick={() => navigate('/products')}
                  style={{
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.4)',
                    height: '52px',
                    padding: '0 28px',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}
                >
                  Browse Categories
                </Button>
              </Space>

              {/* Stats Counters */}
              <Row gutter={[24, 16]} style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <Col span={8}>
                  <Text strong style={{ display: 'block', color: '#fff', fontSize: '22px', fontWeight: 800 }}>500+</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Unique Products</Text>
                </Col>
                <Col span={8}>
                  <Text strong style={{ display: 'block', color: '#fff', fontSize: '22px', fontWeight: 800 }}>1,000+</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Happy Customers</Text>
                </Col>
                <Col span={8}>
                  <Text strong style={{ display: 'block', color: '#fff', fontSize: '22px', fontWeight: 800 }}>4.9 ★</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Verified Rating</Text>
                </Col>
              </Row>
            </Col>

            {/* Auto-sliding 4 Hero Images Carousel */}
            <Col xs={24} md={10} style={{ textAlign: 'center' }}>
              <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', maxWidth: '400px', margin: '0 auto' }}>
                <Carousel autoplay autoplaySpeed={3500} fadeDots>
                  {heroImagesToDisplay.map((imgUrl, idx) => (
                    <div key={idx} style={{ height: '320px', borderRadius: '24px', overflow: 'hidden' }}>
                      <img
                        src={resolveProductImageUrl(imgUrl)}
                        alt={`Hero Slide ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '320px',
                          objectFit: 'cover',
                          display: 'block'
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
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px' }}>
              <AppstoreOutlined style={{ marginRight: '10px', color: '#1890ff' }} /> Explore Toy Collections
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: '#1890ff', fontSize: '14px' }}>
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
                      border: '1px solid #f0f0f0',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s ease'
                    }}
                    bodyStyle={{ padding: '24px 16px' }}
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(114, 46, 209, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      fontSize: '28px'
                    }}>
                      {icon}
                    </div>
                    <Text strong style={{ fontSize: '15px', color: '#262626', display: 'block' }}>
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
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px' }}>
              <StarOutlined style={{ marginRight: '10px', color: '#fa8c16' }} /> Featured Toys
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: '#1890ff', fontSize: '14px' }}>
              View Full Store <RightOutlined style={{ fontSize: '12px' }} />
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
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px' }}>
              <ThunderboltOutlined style={{ marginRight: '10px', color: '#1890ff' }} /> New Arrivals
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: '#1890ff', fontSize: '14px' }}>
              See More <RightOutlined style={{ fontSize: '12px' }} />
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
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '26px' }}>
              <CrownOutlined style={{ marginRight: '10px', color: '#ff4d4f' }} /> Best Sellers & Popular Toys
            </Title>
            <Link to="/products" style={{ fontWeight: 700, color: '#1890ff', fontSize: '14px' }}>
              Browse Top Toys <RightOutlined style={{ fontSize: '12px' }} />
            </Link>
          </div>

          <Row gutter={[20, 20]}>
            {displayBestSellers.map(renderProductCard)}
          </Row>
        </div>
      )}

      {/* 6. PROMO BANNER */}
      {superAdminControl.isPromoBannerEnabled !== false && (
        <Card
          style={{
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)',
            border: 'none',
            boxShadow: '0 10px 30px rgba(255, 77, 79, 0.25)',
            color: '#fff',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '40px 48px' }}
        >
          <Row align="middle" justify="space-between" gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Space direction="vertical" size={8}>
                <Tag color="gold" style={{ borderRadius: '12px', padding: '4px 12px', fontWeight: 800 }}>
                  🎉 SPECIAL OFFER: USE CODE {promoCouponCode}
                </Tag>
                <Title level={2} style={{ color: '#fff', margin: 0, fontWeight: 900, fontSize: '32px' }}>
                  {promoTitle}
                </Title>
                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', margin: 0 }}>
                  {promoDescription}
                </Paragraph>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Button
                size="large"
                onClick={() => navigate('/products')}
                style={{
                  background: '#fff',
                  color: '#ff4d4f',
                  border: 'none',
                  borderRadius: '14px',
                  height: '50px',
                  padding: '0 32px',
                  fontWeight: 800,
                  fontSize: '16px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                }}
              >
                Claim Offer Now
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
