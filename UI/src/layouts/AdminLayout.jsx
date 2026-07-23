import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import { 
  DashboardOutlined, 
  FolderOutlined, 
  ShoppingOutlined, 
  SolutionOutlined, 
  LogoutOutlined,
  HomeOutlined,
  ShopOutlined,
  ControlOutlined,
  BarChartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { shopApi } from '../api/shopApi';

const { Header, Content, Sider } = Layout;

const AdminLayout = () => {
  const { admin, logout, isAuthenticated } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [shopSettings, setShopSettings] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) {
          setShopSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch shop settings for admin layout', err);
      }
    };
    fetchShopInfo();
  }, []);

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
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: <Link to="/admin/reports">Reports</Link>,
    },
    {
      key: '/admin/app-control',
      icon: <ControlOutlined />,
      label: <Link to="/admin/app-control">App Control</Link>,
    },
    {
      key: '/admin/shop-settings',
      icon: <ShopOutlined />,
      label: <Link to="/admin/shop-settings">Shop Settings</Link>,
    },
  ];

  const shopName = shopSettings?.shopName || 'Shop';

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
            {shopName} Admin
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
          height: '64px',
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography.Text strong style={{ fontSize: '15px', color: '#001529' }}>
              ⚙️ Admin Console
            </Typography.Text>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button 
              icon={<HomeOutlined />} 
              onClick={() => navigate('/')}
              style={{ borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            >
              View Storefront
            </Button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserOutlined style={{ color: '#1890ff' }} />
                <Typography.Text strong>{admin?.username || 'Admin'}</Typography.Text>
              </div>
              <Button 
                type="text" 
                danger 
                icon={<LogoutOutlined />} 
                onClick={logout}
                style={{ borderRadius: '6px', display: 'flex', alignItems: 'center' }}
              >
                Logout
              </Button>
            </div>
          </div>
        </Header>

        <Content style={{ 
          margin: '24px', 
          padding: '24px', 
          background: '#fff', 
          borderRadius: '8px',
          minHeight: '280px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
