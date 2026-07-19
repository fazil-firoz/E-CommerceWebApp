import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Spin, Typography, Space, Table, Tag, Button, message } from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  FileTextOutlined, 
  FieldTimeOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { adminApi } from '../../api/adminApi';
import { orderApi } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await adminApi.getDashboardStats();
        const ordersRes = await orderApi.getAll();

        if (statsRes.success) setStats(statsRes.data);
        if (ordersRes.success) setRecentOrders((ordersRes.data || []).slice(0, 5));
      } catch (err) {
        message.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Loading statistics..." />
      </div>
    );
  }

  const cardStyle = {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
    border: '1px solid #f0f0f0'
  };

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber', render: (val) => <Text strong>{val}</Text> },
    { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customerName' },
    { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render: (date) => new Date(date).toLocaleDateString() },
    { 
      title: 'Payment', 
      dataIndex: 'paymentStatus', 
      key: 'paymentStatus', 
      render: (status) => (
        <Tag color={status === 'Success' ? 'green' : status === 'Failed' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ) 
    },
    { 
      title: 'Order Status', 
      dataIndex: 'orderStatus', 
      key: 'orderStatus', 
      render: (status) => (
        <Tag color={
          status === 'Delivered' ? 'blue' : 
          status === 'Cancelled' ? 'red' : 
          status === 'Shipped' ? 'cyan' : 'gold'
        }>
          {status}
        </Tag>
      ) 
    },
    { 
      title: 'Amount', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount', 
      align: 'right', 
      render: (val) => <Text strong>₹{val.toLocaleString('en-IN')}</Text> 
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Admin Dashboard</Title>
        <Text type="secondary">Real-time metrics for your ToyVerse store</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4.8} style={{ width: '20%' }}>
          <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
            <Statistic
              title="Total Revenue"
              value={stats?.totalRevenue || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a', marginRight: '8px' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={4.8} style={{ width: '20%' }}>
          <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
            <Statistic
              title="Total Orders"
              value={stats?.totalOrders || 0}
              prefix={<FileTextOutlined style={{ color: '#1890ff', marginRight: '8px' }} />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4.8} style={{ width: '20%' }}>
          <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
            <Statistic
              title="Today's Orders"
              value={stats?.todaysOrders || 0}
              prefix={<FieldTimeOutlined style={{ color: '#722ed1', marginRight: '8px' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4.8} style={{ width: '20%' }}>
          <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
            <Statistic
              title="Pending Orders"
              value={stats?.pendingOrders || 0}
              prefix={<FieldTimeOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={4.8} style={{ width: '20%' }}>
          <Card style={cardStyle} bodyStyle={{ padding: '20px' }}>
            <Statistic
              title="Total Products"
              value={stats?.totalProducts || 0}
              prefix={<ShoppingOutlined style={{ color: '#eb2f96', marginRight: '8px' }} />}
              valueStyle={{ color: '#eb2f96', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        style={cardStyle} 
        title={<span style={{ fontWeight: 700 }}>Recent Orders</span>}
        extra={
          <Button type="link" onClick={() => navigate('/admin/orders')}>
            View All Orders <ArrowRightOutlined />
          </Button>
        }
      >
        <Table
          dataSource={recentOrders}
          columns={columns}
          pagination={false}
          rowKey="id"
          size="middle"
        />
      </Card>
    </Space>
  );
};

export default Dashboard;
