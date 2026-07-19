import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Button, Space, Typography, Tooltip, Avatar } from 'antd';
import {
  ShoppingCartOutlined, ShopOutlined, HomeOutlined,
  DashboardOutlined, UserOutlined
} from '@ant-design/icons';
import { CartContext } from '../context/CartContext';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import LoginDrawer from '../components/LoginDrawer';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const CustomerLayout = () => {
  const { cartCount } = useContext(CartContext);
  const { isAuthenticated } = useContext(AdminAuthContext);
  const { customer, isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: <Link to="/products">Toys</Link>,
    },
  ];

  return (
    <Layout className="layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7a45 100%)',
            width: '40px', height: '40px',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: '12px',
            boxShadow: '0 4px 10px rgba(255, 77, 79, 0.3)'
          }}>
            <ShopOutlined style={{ color: '#fff', fontSize: '20px' }} />
          </div>
          <Typography.Title level={4} style={{
            margin: 0,
            background: 'linear-gradient(45deg, #1890ff, #722ed1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800
          }}>
            ToyVerse
          </Typography.Title>
        </div>

        {/* Nav menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ flex: 1, marginLeft: '24px', borderBottom: 'none' }}
        />

        {/* Right actions */}
        <Space size={4} align="center">

          {/* Customer Login / Avatar */}
          <Tooltip title={isLoggedIn ? `Signed in as ${customer?.email}` : 'Sign in'} placement="bottom">
            <Button
              type="text"
              onClick={() => setLoginDrawerOpen(true)}
              style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                padding: '0 10px',
                position: 'relative'
              }}
            >
              {isLoggedIn ? (
                <Avatar
                  size={30}
                  style={{
                    background: 'linear-gradient(135deg, #1677ff, #4096ff)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {customer?.name?.[0]?.toUpperCase()}
                </Avatar>
              ) : (
                <div style={{
                  width: '32px', height: '32px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.2s, background 0.2s',
                  color: '#595959'
                }}>
                  <UserOutlined style={{ fontSize: '15px' }} />
                </div>
              )}
            </Button>
          </Tooltip>

          {/* Cart */}
          <Link to="/cart">
            <Badge count={cartCount} offset={[2, 0]} color="#52c41a">
              <Button
                type="text"
                icon={<ShoppingCartOutlined style={{ fontSize: '22px', color: '#1890ff' }} />}
                style={{ height: '40px', display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '0 10px' }}
              >
                <span style={{ marginLeft: '4px', fontWeight: 600, color: '#1890ff' }}>Cart</span>
              </Button>
            </Badge>
          </Link>

          {/* Admin quick access */}
          {isAuthenticated ? (
            <Button
              type="primary"
              ghost
              icon={<DashboardOutlined />}
              onClick={() => navigate('/admin')}
              style={{ borderRadius: '8px' }}
            >
              Dashboard
            </Button>
          ) : null}
        </Space>
      </Header>

      <Content style={{ flex: 1, padding: '24px 50px', background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#001529', padding: '40px 50px' }}>
        <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>ToyVerse Shop</Typography.Title>
        <Text style={{ color: '#ffffff80', display: 'block', margin: '8px 0 24px' }}>
          Your portal to imagination, joy, and endless play. Built with love for kids of all ages.
        </Text>
        <Text style={{ color: '#ffffff45' }}>
          ToyVerse ©{new Date().getFullYear()} All rights reserved.
        </Text>
      </Footer>

      {/* Login Drawer */}
      <LoginDrawer open={loginDrawerOpen} onClose={() => setLoginDrawerOpen(false)} />
    </Layout>
  );
};

export default CustomerLayout;
