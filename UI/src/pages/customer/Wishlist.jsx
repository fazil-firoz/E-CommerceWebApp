import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Space, Empty, Tag } from 'antd';
import { HeartFilled, ShoppingCartOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { WishlistContext } from '../../context/WishlistContext';
import { CartContext } from '../../context/CartContext';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import ProductBadge from '../../components/common/ProductBadge';

const { Title, Text } = Typography;

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%', padding: '10px 0' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HeartFilled style={{ color: '#ff4d4f' }} /> My Saved Wishlist
          </Title>
          <Text type="secondary">
            Your collection of favorite toys saved for later or quick purchase ({wishlistItems.length} items).
          </Text>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} style={{ borderRadius: '8px' }}>
          Back to Shop
        </Button>
      </div>

      {wishlistItems.length === 0 ? (
        <Card style={{ borderRadius: '20px', padding: '60px 0', textAlign: 'center' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4} style={{ margin: '8px 0', color: '#595959' }}>Your Wishlist is Empty</Title>
                <Text type="secondary">Click the ❤️ heart icon on any toy card to save your favorites here!</Text>
              </div>
            }
          >
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/products')}
              style={{ marginTop: '16px', borderRadius: '10px', background: '#ff4d4f', borderColor: '#ff4d4f', fontWeight: 700 }}
            >
              Explore Toys
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {wishlistItems.map((prod) => {
            const mainImageUrl = prod.imageUrl || prod.imageUrls?.[0];
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={prod.id}>
                <Card
                  hoverable
                  style={{ borderRadius: '16px', border: '1px solid #f0f0f0', overflow: 'hidden' }}
                  cover={
                    <div
                      style={{ position: 'relative', height: '200px', cursor: 'pointer', overflow: 'hidden' }}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      <ProductBadge label={prod.badgeLabel} />
                      <img
                        alt={prod.name}
                        src={resolveProductImageUrl(mainImageUrl, 'large')}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px', background: '#ffffff' }}
                      />
                      <Button
                        type="primary"
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(prod.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                      />
                    </div>
                  }
                >
                  <div onClick={() => navigate(`/products/${prod.id}`)} style={{ cursor: 'pointer' }}>
                    <Tag color="blue" style={{ fontSize: '11px', borderRadius: '4px', marginBottom: '6px' }}>
                      {prod.categoryName || 'Toy'}
                    </Tag>
                    <Text strong style={{ fontSize: '15px', display: 'block', height: '42px', overflow: 'hidden', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      {prod.name}
                    </Text>

                    <div style={{ margin: '10px 0' }}>
                      <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                        ₹{prod.price?.toLocaleString('en-IN')}
                      </Text>
                      {prod.mrp > prod.price && (
                        <Text delete style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: '8px' }}>
                          ₹{prod.mrp.toLocaleString('en-IN')}
                        </Text>
                      )}
                    </div>
                  </div>

                  <Button
                    type="primary"
                    block
                    icon={<ShoppingCartOutlined />}
                    onClick={() => addToCart(prod, 1)}
                    style={{ borderRadius: '8px', fontWeight: 700 }}
                  >
                    Add to Cart
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Space>
  );
};

export default Wishlist;
