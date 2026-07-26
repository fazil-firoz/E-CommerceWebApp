import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ShoppingOutlined, HomeOutlined, CheckCircleFilled } from '@ant-design/icons';
import { ThemeContext } from '../../context/ThemeContext';
import './OrderSuccess.css';

const { Text } = Typography;

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeTheme } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const primaryColor = activeTheme?.primaryColor || '#ff6584';
  const secondaryColor = activeTheme?.secondaryColor || '#ff85c0';
  const accentColor = activeTheme?.accentColor || '#ff2a6d';

  const orderNumber = searchParams.get('orderNumber') || 'N/A';
  const status = searchParams.get('status') || 'Success';
  const errorMsg = searchParams.get('error') || 'Transaction could not be processed';
  const isSuccess = status === 'Success';

  useEffect(() => {
    // Trigger animation sequence
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setShowContent(true), 700);
  }, []);

  if (!isSuccess) {
    return (
      <div className="order-result-wrapper order-fail-bg">
        <div className={`order-result-card ${visible ? 'order-card-visible' : ''}`}>
          {/* Fail icon */}
          <div className="order-icon-wrap order-fail-icon">
            <svg viewBox="0 0 52 52" className="order-x-svg">
              <circle cx="26" cy="26" r="25" fill="none" className="order-x-circle" />
              <path fill="none" d="M16 16 36 36 M36 16 16 36" className="order-x-line" strokeLinecap="round" />
            </svg>
          </div>

          <h2 className="order-title order-fail-title">Payment Failed</h2>
          <p className="order-subtitle">Don't worry — no amount was deducted.</p>
          <div className="order-detail-box order-fail-box">
            <Text type="secondary" style={{ fontSize: '13px' }}>Reason</Text>
            <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#ff4d4f' }}>{errorMsg}</p>
          </div>
          {orderNumber !== 'N/A' && (
            <div className="order-detail-box" style={{ marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '13px' }}>Order Reference</Text>
              <p style={{ margin: '4px 0 0', fontWeight: 600, fontFamily: 'monospace' }}>{orderNumber}</p>
            </div>
          )}
          <div className="order-actions">
            <Button type="primary" danger size="large" onClick={() => navigate('/cart')} style={{ borderRadius: '12px' }}>
              Return to Cart
            </Button>
            <Button size="large" onClick={() => navigate('/products')} style={{ borderRadius: '12px' }}>
              Explore Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-result-wrapper order-success-bg" style={{
      background: `linear-gradient(135deg, #f0fdf4 0%, ${primaryColor}15 50%, #f0fdf4 100%)`
    }}>
      {/* Confetti particles */}
      <div className="confetti-container">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`confetti-piece confetti-${i % 6}`} style={{ '--i': i }} />
        ))}
      </div>

      <div className={`order-result-card ${visible ? 'order-card-visible' : ''}`} style={{
        border: `1.5px solid ${primaryColor}30`,
        boxShadow: `0 24px 60px ${primaryColor}20`
      }}>
        {/* Animated checkmark */}
        <div className="order-icon-wrap order-success-icon" style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
          boxShadow: `0 8px 28px ${primaryColor}50`
        }}>
          <svg viewBox="0 0 52 52" className="order-check-svg">
            <circle cx="26" cy="26" r="25" fill="none" className="order-check-circle" />
            <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="order-check-tick" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {showContent && (
          <>
            <div className="order-success-badge" style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
              boxShadow: `0 4px 12px ${primaryColor}40`
            }}>
              Payment Successful ✨
            </div>

            <h2 className="order-title order-success-title">Order Confirmed! 🎉</h2>
            <p className="order-subtitle">Thank you for shopping with us! Your order is being prepared with love.</p>

            <div className="order-detail-box" style={{
              background: `${primaryColor}08`,
              border: `1px solid ${primaryColor}25`
            }}>
              <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: primaryColor, fontWeight: 700 }}>
                Order Number
              </Text>
              <p className="order-number-text" style={{ color: primaryColor }}>{orderNumber}</p>
            </div>

            <div className="order-info-row">
              <div className="order-info-chip order-info-chip-green">
                <CheckCircleFilled style={{ color: '#52c41a', marginRight: '4px' }} /> Payment Confirmed
              </div>
              <div className="order-info-chip order-info-chip-blue" style={{
                background: `${primaryColor}15`,
                color: primaryColor,
                border: `1px solid ${primaryColor}40`
              }}>
                📦 Packing in Progress
              </div>
            </div>

            <p className="order-track-note">
              Shipment tracking details will be sent to your email address once your order ships.
            </p>

            <div className="order-actions">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
                className="order-continue-btn"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: 800,
                  height: '48px',
                  padding: '0 28px',
                  boxShadow: `0 6px 20px ${primaryColor}45`
                }}
              >
                Continue Shopping
              </Button>
              <Button
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                style={{
                  borderRadius: '14px',
                  fontWeight: 700,
                  height: '48px',
                  padding: '0 24px',
                  borderColor: `${primaryColor}40`
                }}
              >
                Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
