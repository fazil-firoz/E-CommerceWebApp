import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Col, Row, List, Space, Typography, Spin, message, Empty, Button, Tooltip } from 'antd';
import { AppstoreOutlined, ShoppingCartOutlined, ThunderboltOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { superAdminApi } from '../../api/superAdminApi';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { ThemeContext } from '../../context/ThemeContext';
import ProductBadge from '../../components/common/ProductBadge';
import RecentSearchInput from '../../components/common/RecentSearchInput';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Text } = Typography;

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { activeTheme } = useContext(ThemeContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [addingId, setAddingId] = useState(null);
  const [isWishlistEnabled, setIsWishlistEnabled] = useState(true);

  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')) : null;

  // Theme-derived colors
  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const secondaryColor = activeTheme?.secondaryColor || '#ff85c0';
  const accentColor = activeTheme?.accentColor || '#ff2a6d';
  const cardBgColor = activeTheme?.cardBgColor || '#ffffff';
  const textColor = activeTheme?.textColor || '#0f172a';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await categoryApi.getAll();
        if (catRes.success) setCategories(catRes.data || []);
      } catch (err) {
        message.error('Failed to load categories');
      }
    };
    const fetchControls = async () => {
      try {
        const res = await superAdminApi.getControlFlags();
        if (res.success && res.data) {
          setIsWishlistEnabled(res.data.isWishlistEnabled !== false);
        }
      } catch (err) {}
    };

    fetchCategories();
    fetchControls();

    window.addEventListener('superAdminControlUpdated', fetchControls);
    return () => window.removeEventListener('superAdminControlUpdated', fetchControls);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (categoryId) params.categoryId = categoryId;
        if (search) params.search = search;

        const prodRes = await productApi.getAll(params);
        if (prodRes.success) {
          setProducts(prodRes.data || []);
        }
      } catch (err) {
        message.error('Failed to load toys');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, searchParams]);

  const handleCategorySelect = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (id === null) {
      newParams.delete('categoryId');
    } else {
      newParams.set('categoryId', id);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value) {
      newParams.delete('search');
    } else {
      newParams.set('search', value);
    }
    setSearchParams(newParams);
    setSearch(value);
  };

  const handleAddToCart = (e, prod) => {
    e.stopPropagation();
    if (prod.stockQuantity === 0) return;
    setAddingId(prod.id);
    addToCart({ ...prod, imageUrls: prod.imageUrls });
    setTimeout(() => setAddingId(null), 500);
  };

  const handleBuyNow = (e, prod) => {
    e.stopPropagation();
    if (prod.stockQuantity === 0) return;
    const mainImageObj = prod.images?.find(i => i.isMain) || prod.images?.[0];
    const mainImageUrl = mainImageObj?.imageUrl || prod.imageUrl || prod.imageUrls?.[0] || 'https://via.placeholder.com/200?text=Toy';

    const buyNowItem = {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      imageUrl: mainImageUrl,
      imageUrls: prod.imageUrls && prod.imageUrls.length > 0 ? prod.imageUrls : [mainImageUrl],
      quantity: 1,
      stockQuantity: prod.stockQuantity,
    };

    navigate('/checkout', { state: { buyNowItem } });
  };

  return (
    <Row gutter={[24, 24]}>
      {/* Category Sidebar Filter */}
      <Col xs={24} md={6}>
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            position: 'sticky',
            top: '84px',
            border: `1px solid ${primaryColor}22`,
            background: cardBgColor,
            transition: 'all 0.3s ease'
          }}
          title={
            <span style={{ fontWeight: 700, fontSize: '16px', color: textColor }}>
              <AppstoreOutlined style={{ marginRight: '8px', color: primaryColor }} /> Categories
            </span>
          }
        >
          <List
            dataSource={[{ id: null, name: 'All Products' }, ...categories]}
            renderItem={(item) => {
              const isSelected = item.id === categoryId;
              return (
                <List.Item
                  onClick={() => handleCategorySelect(item.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '4px',
                    borderBottom: 'none',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? `${primaryColor}18` : 'transparent',
                    color: isSelected ? primaryColor : '#595959',
                    transition: 'all 0.2s',
                    borderLeft: isSelected ? `3px solid ${primaryColor}` : '3px solid transparent'
                  }}
                >
                  {item.name}
                </List.Item>
              );
            }}
          />
        </Card>
      </Col>

      {/* Main Product Grid */}
      <Col xs={24} md={18}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Search Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: textColor }}>
              {categoryId ? categories.find(c => c.id === categoryId)?.name : 'All Products'}
            </Title>

            <RecentSearchInput
              placeholder="Search products..."
              value={search}
              onSearch={handleSearchSubmit}
              primaryColor={primaryColor}
              maxWidth="340px"
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <Card style={{ borderRadius: '16px', textAlign: 'center', padding: '40px 0', background: cardBgColor }}>
              <Empty
                description="No products match your criteria"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  style={{ background: primaryColor, borderColor: primaryColor }}
                  onClick={() => {
                    setSearchParams({});
                    setSearch('');
                  }}
                >
                  Clear Filters
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[20, 20]}>
              {products.map((prod) => (
                <Col xs={12} sm={12} lg={8} key={prod.id}>
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
                            icon={isInWishlist(prod.id)
                              ? <HeartFilled className="wishlist-heart-active" style={{ color: accentColor, fontSize: '18px' }} />
                              : <HeartOutlined style={{ color: accentColor, fontSize: '18px' }} />
                            }
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
                        {(() => {
                          const mainImage = prod.images?.find(img => img.isMain) || { imageUrl: prod.imageUrls?.[0], zoomScale: 1.0 };
                          const zoom = mainImage?.zoomScale || 1.0;
                          return (
                            <img
                              alt={prod.name}
                              src={resolveProductImageUrl(mainImage?.imageUrl, 'thumb')}
                              loading="lazy"
                              style={{
                                height: '100%',
                                width: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transform: `scale(${zoom})`,
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseOver={e => e.currentTarget.style.transform = `scale(${zoom * 1.04})`}
                              onMouseOut={e => e.currentTarget.style.transform = `scale(${zoom})`}
                            />
                          );
                        })()}
                        {prod.stockQuantity === 0 && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.45)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Text style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Out of Stock</Text>
                          </div>
                        )}
                      </div>
                    }
                    style={{
                      borderRadius: '16px',
                      boxShadow: `0 4px 16px ${primaryColor}14`,
                      border: `1px solid ${primaryColor}22`,
                      overflow: 'hidden',
                      background: cardBgColor,
                      transition: 'all 0.3s ease'
                    }}
                    styles={{ body: { padding: '16px' } }}
                  >
                    {/* Product info - clickable */}
                    <div onClick={() => navigate(`/products/${prod.id}`)} style={{ cursor: 'pointer', marginBottom: '14px' }}>
                      <Text strong style={{ fontSize: '15px', color: textColor, display: 'block', marginBottom: '4px', lineHeight: 1.4 }}>
                        {prod.name}
                      </Text>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: '18px', color: primaryColor }}>
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
                            fontSize: '11px',
                            background: prod.stockQuantity > 0 ? `${primaryColor}15` : '#fff2f0',
                            color: prod.stockQuantity > 0 ? primaryColor : '#ff4d4f',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          {prod.stockQuantity > 0 ? `${prod.stockQuantity} left` : 'Sold Out'}
                        </Text>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Tooltip title={prod.stockQuantity === 0 ? 'Out of stock' : 'Add to cart'}>
                        <Button
                          icon={<ShoppingCartOutlined />}
                          onClick={(e) => handleAddToCart(e, prod)}
                          disabled={prod.stockQuantity === 0}
                          loading={addingId === prod.id}
                          style={{
                            flex: 1,
                            borderRadius: '8px',
                            height: '36px',
                            fontWeight: 600,
                            fontSize: '13px',
                            borderColor: primaryColor,
                            color: primaryColor
                          }}
                        >
                          Add to Cart
                        </Button>
                      </Tooltip>

                      <Tooltip title={prod.stockQuantity === 0 ? 'Out of stock' : 'Buy now'}>
                        <Button
                          type="primary"
                          icon={<ThunderboltOutlined />}
                          onClick={(e) => handleBuyNow(e, prod)}
                          disabled={prod.stockQuantity === 0}
                          style={{
                            flex: 1,
                            borderRadius: '8px',
                            height: '36px',
                            fontWeight: 600,
                            fontSize: '13px',
                            background: prod.stockQuantity > 0 ? primaryColor : undefined,
                            borderColor: prod.stockQuantity > 0 ? primaryColor : undefined
                          }}
                        >
                          Buy Now
                        </Button>
                      </Tooltip>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </Col>
    </Row>
  );
};

export default ProductListing;
