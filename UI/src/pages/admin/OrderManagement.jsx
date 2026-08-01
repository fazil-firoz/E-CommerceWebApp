import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, Card, Row, Col, Divider, message, DatePicker, Tooltip } from 'antd';
import { EyeOutlined, SendOutlined, TruckOutlined, SearchOutlined, ReloadOutlined, FilterOutlined, ShopOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderApi } from '../../api/orderApi';
import { shopApi } from '../../api/shopApi';
import { superAdminApi } from '../../api/superAdminApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_MAP = {
  'Pending': 0, 'Paid': 1, 'Packed': 2, 'Shipped': 3, 'Delivered': 4, 'Cancelled': 5
};

const STATUS_COLORS = {
  'Pending': 'gold', 'Paid': 'green', 'Packed': 'blue',
  'Shipped': 'cyan', 'Delivered': 'purple', 'Cancelled': 'red'
};

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Shipping modal state
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // { orderId, newStatus }
  const [shippingForm] = Form.useForm();
  const [shippingLoading, setShippingLoading] = useState(false);
  const [isPrintInvoiceEnabled, setIsPrintInvoiceEnabled] = useState(true);

  // Fetch shop settings for invoice header/footer details & Super Admin control flags
  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await shopApi.getSettings();
        if (res.success && res.data) {
          setShopSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch shop settings for invoice', err);
      }
    };

    const fetchControlFlags = async () => {
      try {
        const res = await superAdminApi.getControlFlags();
        if (res.success && res.data) {
          setIsPrintInvoiceEnabled(res.data.isPrintInvoiceEnabled !== false);
        }
      } catch (err) {
        console.error('Failed to fetch Super Admin control flags', err);
      }
    };

    fetchShopInfo();
    fetchControlFlags();

    window.addEventListener('superAdminControlUpdated', fetchControlFlags);
    return () => window.removeEventListener('superAdminControlUpdated', fetchControlFlags);
  }, []);

  const fetchOrders = async (status = statusFilter, dates = dateRange, search = searchText) => {
    setLoading(true);
    try {
      const params = {};
      if (status !== null && status !== undefined) params.orderStatus = status;
      if (dates && dates[0] && dates[1]) {
        params.startDate = dates[0].startOf('day').toISOString();
        params.endDate = dates[1].endOf('day').toISOString();
      }
      if (search && search.trim()) params.search = search.trim();

      const response = await orderApi.getAll(params);
      if (response.success) setOrders(response.data || []);
    } catch (err) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleOpenDetails = async (order) => {
    setLoading(true);
    try {
      const res = await orderApi.getById(order.id);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
        setModalOpen(true);
      }
    } catch (err) {
      message.error('Failed to retrieve order details');
    } finally {
      setLoading(false);
    }
  };

  // Intercept status change - if Shipped, show courier modal first
  const handleStatusChange = (orderId, newStatusValue) => {
    if (newStatusValue === 3) { // Shipped = 3
      setPendingStatusChange({ orderId, newStatus: newStatusValue });
      shippingForm.resetFields();
      setShippingModalOpen(true);
    } else {
      submitStatusChange(orderId, newStatusValue, null, null);
    }
  };

  const submitStatusChange = async (orderId, newStatus, courierName, trackingNumber) => {
    setLoading(true);
    try {
      const response = await orderApi.updateStatus(orderId, {
        orderStatus: newStatus,
        courierName: courierName || null,
        trackingNumber: trackingNumber || null
      });

      if (response.success) {
        message.success('Order status updated successfully');
        const detailsRes = await orderApi.getById(orderId);
        if (detailsRes.success) setSelectedOrder(detailsRes.data);
        fetchOrders();
      } else {
        message.error(response.message || 'Failed to update order status');
      }
    } catch (err) {
      message.error(err.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingModalConfirm = async () => {
    try {
      const values = await shippingForm.validateFields();
      setShippingLoading(true);
      setShippingModalOpen(false);
      await submitStatusChange(
        pendingStatusChange.orderId,
        pendingStatusChange.newStatus,
        values.courierName,
        values.trackingNumber
      );
    } catch (err) {
      // form validation error - stays open
    } finally {
      setShippingLoading(false);
    }
  };

  // Generate and Print Purchase Invoice (Flexbox 1-Page Layout with Fixed Bottom Wrapper)
  const handlePrintInvoice = (order) => {
    if (!order) return;

    const shopName = shopSettings?.shopName || 'ToyVerse Store';
    const motto = shopSettings?.motto || 'Quality Toys & Infinite Joy for Kids';
    const logoUrl = shopSettings?.logoUrl
      ? resolveProductImageUrl(shopSettings.logoUrl)
      : '';
    
    // Shop Address
    const shopAddr1 = shopSettings?.addressLine1 || 'ToyVerse Main Branch';
    const shopAddr2 = shopSettings?.addressLine2 || '';
    const shopCity = shopSettings?.city || 'City Center';
    const shopState = shopSettings?.state || 'State';
    const shopPincode = shopSettings?.pincode || '600001';
    const shopCountry = shopSettings?.country || 'India';
    const fullShopAddress = `${shopAddr1}${shopAddr2 ? ', ' + shopAddr2 : ''}, ${shopCity}, ${shopState} - ${shopPincode}, ${shopCountry}`;

    // Contacts
    const phone1 = shopSettings?.phone1 || '+91 9876543210';
    const phone2 = shopSettings?.phone2 ? `, ${shopSettings.phone2}` : '';
    const phone3 = shopSettings?.phone3 ? `, ${shopSettings.phone3}` : '';
    const allPhones = `${phone1}${phone2}${phone3}`;
    const whatsapp = shopSettings?.whatsAppNumber || phone1;
    const email1 = shopSettings?.email1 || 'support@toyverse.com';
    const email2 = shopSettings?.email2 ? ` | ${shopSettings.email2}` : '';
    const allEmails = `${email1}${email2}`;

    // Legal Identifiers
    const gstNo = shopSettings?.gstNo || '33AAAAA0000A1Z5';
    const regNo = shopSettings?.regNo || 'REG-2026-TOYVERSE';
    const panNo = shopSettings?.panNo || 'ABCDE1234F';

    // Social Links & Business Info
    const fb = shopSettings?.facebookUrl || 'https://facebook.com/toyverse';
    const insta = shopSettings?.instagramUrl || 'https://instagram.com/toyverse';
    const twitter = shopSettings?.twitterUrl || 'https://twitter.com/toyverse';
    const yt = shopSettings?.youTubeUrl || 'https://youtube.com/c/toyverse';
    const openingHours = shopSettings?.openingHours || 'Mon - Sat: 9:00 AM - 8:00 PM';

    // Customer Details
    const customerName = order.customer?.name || order.customerPhone || 'Valued Customer';
    const customerPhone = order.customerPhone || order.customer?.phoneNumber || 'N/A';
    const customerEmail = order.customerEmail || order.customer?.email || 'N/A';

    // Delivery Address
    const shipRecipient = order.address?.fullName || customerName;
    const shipPhone = order.address?.phoneNumber || customerPhone;
    const shipAddr1 = order.address?.addressLine1 || '';
    const shipAddr2 = order.address?.addressLine2 || '';
    const shipCity = order.address?.city || '';
    const shipState = order.address?.state || '';
    const shipPin = order.address?.pincode || '';
    const fullShipAddress = `${shipAddr1}${shipAddr2 ? ', ' + shipAddr2 : ''}, ${shipCity}, ${shipState} - ${shipPin}`;

    const orderDateFormatted = dayjs(order.orderDate).format('DD MMM YYYY, hh:mm A');
    const invoiceDate = dayjs(order.orderDate).format('DD/MM/YYYY');

    // Build Product Rows
    let itemRowsHtml = '';
    let itemsSubtotal = 0;

    (order.items || []).forEach((item, index) => {
      const unitPrice = item.unitPrice || 0;
      const qty = item.quantity || 1;
      const lineTotal = item.totalPrice || (unitPrice * qty);
      itemsSubtotal += lineTotal;

      itemRowsHtml += `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td><strong style="text-transform: uppercase;">${(item.productName || 'Toy Item').toUpperCase()}</strong></td>
          <td style="text-align: center;"><strong>${qty}</strong></td>
          <td style="text-align: right;">₹${unitPrice.toLocaleString('en-IN')}</td>
          <td style="text-align: right; font-weight: 700; color: #111827;">₹${lineTotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    });

    const couponDiscount = order.discountAmount || 0;
    const couponCode = order.couponCode || '';
    const shippingCharge = Math.max(0, (order.totalAmount + couponDiscount) - itemsSubtotal);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice #${order.orderNumber} - ${shopName}</title>
        <style>
          @page { size: A4; margin: 8mm; }
          * { box-sizing: border-box; }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            color: #1f2937;
            background: #fff;
            font-size: 11px;
            line-height: 1.4;
          }
          body { padding: 6px; }

          .invoice-box {
            max-width: 780px;
            min-height: 274mm;
            margin: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .invoice-body {
            flex: 1 0 auto;
          }

          .bottom-wrapper {
            margin-top: auto;
            padding-top: 10px;
          }
          
          /* Header: Clean & Uncongested (Only Logo, Shop Name, Motto & Invoice Info) */
          .header-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 2px solid #0288d1;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .header-table td { vertical-align: middle; }
          .shop-logo-img {
            max-height: 46px;
            max-width: 140px;
            object-fit: contain;
            border-radius: 6px;
          }
          .shop-title {
            font-size: 20px;
            font-weight: 800;
            color: #001529;
            margin: 0;
            letter-spacing: -0.5px;
            line-height: 1.2;
          }
          .shop-motto {
            font-size: 10px;
            color: #0288d1;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 2px;
          }
          
          .invoice-badge-title {
            font-size: 20px;
            font-weight: 900;
            color: #0288d1;
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0;
          }
          .invoice-details-meta {
            text-align: right;
            font-size: 11px;
            margin-top: 4px;
          }
          .status-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .status-paid { background: #dcfce7; color: #15803d; }
          .status-pending { background: #fef3c7; color: #b45309; }
          
          /* Address Cards (Side by Side) */
          .address-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          .address-card {
            width: 48%;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 8px 12px;
            vertical-align: top;
          }
          .address-title {
            font-size: 10px;
            font-weight: 800;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            border-bottom: 1px dashed #e5e7eb;
            padding-bottom: 2px;
          }
          
          /* Products Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          .items-table th {
            background: #001529;
            color: #ffffff;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            padding: 6px 10px;
            text-align: left;
          }
          .items-table td {
            padding: 5px 10px;
            border-bottom: 1px solid #f3f4f6;
            font-size: 11px;
          }
          .items-table tr:nth-child(even) { background: #fafafa; }
          
          /* Summary Table */
          .summary-table {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 12px;
          }
          .summary-table td {
            padding: 4px 8px;
            font-size: 11px;
          }
          .summary-total-row {
            background: #f0fdf4;
            border-top: 2px solid #22c55e;
            font-weight: 800;
          }
          .summary-total-row td {
            font-size: 14px;
            color: #15803d;
            padding: 6px 8px;
          }

          /* Compact Caution & Policy Guidelines (Anchored at Bottom) */
          .caution-box {
            background: #fffbe6;
            border: 1px solid #ffe58f;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 8px;
          }
          .caution-title {
            font-weight: 800;
            color: #d46b08;
            font-size: 10px;
            margin-bottom: 3px;
          }
          .caution-list {
            margin: 0;
            padding-left: 16px;
            font-size: 10px;
            color: #595959;
          }
          .caution-list li { margin-bottom: 2px; }

          /* Compact Thank You Note */
          .thank-you-note {
            text-align: center;
            background: #e6f7ff;
            border: 1px dashed #91d5ff;
            border-radius: 6px;
            padding: 6px;
            font-weight: 700;
            color: #0050b3;
            font-size: 11px;
            margin-bottom: 10px;
          }

          /* Clean, Properly Arranged Footer Section */
          .footer-section {
            border-top: 2px solid #0288d1;
            padding-top: 8px;
            font-size: 10px;
            color: #4b5563;
          }
          .footer-table { width: 100%; border-collapse: collapse; }
          .footer-table td { vertical-align: top; padding: 2px 4px; }
          .footer-header { font-weight: 700; color: #111827; margin-bottom: 3px; font-size: 10px; text-transform: uppercase; }
          .social-link { color: #0288d1; text-decoration: none; font-weight: 600; margin-right: 8px; }
          .footer-notice { text-align: center; margin-top: 4px; font-style: italic; color: #9ca3af; font-size: 9px; }

          @media print {
            html, body { height: 100%; padding: 0; background: #fff; }
            .invoice-box { border: none; padding: 0; min-height: 274mm; height: 100%; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          
          <!-- Top Section (Header, Addresses, Products, Summary) -->
          <div class="invoice-body">
            <!-- Header Table: ONLY Logo, Shop Name, Motto & Invoice Details -->
            <table class="header-table">
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="shop-logo-img" />` : ''}
                    <div>
                      <h1 class="shop-title">${shopName}</h1>
                      <div class="shop-motto">${motto}</div>
                    </div>
                  </div>
                </td>
                <td style="text-align: right;">
                  <h2 class="invoice-badge-title">TAX INVOICE</h2>
                  <div class="invoice-details-meta">
                    <div><strong>Invoice #:</strong> <span style="font-family: monospace; font-size: 12px; font-weight: 700;">${order.orderNumber}</span></div>
                    <div><strong>Order Date:</strong> ${orderDateFormatted}</div>
                    <div><strong>Invoice Date:</strong> ${invoiceDate}</div>
                    <div style="margin-top: 4px;">
                      <span class="status-tag ${order.paymentStatus === 'Success' || order.paymentStatus === 'Paid' ? 'status-paid' : 'status-pending'}">
                        Payment: ${order.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Customer & Shipping Addresses (2 columns) -->
            <table class="address-table">
              <tr>
                <td class="address-card">
                  <div class="address-title">👤 BILLED TO / CUSTOMER DETAILS</div>
                  <div style="font-weight: 800; font-size: 12px; color: #111827;">${customerName}</div>
                  <div><strong>Mobile:</strong> ${customerPhone}</div>
                  <div><strong>Email:</strong> ${customerEmail}</div>
                </td>
                <td style="width: 4%;"></td>
                <td class="address-card">
                  <div class="address-title">🚚 SHIPPED TO / DELIVERY ADDRESS</div>
                  <div style="font-weight: 800; font-size: 12px; color: #111827;">${shipRecipient}</div>
                  <div><strong>Phone:</strong> ${shipPhone}</div>
                  <div>${fullShipAddress}</div>
                </td>
              </tr>
            </table>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 35px; text-align: center;">#</th>
                  <th>Toy Product Description</th>
                  <th style="width: 60px; text-align: center;">Qty</th>
                  <th style="width: 100px; text-align: right;">Unit Price (₹)</th>
                  <th style="width: 110px; text-align: right;">Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHtml}
              </tbody>
            </table>

            <!-- Summary Table -->
            <table class="summary-table">
              <tr>
                <td style="text-align: right;"><strong>Items Subtotal:</strong></td>
                <td style="text-align: right; font-weight: 600;">₹${itemsSubtotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="text-align: right;"><strong>Shipping Charge:</strong></td>
                <td style="text-align: right; color: ${shippingCharge === 0 ? '#15803d' : '#111827'}; font-weight: 600;">
                  ${shippingCharge === 0 ? 'FREE Shipping' : `₹${shippingCharge.toLocaleString('en-IN')}`}
                </td>
              </tr>
              ${couponDiscount > 0 ? `
              <tr style="color: #15803d;">
                <td style="text-align: right;"><strong>Less: Coupon Discount (${couponCode || 'COUPON'}):</strong></td>
                <td style="text-align: right; font-weight: 700; color: #15803d;">- ₹${couponDiscount.toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              <tr class="summary-total-row">
                <td style="text-align: right;">GRAND TOTAL / NET PAYABLE:</td>
                <td style="text-align: right;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <!-- Bottom Wrapper (Anchored Always at Page Bottom) -->
          <div class="bottom-wrapper">
            <!-- Compact Caution & Policy Guidelines -->
            <div class="caution-box">
              <div class="caution-title">⚠️ Customer Guidelines & Return Policy:</div>
              <ul class="caution-list">
                <li><strong>7-Day Replacement:</strong> Toys can be returned/replaced within 7 days of delivery with original intact box.</li>
                <li><strong>Inspection & Video:</strong> Verify package on arrival. Continuous unboxing video required for missing item claims.</li>
              </ul>
            </div>

            <!-- Compact Thank You Note -->
            <div class="thank-you-note">
              🧸 Thank you for shopping with ${shopName}! We hope your little ones enjoy their new toys. ✨
            </div>

            <!-- Clean, Properly Arranged Footer Section -->
            <div class="footer-section">
              <table class="footer-table">
                <tr>
                  <td style="width: 36%;">
                    <div class="footer-header">📍 Store Address</div>
                    <div>${fullShopAddress}</div>
                  </td>
                  <td style="width: 34%;">
                    <div class="footer-header">📞 Contacts & Support</div>
                    <div>Phone: <strong>${allPhones}</strong></div>
                    <div>WhatsApp: <strong>${whatsapp}</strong></div>
                    <div>Email: <strong>${allEmails}</strong></div>
                  </td>
                  <td style="width: 30%; text-align: right;">
                    <div class="footer-header">🏛️ Legal & Social</div>
                    <div>GSTIN: <strong>${gstNo}</strong> | PAN: <strong>${panNo}</strong></div>
                    <div>Hours: <strong>${openingHours}</strong></div>
                    <div style="margin-top: 2px;">
                      ${fb ? `<a href="${fb}" target="_blank" class="social-link">FB</a>` : ''}
                      ${insta ? `<a href="${insta}" target="_blank" class="social-link">Insta</a>` : ''}
                      ${twitter ? `<a href="${twitter}" target="_blank" class="social-link">Twitter</a>` : ''}
                      ${yt ? `<a href="${yt}" target="_blank" class="social-link">YouTube</a>` : ''}
                    </div>
                  </td>
                </tr>
              </table>
              <div class="footer-notice">
                * This is a computer-generated tax invoice. No signature required.
              </div>
            </div>
          </div>

        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(htmlContent);
      printWin.document.close();
    } else {
      message.error('Pop-up blocked! Please allow pop-ups to print invoice.');
    }
  };

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber', render: (text) => <strong>{text}</strong> },
    {
      title: 'Customer',
      key: 'customerName',
      render: (_, r) => r.customer?.name || r.customerPhone || '—'
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>{r.customerPhone || r.customer?.phoneNumber || '—'}</Text>
          {(r.customerEmail || r.customer?.email) && (
            <Text type="secondary" style={{ fontSize: '11px' }}>{r.customerEmail || r.customer?.email}</Text>
          )}
        </Space>
      )
    },
    { title: 'Date', dataIndex: 'orderDate', key: 'orderDate', render: (date) => new Date(date).toLocaleDateString('en-IN') },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => <Tag color={status === 'Success' ? 'green' : status === 'Failed' ? 'red' : 'orange'}>{status}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => <Tag color={STATUS_COLORS[status] || 'default'}>{status}</Tag>
    },
    { title: 'Amount', dataIndex: 'totalAmount', key: 'totalAmount', align: 'right', render: (val) => `₹${val.toLocaleString('en-IN')}` },
    {
      title: 'Actions',
      key: 'actions',
      width: '100px',
      align: 'center',
      render: (_, record) => (
        <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleOpenDetails(record)} style={{ borderRadius: '6px' }}>
          View
        </Button>
      )
    }
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div>
        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Order Management</Title>
      </div>

      {/* Search & Filter Bar */}
      <Card size="small" style={{ borderRadius: '12px', background: '#fafafa', borderColor: '#f0f0f0' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={7}>
            <Input
              placeholder="Search Order #, Customer, Phone..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              value={searchText}
              onChange={(e) => {
                const val = e.target.value;
                setSearchText(val);
                if (!val) {
                  fetchOrders(statusFilter, dateRange, '');
                }
              }}
              onPressEnter={() => fetchOrders(statusFilter, dateRange, searchText)}
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Filter by Status"
              style={{ width: '100%' }}
              allowClear
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                fetchOrders(val, dateRange, searchText);
              }}
            >
              <Option value={0}>Pending</Option>
              <Option value={1}>Paid</Option>
              <Option value={2}>Packed</Option>
              <Option value={3}>Shipped</Option>
              <Option value={4}>Delivered</Option>
              <Option value={5}>Cancelled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={16} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates);
                fetchOrders(statusFilter, dates, searchText);
              }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={8} md={4} style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => fetchOrders(statusFilter, dateRange, searchText)}
              style={{ borderRadius: '6px' }}
            >
              Search
            </Button>
            {(statusFilter !== null || dateRange !== null || searchText) && (
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setStatusFilter(null);
                  setDateRange(null);
                  setSearchText('');
                  fetchOrders(null, null, '');
                }}
                style={{ borderRadius: '6px' }}
              >
                Reset
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 900 }} />

      {/* Discrete Super Admin Master Settings Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '4px' }}>
        <Button 
          type="text" 
          size="small" 
          icon={<ShopOutlined />} 
          onClick={() => navigate('/admin/shop-settings')}
          style={{ color: '#8c8c8c', fontSize: '12px' }}
        >
          ⚙️ Shop Master Settings (Super Admin)
        </Button>
      </div>

      {/* Order Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '28px' }}>
            <Space align="center">
              <EyeOutlined style={{ color: '#1890ff' }} />
              <span>Order Details: <strong style={{ color: '#001529' }}>{selectedOrder?.orderNumber}</strong></span>
            </Space>
            {selectedOrder && (
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={() => handlePrintInvoice(selectedOrder)}
                style={{
                  borderRadius: '6px',
                  background: '#001529',
                  borderColor: '#001529',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Print Invoice
              </Button>
            )}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={780}
        style={{ maxWidth: '95vw' }}
      >
        {selectedOrder && (
          <Space direction="vertical" size={20} style={{ width: '100%', marginTop: '16px' }}>

            {/* Status Change Row */}
            <Card style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: '10px' }} bodyStyle={{ padding: '16px' }}>
              <Row align="middle" justify="space-between" gutter={[16, 16]}>
                <Col>
                  <Space wrap>
                    <Text strong>Order Status:</Text>
                    <Tag color={STATUS_COLORS[selectedOrder.orderStatus] || 'default'} style={{ fontSize: '13px' }}>
                      {selectedOrder.orderStatus}
                    </Tag>
                    <Tag color={selectedOrder.paymentStatus === 'Success' ? 'green' : 'orange'}>
                      Payment: {selectedOrder.paymentStatus}
                    </Tag>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Text strong>Update:</Text>
                    <Select
                      value={STATUS_MAP[selectedOrder.orderStatus]}
                      style={{ width: '160px' }}
                      onChange={(value) => handleStatusChange(selectedOrder.id, value)}
                      loading={loading}
                    >
                      <Option value={0}>Pending</Option>
                      <Option value={1}>Paid</Option>
                      <Option value={2}>Packed</Option>
                      <Option value={3}>🚚 Shipped</Option>
                      <Option value={4}>Delivered</Option>
                      <Option value={5}>Cancelled</Option>
                    </Select>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Shipping Tracking Info (if shipped) */}
            {selectedOrder.courierName && (
              <Card
                style={{ border: '1px solid #b7eb8f', background: '#f6ffed', borderRadius: '10px' }}
                bodyStyle={{ padding: '14px 20px' }}
              >
                <Space size={24}>
                  <TruckOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                  <Space direction="vertical" size={2}>
                    <Text strong style={{ color: '#389e0d' }}>Shipment Information</Text>
                    <Text>Courier: <strong>{selectedOrder.courierName}</strong></Text>
                    <Text>Tracking: <strong style={{ fontFamily: 'monospace' }}>{selectedOrder.trackingNumber}</strong></Text>
                    {selectedOrder.shippedDate && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Shipped on: {new Date(selectedOrder.shippedDate).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </Space>
                </Space>
              </Card>
            )}

            <Row gutter={24}>
              {/* Customer Info */}
              <Col span={12}>
                <Title level={5}>Customer Details</Title>
                <Divider style={{ margin: '8px 0' }} />
                <Space direction="vertical" size={4}>
                  <Text><strong>Name:</strong> {selectedOrder.customer?.name || '—'}</Text>
                  <Text><strong>Phone:</strong> {selectedOrder.customerPhone || selectedOrder.customer?.phoneNumber || '—'}</Text>
                  {(selectedOrder.customerEmail || selectedOrder.customer?.email) && (
                    <Text><strong>Email:</strong> {selectedOrder.customerEmail || selectedOrder.customer?.email}</Text>
                  )}
                  <Text><strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString('en-IN')}</Text>
                </Space>
              </Col>

              {/* Shipping Address */}
              <Col span={12}>
                <Title level={5}>Delivery Address</Title>
                <Divider style={{ margin: '8px 0' }} />
                <Space direction="vertical" size={4}>
                  <Text><strong>Recipient:</strong> {selectedOrder.address?.fullName}</Text>
                  <Text><strong>Phone:</strong> {selectedOrder.address?.phoneNumber}</Text>
                  <Text>{selectedOrder.address?.addressLine1}</Text>
                  {selectedOrder.address?.addressLine2 && <Text>{selectedOrder.address.addressLine2}</Text>}
                  <Text>{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</Text>
                </Space>
              </Col>
            </Row>

            {/* Order Items */}
            <div>
              <Title level={5}>Items Ordered</Title>
              <Divider style={{ margin: '8px 0' }} />
              <Table
                dataSource={selectedOrder.items}
                pagination={false}
                rowKey="productId"
                size="small"
                columns={[
                  { title: 'Toy Product', dataIndex: 'productName', key: 'productName', render: (val) => <Text strong style={{ textTransform: 'uppercase' }}>{val}</Text> },
                  { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center', render: (val) => <Text strong>{val}</Text> },
                  { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right', render: (val) => `₹${val.toLocaleString('en-IN')}` },
                  { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', align: 'right', render: (val) => <Text strong>₹{val.toLocaleString('en-IN')}</Text> },
                ]}
              />
            </div>

            {/* Financial Summary Breakdown */}
            {(() => {
              const modalSubtotal = (selectedOrder.items || []).reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice * i.quantity)), 0);
              const modalDiscount = selectedOrder.discountAmount || 0;
              return (
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px' }}>
                      <Text type="secondary">Items Subtotal:</Text>
                      <Text strong>₹{modalSubtotal.toLocaleString('en-IN')}</Text>
                    </div>
                    {modalDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px' }}>
                        <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                          Less: Coupon Discount ({selectedOrder.couponCode || 'COUPON'}):
                        </Text>
                        <Text strong style={{ color: '#52c41a' }}>
                          - ₹{modalDiscount.toLocaleString('en-IN')}
                        </Text>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px', borderTop: '1px solid #e8e8e8', paddingTop: '6px' }}>
                      <Text strong style={{ fontSize: '15px' }}>Net Total Payable:</Text>
                      <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                        ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })()}

            {isPrintInvoiceEnabled && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '16px' }}>
                <Button
                  type="primary"
                  icon={<PrinterOutlined />}
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  style={{
                    borderRadius: '6px',
                    background: '#001529',
                    borderColor: '#001529',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  Print Invoice
                </Button>
              </div>
            )}

          </Space>
        )}
      </Modal>

      {/* Shipping Details Modal - required when marking as Shipped */}
      <Modal
        title={
          <Space>
            <TruckOutlined style={{ color: '#1890ff' }} />
            <span>Enter Shipping Details</span>
          </Space>
        }
        open={shippingModalOpen}
        onCancel={() => {
          setShippingModalOpen(false);
          setPendingStatusChange(null);
        }}
        confirmLoading={shippingLoading}
        onOk={handleShippingModalConfirm}
        okText={<><SendOutlined /> Mark as Shipped</>}
        okButtonProps={{ style: { background: '#0066cc', borderColor: '#0066cc' } }}
      >
        <div style={{ padding: '8px 0 16px' }}>
          <Text type="secondary">
            To mark this order as <strong>Shipped</strong>, please provide the courier and tracking details.
            These will be visible to the customer.
          </Text>
        </div>
        <Form form={shippingForm} layout="vertical" requiredMark>
          <Form.Item
            name="courierName"
            label="Courier Name"
            rules={[{ required: true, message: 'Please enter the courier name (e.g. DTDC, BlueDart, FedEx)' }]}
          >
            <Input placeholder="e.g. DTDC, BlueDart, FedEx, Delhivery" size="large" />
          </Form.Item>
          <Form.Item
            name="trackingNumber"
            label="Tracking Number"
            rules={[{ required: true, message: 'Please enter the tracking number' }]}
          >
            <Input
              placeholder="e.g. DT1234567890"
              size="large"
              style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default OrderManagement;
