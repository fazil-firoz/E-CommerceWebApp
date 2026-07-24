import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, InputNumber, Space, Typography, Card, Row, Col, Empty, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowLeftOutlined, CreditCardOutlined } from '@ant-design/icons';
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
        <InputNumber
          min={1}
          max={record.stockQuantity}
          value={qty}
          onChange={(val) => updateQuantity(record.id, val || 1)}
          style={{ width: '80px', borderRadius: '6px' }}
        />
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
            <ArrowLeftOutlined /> Explore Toys
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
          style={{ borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                Shopping Cart ({cartItems.length} items)
              </Title>
              <Popconfirm
                title="Are you sure you want to clear your cart?"
                onConfirm={clearCart}
                okText="Yes"
                cancelText="No"
              >
                <Button type="link" danger>
                  Clear Cart
                </Button>
              </Popconfirm>
            </div>
          }
        >
          <Table
            dataSource={cartItems.map((item) => ({ ...item, key: item.id }))}
            columns={columns}
            pagination={false}
            size="middle"
          />
        </Card>
      </Col>

      {/* Summary Card Side */}
      <Col xs={24} lg={8}>
        <Card
          style={{ 
            borderRadius: '24px', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.02)', 
            border: '1px solid #f0f0f0',
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
