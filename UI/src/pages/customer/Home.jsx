import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Col, Row, Button, Typography, Space, Spin, message } from 'antd';
import { RightOutlined, FireOutlined, AppstoreOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { superAdminApi } from '../../api/superAdminApi';
import { WishlistContext } from '../../context/WishlistContext';
import ProductBadge from '../../components/common/ProductBadge';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const { toggleWishlist, isInWishlist } = React.useContext(WishlistContext);
  const [categories, setCategories] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlistEnabled, setIsWishlistEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const res = await superAdminApi.getControlFlags();
        if (res.success && res.data) {
          setIsWishlistEnabled(res.data.isWishlistEnabled !== false);
        }
      } catch (err) {}
    };

    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll({ pageSize: 8 })
        ]);

        if (catRes.success) setCategories(catRes.data || []);
        if (prodRes.success) setLatestProducts(prodRes.data || []);
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
        <Spin size="large" tip="Entering ToyVerse..." />
      </div>
    );
  }

  return (
    <Space direction="vertical" size={40} style={{ width: '100%' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        borderRadius: '24px',
        padding: '60px 48px',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(24, 144, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '40%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <Row align="middle" gutter={[32, 32]}>
          <Col xs={24} md={14}>
            <Title level={1} style={{ color: '#fff', fontSize: '42px', fontWeight: 800, marginBottom: '16px' }}>
              Discover the World of Imagination!
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
              Explore our curated selection of premium toys, educational STEM kits, family board games, and articulable action figures designed to inspire creativity and joy.
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate('/products')}
              style={{ 
                background: '#fff', 
                color: '#1890ff', 
                border: 'none', 
                height: '48px', 
                borderRadius: '12px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
              }}
            >
              Shop Now <RightOutlined />
            </Button>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'center' }}>
            <img 
              src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=400&auto=format&fit=crop"
              alt="Toy Selection"
              style={{
                maxWidth: '100%',
                maxHeight: '280px',
                borderRadius: '20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                transform: 'rotate(2deg)'
              }}
            />
          </Col>
        </Row>
      </div>

      {/* Categories Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            <AppstoreOutlined style={{ marginRight: '10px', color: '#1890ff' }} /> Explore Categories
          </Title>
        </div>
        <Row gutter={[24, 24]}>
          {categories.map((cat) => (
            <Col xs={12} sm={8} md={6} lg={4.8} key={cat.id}>
              <Card
                hoverable
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                style={{
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}
                bodyStyle={{ padding: '24px 16px' }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(24, 144, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#1890ff',
                  fontSize: '24px'
                }}>
                  🧸
                </div>
                <Text strong style={{ fontSize: '15px', color: '#262626' }}>{cat.name}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Latest Products Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            <FireOutlined style={{ marginRight: '10px', color: '#ff4d4f' }} /> Hot New Toys
          </Title>
          <Link to="/products" style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            View All <RightOutlined style={{ fontSize: '12px', marginLeft: '4px' }} />
          </Link>
        </div>
        
        <Row gutter={[24, 24]}>
          {latestProducts.map((prod) => {
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
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#262626' }}>
                      {prod.name}
                    </span>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%', marginTop: '4px' }}>
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {prod.categoryName}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
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
                        <Text 
                          style={{ 
                            fontSize: '12px', 
                            background: prod.stockQuantity > 0 ? '#f6ffed' : '#fff2f0',
                            color: prod.stockQuantity > 0 ? '#52c41a' : '#ff4d4f',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          {prod.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </Text>
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
