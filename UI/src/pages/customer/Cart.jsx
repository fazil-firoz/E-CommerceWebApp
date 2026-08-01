import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, InputNumber, Space, Typography, Card, Row, Col, Empty, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { CartContext } from '../../context/CartContext';
import { shipmentApi } from '../../api/shipmentApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Text } = Typography;

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const [shippingMethod, setShippingMethod] = useState(null);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await shipmentApi.getAll();
        if (res.success && res.data && res.data.length > 0) {
          const defaultMethod = res.data.find(m => m.isDefault && m.isActive) || res.data.find(m => m.isActive) || res.data[0];
          setShippingMethod(defaultMethod);
        }
      } catch (err) {
        console.error('Failed to load shipping method', err);
      }
    };
    fetchShipping();
  }, []);

  const calculateShippingFee = () => {
    if (!shippingMethod) return 0;
    if (shippingMethod.freeShippingThreshold > 0 && cartTotal >= shippingMethod.freeShippingThreshold) {
      return 0;
    }
    return shippingMethod.fee;
  };

  const shippingCharge = calculateShippingFee();
  const grandTotal = cartTotal + shippingCharge;

  const columns = [
    {
      title: 'Toy Details',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <img
            src={resolveProductImageUrl(record.imageUrl || record.imageUrls?.[0], 'thumb')}
            alt={text}
            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f0f0f0' }}
          />
          <div>
            <Text strong style={{ fontSize: '15px', color: '#262626', display: 'block' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Unit Price: ₹{record.price.toLocaleString('en-IN')}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (qty, record) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined style={{ fontSize: '10px', color: qty <= 1 ? '#cbd5e1' : '#334155' }} />}
            disabled={qty <= 1}
            onClick={() => updateQuantity(record.id, qty - 1)}
            style={{ width: '28px', height: '28px', padding: 0 }}
          />
          <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '20px', textAlign: 'center' }}>
            {qty}
          </span>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined style={{ fontSize: '10px', color: (record.stockQuantity && qty >= record.stockQuantity) ? '#cbd5e1' : '#334155' }} />}
            disabled={record.stockQuantity && qty >= record.stockQuantity}
            onClick={() => updateQuantity(record.id, qty + 1)}
            style={{ width: '28px', height: '28px', padding: 0 }}
          />
        </div>
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <Text strong style={{ fontSize: '15px' }}>
          ₹{(record.price * record.quantity).toLocaleString('en-IN')}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        />
      ),
    },
  ];

  if (cartItems.length === 0) {
    return (
      <Card style={{ borderRadius: '24px', textAlign: 'center', padding: '60px 0', border: '1px solid #f0f0f0' }}>
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: '70px', color: '#bfbfbf' }} />}
          description={
            <span style={{ fontSize: '16px', color: '#8c8c8c' }}>
              Your shopping cart is currently empty!
            </span>
          }
        >
          <Button type="primary" size="large" onClick={() => navigate('/products')} style={{ borderRadius: '8px' }}>
            <ArrowLeftOutlined /> Explore Products
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      {/* Table Side */}
      <Col xs={24} lg={16}>
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            border: '1px solid #e2e8f0'
          }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0, fontWeight: 800, fontSize: '18px' }}>
                Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </Title>
              <Popconfirm
                title="Are you sure you want to clear your cart?"
                onConfirm={clearCart}
                okText="Yes"
                cancelText="No"
              >
                <Button type="link" danger style={{ fontWeight: 700, padding: 0 }}>
                  Clear Cart
                </Button>
              </Popconfirm>
            </div>
          }
        >
          {/* Desktop Table View */}
          <div className="desktop-cart-table">
            <Table
              dataSource={cartItems.map((item) => ({ ...item, key: item.id }))}
              columns={columns}
              pagination={false}
              size="middle"
            />
          </div>

          {/* Mobile Stacked Vertical Item Cards */}
          <div className="mobile-cart-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <img
                    src={resolveProductImageUrl(item.imageUrl || item.imageUrls?.[0], 'thumb')}
                    alt={item.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid #f1f5f9',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <Text strong style={{ fontSize: '14px', color: '#0f172a', lineHeight: 1.3, display: 'block' }}>
                        {item.name}
                      </Text>
                      <Popconfirm
                        title="Remove item?"
                        onConfirm={() => removeFromCart(item.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined style={{ fontSize: '16px' }} />}
                          style={{ padding: '0 4px', height: '24px' }}
                        />
                      </Popconfirm>
                    </div>

                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '2px' }}>
                      Unit Price: ₹{item.price.toLocaleString('en-IN')}
                    </Text>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Qty:</Text>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff' }}>
                          <Button
                            type="text"
                            size="small"
                            icon={<MinusOutlined style={{ fontSize: '10px', color: item.quantity <= 1 ? '#cbd5e1' : '#334155' }} />}
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ width: '28px', height: '28px', padding: 0 }}
                          />
                          <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined style={{ fontSize: '10px', color: (item.stockQuantity && item.quantity >= item.stockQuantity) ? '#cbd5e1' : '#334155' }} />}
                            disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ width: '28px', height: '28px', padding: 0 }}
                          />
                        </div>
                      </div>

                      <Text strong style={{ fontSize: '15px', color: '#0f172a' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Col>

      {/* Summary Card Side */}
      <Col xs={24} lg={8}>
        <Card
          style={{ 
            borderRadius: '24px', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)', 
            border: '1px solid rgba(0,0,0,0.06)',
            position: 'sticky',
            top: '84px'
          }}
          title={<span style={{ fontWeight: 700, fontSize: '16px' }}>Order Summary</span>}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Subtotal:</Text>
              <Text strong>₹{cartTotal.toLocaleString('en-IN')}</Text>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Shipping Delivery:</Text>
              {shippingCharge === 0 ? (
                <Text type="success" strong>FREE</Text>
              ) : (
                <Text strong>₹{shippingCharge.toLocaleString('en-IN')}</Text>
              )}
            </div>
            
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <Text strong style={{ fontSize: '16px' }}>Grand Total:</Text>
              <Text strong style={{ fontSize: '20px', color: '#ff4d4f' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </Text>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<CreditCardOutlined />}
              onClick={() => navigate('/checkout')}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(82, 196, 26, 0.3)'
              }}
            >
              Proceed to Checkout
            </Button>
            
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/products')}
              style={{ width: '100%', fontWeight: 500 }}
            >
              Continue Shopping
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default Cart;
