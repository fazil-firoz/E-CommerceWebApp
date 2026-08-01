import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, InputNumber, Space, Typography, Spin, Card, Tag, message, Carousel, Modal, Input, Tooltip } from 'antd';
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ShareAltOutlined,
  CopyOutlined,
  WhatsAppOutlined,
  MailOutlined,
  TwitterOutlined,
  FacebookOutlined,
  SendOutlined,
  CheckOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { shopApi } from '../../api/shopApi';
import { superAdminApi } from '../../api/superAdminApi';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { ThemeContext } from '../../context/ThemeContext';
import ProductBadge from '../../components/common/ProductBadge';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Text, Paragraph } = Typography;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { activeTheme } = useContext(ThemeContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);
  const [isWishlistEnabled, setIsWishlistEnabled] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const response = await productApi.getById(id);
        if (response.success && response.data) {
          setProduct(response.data);
          const initialImg = (response.data.imageUrls && response.data.imageUrls.length > 0)
            ? response.data.imageUrls[0]
            : (response.data.imageUrl || '');
          setSelectedImage(initialImg);
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

    const fetchShopInfo = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) setShopSettings(res.data);
      } catch (err) {}
    };

    const fetchControls = async () => {
      try {
        const res = await superAdminApi.getControlFlags();
        if (res.success && res.data) {
          setIsWishlistEnabled(res.data.isWishlistEnabled !== false);
        }
      } catch (err) {}
    };

    fetchProduct();
    fetchShopInfo();
    fetchControls();

    window.addEventListener('superAdminControlUpdated', fetchControls);
    return () => window.removeEventListener('superAdminControlUpdated', fetchControls);
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      const mainImageObj = product.images?.find(i => i.isMain) || product.images?.[0];
      const mainImageUrl = mainImageObj?.imageUrl || product.imageUrl || product.imageUrls?.[0] || 'https://via.placeholder.com/200?text=Toy';

      const buyNowItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: mainImageUrl,
        imageUrls: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [mainImageUrl],
        quantity,
        stockQuantity: product.stockQuantity,
      };

      navigate('/checkout', { state: { buyNowItem } });
    }
  };

  const currentUrl = window.location.href;
  const shopName = shopSettings?.shopName || 'ToyShop';

  const handleShareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} (₹${product.price.toLocaleString('en-IN')}) on ${shopName}!`,
          url: currentUrl,
        });
        return;
      } catch (err) {
        // Fallback to modal if native share is dismissed or unsupported
      }
    }
    setShareModalOpen(true);
  };

  const handleWhatsAppEnquiry = () => {
    if (!product) return;
    const rawNumber = shopSettings?.whatsAppNumber || shopSettings?.phone1 || '919876543210';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    const productUrl = window.location.href;
    const messageText = `Hello! 🌸 I am interested in inquiring about this product from your store:

🛍️ *Product:* ${product.name}
💰 *Price:* ₹${product.price?.toLocaleString('en-IN')}
🔗 *Link:* ${productUrl}

Could you please confirm availability and details? Thank you!`;

    const encodedMsg = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    message.success('Product link copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareText = `Check out ${product?.name} (₹${product?.price?.toLocaleString('en-IN')}) on ${shopName}: ${currentUrl}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const mailShareUrl = `mailto:?subject=${encodeURIComponent(`Check out ${product?.name} on ${shopName}`)}&body=${encodeURIComponent(shareText)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Check out ${product?.name}!`)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Check out ${product?.name} on ${shopName}!`)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Examining toy details..." />
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stockQuantity <= 0;

  // Theme colors
  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const secondaryColor = activeTheme?.secondaryColor || '#ff85c0';
  const accentColor = activeTheme?.accentColor || '#ff2a6d';
  const cardBgColor = activeTheme?.cardBgColor || '#ffffff';
  const textColor = activeTheme?.textColor || '#0f172a';


  return (
    <Card style={{ borderRadius: '24px', boxShadow: `0 8px 24px ${primaryColor}10`, padding: '20px', border: `1px solid ${primaryColor}22`, background: cardBgColor, transition: 'all 0.3s ease' }}>
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
              <ProductBadge label={product.badgeLabel} />
              {isWishlistEnabled && (
                <Button
                  type="text"
                  shape="circle"
                  icon={isInWishlist(product.id)
                    ? <HeartFilled className="wishlist-heart-active" style={{ color: accentColor, fontSize: '20px' }} />
                    : <HeartOutlined style={{ color: accentColor, fontSize: '20px' }} />}
                  onClick={(e) => toggleWishlist(product, e)}
                  className="wishlist-heart-btn"
                  style={{
                    position: 'absolute',
                    top: 14, right: 14, zIndex: 12,
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    width: '42px', height: '42px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                />
              )}
              {(() => {
                const allImages = (product.imageUrls && product.imageUrls.length > 0)
                  ? product.imageUrls
                  : (product.imageUrl ? [product.imageUrl] : []);

                return (
                  <>
                    <Carousel
                      ref={carouselRef}
                      dots={allImages.length > 1}
                      afterChange={(current) => {
                        setCurrentSlide(current);
                        if (allImages[current]) {
                          setSelectedImage(allImages[current]);
                        }
                      }}
                      style={{ height: '380px' }}
                    >
                      {allImages.length > 0 ? (
                        allImages.map((url, index) => (
                          <div key={index} style={{ height: '380px', width: '100%', borderRadius: '16px', overflow: 'hidden', background: '#fafafa', position: 'relative' }}>
                            <img
                              src={resolveProductImageUrl(url, 'large')}
                              alt={`${product.name} - slide ${index}`}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                display: 'block'
                              }}
                            />
                            <div style={{ display: 'none', width: '100%', height: '380px', background: '#f8fafc', alignItems: 'center', justifyContent: 'center', fontSize: '64px' }}>
                              🧸
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8' }}>
                          <ShopOutlined style={{ fontSize: '48px', color: primaryColor, opacity: 0.6, marginBottom: '12px' }} />
                          <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>No Product Image Available</Text>
                        </div>
                      )}
                    </Carousel>

                    {/* Thumbnails Row */}
                    {allImages.length > 1 && (
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px', marginTop: '12px', WebkitOverflowScrolling: 'touch' }}>
                        {allImages.map((url, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedImage(url);
                              setCurrentSlide(index);
                              carouselRef.current?.goTo(index);
                            }}
                            style={{
                              width: '64px', height: '64px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: currentSlide === index ? `2px solid ${primaryColor}` : '1px solid #d9d9d9',
                              cursor: 'pointer',
                              background: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: '4px',
                              flexShrink: 0,
                              transition: 'border-color 0.2s'
                            }}
                          >
                            <img
                              src={resolveProductImageUrl(url, 'thumb')}
                              alt={`preview ${index}`}
                              loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </Space>
        </Col>

        {/* Content Column */}
        <Col xs={24} md={14}>
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <Tag style={{ borderRadius: '20px', fontSize: '12px', padding: '4px 14px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                  {product.categoryName}
                </Tag>
                <Tag color={isOutOfStock ? 'red' : product.stockQuantity < 5 ? 'orange' : 'green'} style={{ fontWeight: 'bold', borderRadius: '12px', padding: '4px 12px' }}>
                  {isOutOfStock
                    ? 'Out of Stock'
                    : product.stockQuantity < 5
                      ? `Hurry, only ${product.stockQuantity} left!`
                      : 'In Stock'
                  }
                </Tag>
              </div>

              <Title level={2} style={{ margin: '12px 0 8px', fontWeight: 800, color: textColor, fontSize: '24px', lineHeight: 1.3 }}>
                {product.name}
              </Title>

              <Space align="baseline" style={{ display: 'flex', flexWrap: 'wrap' }}>
                <Text strong style={{ fontSize: '30px', color: primaryColor }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </Text>
                {product.mrp > product.price && (
                  <>
                    <Text delete style={{ color: '#94a3b8', fontSize: '18px', marginLeft: '8px' }}>
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </Text>
                    <Text style={{ color: '#16a34a', fontWeight: 700, marginLeft: '8px', fontSize: '14px' }}>
                      ({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF)
                    </Text>
                  </>
                )}
              </Space>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: '#64748b', marginTop: '2px' }}>
                Inclusive of all taxes
              </Text>

              {/* Un-congested Share & WhatsApp Inquiry Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <Button
                  icon={<WhatsAppOutlined style={{ fontSize: '16px', color: '#25D366' }} />}
                  onClick={handleWhatsAppEnquiry}
                  style={{
                    borderRadius: '10px',
                    height: '42px',
                    fontWeight: 700,
                    color: '#15803d',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  WhatsApp Inquiry
                </Button>
                <Button
                  icon={<ShareAltOutlined style={{ fontSize: '16px', color: primaryColor }} />}
                  onClick={handleShareProduct}
                  style={{
                    borderRadius: '10px',
                    height: '42px',
                    fontWeight: 700,
                    color: primaryColor,
                    background: `${primaryColor}12`,
                    border: `1px solid ${primaryColor}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                >
                  Share Product
                </Button>
              </div>
            </div>

            <div>
              <Text strong style={{ color: '#1e293b', fontSize: '15px' }}>Description:</Text>
              <Paragraph style={{ color: '#475569', marginTop: '6px', fontSize: '14px', lineHeight: '1.6' }}>
                {product.description || 'No description provided for this toy. Let your imagination discover its features!'}
              </Paragraph>
            </div>

            {!isOutOfStock && (
              <div>
                <Text strong style={{ color: '#1e293b', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Select Quantity:
                </Text>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                  <Button
                    type="text"
                    size="middle"
                    icon={<MinusOutlined style={{ fontSize: '12px', color: quantity <= 1 ? '#cbd5e1' : '#334155' }} />}
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={{ width: '38px', height: '38px', padding: 0 }}
                  />
                  <span style={{ padding: '0 14px', fontSize: '15px', fontWeight: 700, color: '#0f172a', minWidth: '28px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <Button
                    type="text"
                    size="middle"
                    icon={<PlusOutlined style={{ fontSize: '12px', color: (product.stockQuantity && quantity >= product.stockQuantity) ? '#cbd5e1' : '#334155' }} />}
                    disabled={product.stockQuantity && quantity >= product.stockQuantity}
                    onClick={() => setQuantity(prev => (product.stockQuantity ? Math.min(product.stockQuantity, prev + 1) : prev + 1))}
                    style={{ width: '38px', height: '38px', padding: 0 }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons — Stacked Full-Width (Flipkart/Shopify style) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', width: '100%' }}>
              <Button
                type="primary"
                ghost
                size="large"
                icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '14px',
                  fontWeight: 700,
                  fontSize: '16px',
                  borderColor: primaryColor,
                  color: primaryColor,
                  boxShadow: `0 4px 12px ${primaryColor}15`
                }}
              >
                Add To Cart
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined style={{ fontSize: '18px' }} />}
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                style={{
                  width: '100%',
                  height: '50px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '16px',
                  background: isOutOfStock ? undefined : `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                  border: 'none',
                  boxShadow: isOutOfStock ? 'none' : `0 6px 20px ${primaryColor}35`
                }}
              >
                Buy Now
              </Button>
            </div>

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

      {/* Interactive Share Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShareAltOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
            <span style={{ fontWeight: 800, fontSize: '17px' }}>Share Product with Friends</span>
          </div>
        }
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: '16px' }}
      >
        {/* Product Preview Card inside Modal */}
        <div style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          padding: '12px',
          background: '#f9f9f9',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          margin: '16px 0 20px'
        }}>
          <img
            src={resolveProductImageUrl(product.imageUrls?.[0], 'thumb')}
            alt={product.name}
            style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', background: '#fff', border: '1px solid #eee' }}
          />
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '15px', display: 'block' }}>{product.name}</Text>
            <Text strong style={{ color: primaryColor, fontSize: '16px' }}>₹{product.price.toLocaleString('en-IN')}</Text>
          </div>
        </div>

        {/* Social Share Channel Grid */}
        <Text strong style={{ fontSize: '13px', color: '#595959', display: 'block', marginBottom: '12px' }}>
          Share via:
        </Text>

        <Row gutter={[12, 12]} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#e6f7ff',
                border: '1px solid #91d5ff',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <WhatsAppOutlined style={{ fontSize: '24px', color: '#25D366' }} />
                <Text strong style={{ display: 'block', fontSize: '12px', color: '#1f1f1f', marginTop: '4px' }}>WhatsApp</Text>
              </div>
            </a>
          </Col>

          <Col span={8}>
            <a href={telegramShareUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#e6f7ff',
                border: '1px solid #91d5ff',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <SendOutlined style={{ fontSize: '24px', color: '#0088cc' }} />
                <Text strong style={{ display: 'block', fontSize: '12px', color: '#1f1f1f', marginTop: '4px' }}>Telegram</Text>
              </div>
            </a>
          </Col>

          <Col span={8}>
            <a href={mailShareUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#fff7e6',
                border: '1px solid #ffd591',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <MailOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                <Text strong style={{ display: 'block', fontSize: '12px', color: '#1f1f1f', marginTop: '4px' }}>Email</Text>
              </div>
            </a>
          </Col>

          <Col span={12}>
            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#f0f5ff',
                border: '1px solid #adc6ff',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <TwitterOutlined style={{ fontSize: '22px', color: '#1DA1F2' }} />
                <Text strong style={{ display: 'block', fontSize: '12px', color: '#1f1f1f', marginTop: '4px' }}>Twitter / X</Text>
              </div>
            </a>
          </Col>

          <Col span={12}>
            <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#f0f5ff',
                border: '1px solid #adc6ff',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <FacebookOutlined style={{ fontSize: '22px', color: '#4267B2' }} />
                <Text strong style={{ display: 'block', fontSize: '12px', color: '#1f1f1f', marginTop: '4px' }}>Facebook</Text>
              </div>
            </a>
          </Col>
        </Row>

        {/* Copy Direct Link Section */}
        <Text strong style={{ fontSize: '13px', color: '#595959', display: 'block', marginBottom: '8px' }}>
          Or Copy Direct Link:
        </Text>
        <Input.Group compact style={{ width: '100%', display: 'flex' }}>
          <Input
            value={currentUrl}
            readOnly
            style={{ borderRadius: '8px 0 0 8px', fontWeight: 500, flex: 1 }}
          />
          <Button
            type="primary"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopyLink}
            style={{
              borderRadius: '0 8px 8px 0',
              background: copied ? '#52c41a' : '#722ed1',
              borderColor: copied ? '#52c41a' : '#722ed1',
              fontWeight: 700
            }}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </Input.Group>
      </Modal>
    </Card>
  );
};

export default ProductDetails;
