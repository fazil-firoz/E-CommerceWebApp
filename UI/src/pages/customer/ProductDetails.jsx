import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, InputNumber, Space, Typography, Spin, Card, Tag, message, Carousel } from 'antd';
import { ShoppingCartOutlined, ThunderboltOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { CartContext } from '../../context/CartContext';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Text, Paragraph } = Typography;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productApi.getById(id);
        if (response.success && response.data) {
          setProduct(response.data);
          setSelectedImage(response.data.imageUrls?.[0] || 'https://via.placeholder.com/400?text=Toy');
          setCurrentSlide(0);
        } else {
          message.error('Toy not found');
          navigate('/products');
        }
      } catch (err) {
        message.error('Error fetching product details');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity, false);
      setTimeout(() => {
        navigate('/checkout');
      }, 50);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Examining toy details..." />
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <Card style={{ borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', padding: '20px', border: '1px solid #f0f0f0' }}>
      <Row gutter={[40, 32]}>
        {/* Images Column */}
        <Col xs={24} md={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid #f0f0f0',
              background: '#fff',
              position: 'relative'
            }}>
              <Carousel
                ref={carouselRef}
                dots={true}
                afterChange={(current) => {
                  setCurrentSlide(current);
                  if (product.imageUrls?.[current]) {
                    setSelectedImage(product.imageUrls[current]);
                  }
                }}
                style={{ height: '400px' }}
              >
                {(product.imageUrls && product.imageUrls.length > 0) ? (
                  product.imageUrls.map((url, index) => (
                    <div key={index} style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                      <img 
                        src={resolveProductImageUrl(url, 'large')} 
                        alt={`${product.name} - slide ${index}`}
                        loading="lazy"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '400px', 
                          objectFit: 'contain',
                          margin: '0 auto',
                          display: 'block'
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                    <img 
                      src="https://via.placeholder.com/400?text=No+Image" 
                      alt="placeholder" 
                      style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', margin: '0 auto' }} 
                    />
                  </div>
                )}
              </Carousel>
            </div>
            
            {/* Thumbnails Row */}
            {product.imageUrls?.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.imageUrls.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedImage(url);
                      setCurrentSlide(index);
                      carouselRef.current?.goTo(index);
                    }}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: currentSlide === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <img 
                      src={resolveProductImageUrl(url, 'thumb')} 
                      alt={`preview ${index}`} 
                      loading="lazy"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                ))}
              </div>
            )}
          </Space>
        </Col>

        {/* Content Column */}
        <Col xs={24} md={14}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <div>
              <Tag color="#1890ff" style={{ borderRadius: '4px', fontSize: '13px', padding: '2px 10px' }}>
                {product.categoryName}
              </Tag>
              <Title level={2} style={{ margin: '12px 0 8px', fontWeight: 800 }}>
                {product.name}
              </Title>
              
              <Space align="baseline" style={{ display: 'flex', flexWrap: 'wrap' }}>
                <Text strong style={{ fontSize: '32px', color: '#ff4d4f' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </Text>
                {product.mrp > product.price && (
                  <>
                    <Text delete style={{ color: '#bfbfbf', fontSize: '18px', marginLeft: '8px' }}>
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ color: '#52c41a', fontWeight: 600, marginLeft: '8px', fontSize: '15px' }}>
                      ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
                    </Text>
                  </>
                )}
              </Space>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: '#8c8c8c', marginTop: '2px' }}>
                Inclusive of all taxes
              </Text>
            </div>

            <Card style={{ background: '#fcfcfc', borderRadius: '12px', border: '1px dashed #d9d9d9' }} bodyStyle={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: '#595959' }}>Availability Status:</Text>
                <Tag color={isOutOfStock ? 'red' : product.stockQuantity < 5 ? 'orange' : 'green'} style={{ fontWeight: 'bold' }}>
                  {isOutOfStock 
                    ? 'Out of Stock' 
                    : product.stockQuantity < 5 
                      ? `Hurry, only ${product.stockQuantity} left!` 
                      : 'In Stock'
                  }
                </Tag>
              </div>
            </Card>

            <div>
              <Text strong style={{ color: '#262626', fontSize: '15px' }}>Description:</Text>
              <Paragraph style={{ color: '#595959', marginTop: '6px', fontSize: '15px', lineHeight: '1.6' }}>
                {product.description || 'No description provided for this toy. Let your imagination discover its features!'}
              </Paragraph>
            </div>

            {!isOutOfStock && (
              <div>
                <Text strong style={{ color: '#262626', fontSize: '15px', display: 'block', marginBottom: '8px' }}>
                  Select Quantity:
                </Text>
                <InputNumber
                  min={1}
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  style={{ width: '120px', borderRadius: '8px' }}
                  size="large"
                />
              </div>
            )}

            <Space size="large" style={{ marginTop: '16px', width: '100%' }}>
              <Button
                type="primary"
                ghost
                size="large"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{ height: '48px', minWidth: '160px', borderRadius: '12px', fontWeight: 600 }}
              >
                Add To Cart
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                style={{ 
                  height: '48px', 
                  minWidth: '160px', 
                  borderRadius: '12px', 
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #fa8c16 0%, #fc5531 100%)',
                  border: 'none',
                  boxShadow: isOutOfStock ? 'none' : '0 4px 15px rgba(250, 140, 22, 0.3)'
                }}
              >
                Buy Now
              </Button>
            </Space>

            <div style={{ marginTop: '24px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
              <Space size="middle">
                <SafetyCertificateOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  100% Genuine Toys | Secure Payments | Safe & Sanitized Packing
                </Text>
              </Space>
            </div>

          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductDetails;
