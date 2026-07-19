import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ShoppingOutlined, HomeOutlined } from '@ant-design/icons';
import './OrderSuccess.css';

const { Text } = Typography;

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const orderNumber = searchParams.get('orderNumber') || 'N/A';
  const status = searchParams.get('status') || 'Success';
  const errorMsg = searchParams.get('error') || 'Transaction could not be processed';
  const isSuccess = status === 'Success';

  useEffect(() => {
    // Trigger animation sequence
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => setShowContent(true), 800);
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
            <Button type="primary" danger size="large" onClick={() => navigate('/cart')}>
              Return to Cart
            </Button>
            <Button size="large" onClick={() => navigate('/products')}>
              Explore Shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-result-wrapper order-success-bg">
      {/* Confetti particles */}
      <div className="confetti-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`confetti-piece confetti-${i % 6}`} style={{ '--i': i }} />
        ))}
      </div>

      <div className={`order-result-card ${visible ? 'order-card-visible' : ''}`}>
        {/* Animated checkmark */}
        <div className="order-icon-wrap order-success-icon">
          <svg viewBox="0 0 52 52" className="order-check-svg">
            <circle cx="26" cy="26" r="25" fill="none" className="order-check-circle" />
            <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="order-check-tick" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {showContent && (
          <>
            <div className="order-success-badge">Payment Successful</div>

            <h2 className="order-title order-success-title">Thank You! 🎉</h2>
            <p className="order-subtitle">Your order has been placed and is being prepared with love.</p>

            <div className="order-detail-box">
              <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Number</Text>
              <p className="order-number-text">{orderNumber}</p>
            </div>

            <div className="order-info-row">
              <div className="order-info-chip order-info-chip-green">
                ✓ Payment Confirmed
              </div>
              <div className="order-info-chip order-info-chip-blue">
                📦 Packing in Progress
              </div>
            </div>

            <p className="order-track-note">
              If you provided an email address, you'll receive shipment tracking information once your order ships.
            </p>

            <div className="order-actions">
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/products')}
                className="order-continue-btn"
              >
                Continue Shopping
              </Button>
              <Button size="large" icon={<HomeOutlined />} onClick={() => navigate('/')}>
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
