import React, { useContext, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Space, Typography } from 'antd';
import { 
  DashboardOutlined, 
  FolderOutlined, 
  ShoppingOutlined, 
  SolutionOutlined, 
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { AdminAuthContext } from '../context/AdminAuthContext';

const { Header, Content, Sider } = Layout;

const AdminLayout = () => {
  const { admin, logout, isAuthenticated } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: <Link to="/admin/categories">Categories</Link>,
    },
    {
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: '/admin/orders',
      icon: <SolutionOutlined />,
      label: <Link to="/admin/orders">Orders</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          background: '#001529'
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 24px',
          background: '#002140'
        }}>
          <Typography.Title level={4} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
            ToyVerse Admin
          </Typography.Title>
        </div>
        <Menu 
          theme="dark"
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          style={{ padding: '16px 0' }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <Typography.Text strong style={{ fontSize: '16px' }}>
            Welcome, {admin?.fullName || 'Administrator'}
          </Typography.Text>

          <Space size="middle">
            <Button 
              type="text" 
              icon={<HomeOutlined />} 
              onClick={() => navigate('/')}
            >
              Customer Site
            </Button>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              style={{ borderRadius: '6px' }}
            >
              Logout
            </Button>
          </Space>
        </Header>
        
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <div style={{ 
            padding: 24, 
            background: '#fff', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
            minHeight: '100%'
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
