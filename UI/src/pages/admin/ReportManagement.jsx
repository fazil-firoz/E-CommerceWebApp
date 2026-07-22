import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Table, Select, Input, Button, DatePicker, 
  Tag, Space, Statistic, Divider, Alert, Spin, message, Tabs, Tooltip 
} from 'antd';
import { 
  BarChartOutlined, BoxPlotOutlined, DollarOutlined, ShoppingCartOutlined, 
  SearchOutlined, DownloadOutlined, FilePdfOutlined, ReloadOutlined, 
  CalendarOutlined, WarningOutlined, CheckCircleOutlined, InfoCircleOutlined,
  FilterOutlined, TagOutlined, DownOutlined, UserOutlined, PhoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { reportApi } from '../../api/reportApi';
import { categoryApi } from '../../api/categoryApi';
import { shopApi } from '../../api/shopApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportManagement = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [categories, setCategories] = useState([]);
  const [shopSettings, setShopSettings] = useState(null);
  
  // Stock Report State
  const [stockLoading, setStockLoading] = useState(false);
  const [stockData, setStockData] = useState({ summary: null, items: [] });
  const [stockFilterCategory, setStockFilterCategory] = useState(0);
  const [stockFilterStatus, setStockFilterStatus] = useState('all');
  const [stockSearch, setStockSearch] = useState('');

  // Sales Report State
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesData, setSalesData] = useState({ summary: null, items: [] });
  const [salesPeriod, setSalesPeriod] = useState('all'); // 'daily', 'monthly', 'yearly', 'all', 'custom'
  const [salesDateRange, setSalesDateRange] = useState(null);
  const [salesOrderStatus, setSalesOrderStatus] = useState('all');
  const [salesCustomerName, setSalesCustomerName] = useState('');
  const [salesCustomerPhone, setSalesCustomerPhone] = useState('');
  const [salesSearch, setSalesSearch] = useState('');

  // Fetch Categories & Shop Info
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const catRes = await categoryApi.getAll();
        if (catRes.success) setCategories(catRes.data || []);

        const shopRes = await shopApi.getSettings();
        if (shopRes.success) setShopSettings(shopRes.data);
      } catch (err) {
        console.error('Failed to load initial report settings', err);
      }
    };
    fetchInitial();
  }, []);

  // Fetch Stock Report
  const fetchStockReport = async () => {
    setStockLoading(true);
    try {
      const params = {};
      if (stockFilterCategory > 0) params.categoryId = stockFilterCategory;
      if (stockFilterStatus !== 'all') params.stockStatus = stockFilterStatus;
      if (stockSearch.trim()) params.search = stockSearch.trim();

      const res = await reportApi.getStockReport(params);
      if (res.success && res.data) {
        setStockData({
          summary: res.data,
          items: res.data.items || []
        });
      } else {
        message.error(res.message || 'Failed to fetch stock report');
      }
    } catch (err) {
      message.error('Error generating stock report');
    } finally {
      setStockLoading(false);
    }
  };

  // Fetch Sales Report
  const fetchSalesReport = async () => {
    setSalesLoading(true);
    try {
      const params = {};
      if (salesPeriod !== 'custom') {
        params.periodPreset = salesPeriod;
      } else if (salesDateRange && salesDateRange[0] && salesDateRange[1]) {
        params.startDate = salesDateRange[0].startOf('day').toISOString();
        params.endDate = salesDateRange[1].endOf('day').toISOString();
      }
      if (salesOrderStatus !== 'all') params.orderStatus = salesOrderStatus;
      if (salesCustomerName.trim()) params.customerName = salesCustomerName.trim();
      if (salesCustomerPhone.trim()) params.customerPhone = salesCustomerPhone.trim();
      if (salesSearch.trim()) params.search = salesSearch.trim();

      const res = await reportApi.getSalesReport(params);
      if (res.success && res.data) {
        setSalesData({
          summary: res.data,
          items: res.data.items || []
        });
      } else {
        message.error(res.message || 'Failed to fetch sales report');
      }
    } catch (err) {
      message.error('Error generating sales report');
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStockReport();
    } else {
      fetchSalesReport();
    }
  }, [activeTab]);

  // Export Stock CSV
  const exportStockCSV = () => {
    if (!stockData.items.length) {
      message.warning('No stock data to export');
      return;
    }
    let csv = 'Product ID,Toy Name,Category,MRP (₹),Selling Price (₹),Stock Quantity,Stock Value (₹),Status\n';
    let totalStockQtySum = 0;
    let totalStockValSum = 0;

    stockData.items.forEach(item => {
      totalStockQtySum += item.stockQuantity;
      totalStockValSum += item.totalStockValue;
      csv += `"${item.id}","${item.name.replace(/"/g, '""')}","${item.categoryName}",${item.mrp},${item.price},${item.stockQuantity},${item.totalStockValue},"${item.stockStatus}"\n`;
    });

    // Summary Row
    csv += `\n"TOTAL SUMMARY (${stockData.items.length} Products)","","","","",${totalStockQtySum},${totalStockValSum},"Overall Inventory Valuation"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Stock_Report_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Stock report exported as Excel CSV');
  };

  // Export Sales CSV
  const exportSalesCSV = () => {
    if (!salesData.items.length) {
      message.warning('No sales data to export');
      return;
    }
    let csv = 'Order #,Date,Customer Name,Phone,Total Items,Payment Status,Order Status,Total Amount (₹)\n';
    let totalRevenueSum = 0;
    let totalItemsSum = 0;

    salesData.items.forEach(item => {
      totalRevenueSum += item.totalAmount;
      totalItemsSum += item.totalItems;
      const dateStr = dayjs(item.orderDate).format('YYYY-MM-DD HH:mm');
      csv += `"${item.orderNumber}","${dateStr}","${item.customerName.replace(/"/g, '""')}","${item.customerPhone}",${item.totalItems},"${item.paymentStatus}","${item.orderStatus}",${item.totalAmount}\n`;
    });

    // Summary Row
    csv += `\n"TOTAL SUMMARY (${salesData.items.length} Orders)","","","",${totalItemsSum},"","Sum of Total Revenue",${totalRevenueSum}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Report_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Sales report exported as Excel CSV');
  };

  // PDF Export Function with Header, Logo, Sum of Total Revenue, and Footer
  const exportPDF = (type) => {
    const isStock = type === 'stock';
    const reportTitle = isStock ? 'Stock & Inventory Valuation Report' : 'Sales & Financial Revenue Analytics Report';
    const items = isStock ? stockData.items : salesData.items;

    if (!items.length) {
      message.warning('No report data available to export to PDF');
      return;
    }

    const shopName = shopSettings?.shopName || 'ToyVerse Shop';
    const shopLogo = shopSettings?.logoUrl 
      ? resolveProductImageUrl(shopSettings.logoUrl) 
      : 'https://via.placeholder.com/150?text=ToyVerse';
    const shopAddress = shopSettings?.address || 'ToyVerse Main Branch, City Center';
    const shopPhone = shopSettings?.phone || '+91 9876543210';
    const shopEmail = shopSettings?.email || 'admin@toyverse.com';
    const generatedDate = dayjs().format('DD MMMM YYYY, hh:mm A');

    let totalValuationSum = 0;
    let totalRevenueSum = 0;
    let totalItemsSum = 0;

    if (isStock) {
      items.forEach(i => { totalValuationSum += i.totalStockValue; });
    } else {
      items.forEach(i => { totalRevenueSum += i.totalAmount; totalItemsSum += i.totalItems; });
    }

    let summaryHtml = '';
    if (isStock) {
      const s = stockData.summary || {};
      summaryHtml = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-title">Total Products</span>
            <span class="kpi-value">${s.totalProducts || 0}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Total Stock Units</span>
            <span class="kpi-value">${s.totalStockQuantity || 0}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Total Inventory Valuation</span>
            <span class="kpi-value" style="color: #0066cc;">₹${(s.totalInventoryValue || totalValuationSum).toLocaleString('en-IN')}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Low / Out of Stock</span>
            <span class="kpi-value" style="color: #ff4d4f;">${(s.lowStockCount || 0) + (s.outOfStockCount || 0)}</span>
          </div>
        </div>
      `;
    } else {
      const s = salesData.summary || {};
      summaryHtml = `
        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-title">Total Revenue (Filtered)</span>
            <span class="kpi-value" style="color: #2e7d32;">₹${(totalRevenueSum || s.totalRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Total Orders</span>
            <span class="kpi-value">${items.length}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Average Order Value</span>
            <span class="kpi-value">₹${(items.length > 0 ? Math.round(totalRevenueSum / items.length) : 0).toLocaleString('en-IN')}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">Total Items Sold</span>
            <span class="kpi-value">${totalItemsSum}</span>
          </div>
        </div>
      `;
    }

    let tableHeaders = isStock
      ? '<th>ID</th><th>Toy Name</th><th>Category</th><th>MRP</th><th>Price</th><th>Stock</th><th>Valuation</th><th>Status</th>'
      : '<th>Order #</th><th>Date</th><th>Customer</th><th>Phone</th><th>Items</th><th>Payment</th><th>Status</th><th>Total Revenue</th>';

    let tableRows = '';
    items.forEach((item) => {
      if (isStock) {
        tableRows += `
          <tr>
            <td>#${item.id}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.categoryName}</td>
            <td>₹${item.mrp.toLocaleString('en-IN')}</td>
            <td style="color: #2e7d32; font-weight: 600;">₹${item.price.toLocaleString('en-IN')}</td>
            <td><strong>${item.stockQuantity}</strong></td>
            <td>₹${item.totalStockValue.toLocaleString('en-IN')}</td>
            <td><span class="badge ${item.stockStatus}">${item.stockStatus}</span></td>
          </tr>
        `;
      } else {
        const dateStr = dayjs(item.orderDate).format('DD MMM YYYY, hh:mm A');
        tableRows += `
          <tr>
            <td style="color: #0288d1; font-weight: 700;">${item.orderNumber}</td>
            <td>${dateStr}</td>
            <td><strong>${item.customerName}</strong></td>
            <td>${item.customerPhone}</td>
            <td style="text-align: center;">${item.totalItems}</td>
            <td>${item.paymentStatus}</td>
            <td><span class="badge ${item.orderStatus}">${item.orderStatus}</span></td>
            <td style="color: #d32f2f; font-weight: 700;">₹${item.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        `;
      }
    });

    let tableFooter = '';
    if (isStock) {
      tableFooter = `
        <tr class="total-row">
          <td colspan="6"><strong>TOTAL INVENTORY VALUATION SUM (${items.length} Products)</strong></td>
          <td colspan="2" style="color: #0288d1; font-size: 15px; font-weight: 800;">₹${totalValuationSum.toLocaleString('en-IN')}</td>
        </tr>
      `;
    } else {
      tableFooter = `
        <tr class="total-row">
          <td colspan="4"><strong>TOTAL SUMMARY (${items.length} Orders)</strong></td>
          <td style="text-align: center;"><strong>${totalItemsSum} Items</strong></td>
          <td colspan="2" style="text-align: right;"><strong>SUM OF TOTAL REVENUE:</strong></td>
          <td style="color: #2e7d32; font-size: 16px; font-weight: 800;">₹${totalRevenueSum.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle} - ${shopName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px; color: #262626; background: #fff; }
          .header { display: flex; justify: space-between; align-items: center; border-bottom: 2px solid #1890ff; padding-bottom: 16px; margin-bottom: 20px; }
          .shop-info { display: flex; align-items: center; gap: 16px; }
          .shop-logo { width: 64px; height: 64px; object-fit: contain; border-radius: 8px; border: 1px solid #e8e8e8; }
          .shop-details h1 { margin: 0; font-size: 24px; color: #001529; font-weight: 800; }
          .shop-details p { margin: 2px 0; font-size: 12px; color: #595959; }
          .report-meta { text-align: right; }
          .report-meta h2 { margin: 0; font-size: 18px; color: #1890ff; }
          .report-meta p { margin: 4px 0 0 0; font-size: 11px; color: #8c8c8c; }
          
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px; padding: 12px; text-align: center; }
          .kpi-title { font-size: 11px; color: #8c8c8c; display: block; text-transform: uppercase; }
          .kpi-value { font-size: 18px; font-weight: 800; color: #262626; margin-top: 4px; display: block; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #fafafa; border-bottom: 2px solid #e8e8e8; padding: 10px; text-align: left; font-weight: 700; color: #595959; }
          td { border-bottom: 1px solid #f0f0f0; padding: 10px; }
          tr:nth-child(even) { background: #fcfcfc; }
          .total-row { background: #f6ffed !important; border-top: 2px solid #52c41a; font-weight: bold; }
          .total-row td { padding: 12px 10px; }
          
          .badge { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .InStock { background: #e6f7ff; color: #1890ff; }
          .LowStock { background: #fff7e6; color: #fa8c16; }
          .OutOfStock { background: #fff1f0; color: #f5222d; }
          .Delivered { background: #f6ffed; color: #52c41a; }
          .Cancelled { background: #fff1f0; color: #f5222d; }
          
          .footer { margin-top: 30px; border-top: 1px solid #e8e8e8; padding-top: 12px; text-align: center; font-size: 11px; color: #8c8c8c; }
          @media print {
            body { padding: 0; }
            .kpi-grid { page-break-inside: avoid; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-info">
            <img src="${shopLogo}" alt="Logo" class="shop-logo" />
            <div class="shop-details">
              <h1>${shopName}</h1>
              <p>${shopAddress}</p>
              <p>Phone: ${shopPhone} | Email: ${shopEmail}</p>
            </div>
          </div>
          <div class="report-meta">
            <h2>${reportTitle}</h2>
            <p>Generated: ${generatedDate}</p>
            <p>Status: Confidential Official Document</p>
          </div>
        </div>

        ${summaryHtml}

        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            ${tableFooter}
          </tfoot>
        </table>

        <div class="footer">
          <p>${shopName} E-Commerce Management System &bull; Confidential Report &bull; Page 1 of 1</p>
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
    printWin.document.write(printHtml);
    printWin.document.close();
  };

  // Stock Columns
  const stockColumns = [
    {
      title: 'Toy ID',
      dataIndex: 'id',
      key: 'id',
      width: '80px',
      render: (id) => <Text type="secondary">#{id}</Text>
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space align="center" size={12}>
          <img
            src={resolveProductImageUrl(record.primaryImageUrl, 'thumb')}
            alt={name}
            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0f0f0' }}
          />
          <div>
            <Text strong style={{ display: 'block', fontSize: '14px' }}>{name}</Text>
            <Tag color="blue" style={{ fontSize: '11px', marginTop: '2px' }}>{record.categoryName}</Tag>
          </div>
        </Space>
      )
    },
    {
      title: 'MRP (₹)',
      dataIndex: 'mrp',
      key: 'mrp',
      align: 'right',
      render: (val) => <Text type="secondary">₹{val.toLocaleString('en-IN')}</Text>
    },
    {
      title: 'Selling Price (₹)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (val) => <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>₹{val.toLocaleString('en-IN')}</Text>
    },
    {
      title: 'Stock Qty',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      align: 'center',
      render: (qty) => (
        <Text strong style={{ fontSize: '16px', color: qty === 0 ? '#ff4d4f' : qty <= 5 ? '#faad14' : '#1890ff' }}>
          {qty}
        </Text>
      )
    },
    {
      title: 'Inventory Value (₹)',
      dataIndex: 'totalStockValue',
      key: 'totalStockValue',
      align: 'right',
      render: (val) => <Text strong style={{ fontSize: '15px' }}>₹{val.toLocaleString('en-IN')}</Text>
    },
    {
      title: 'Stock Status',
      dataIndex: 'stockStatus',
      key: 'stockStatus',
      align: 'center',
      render: (status) => {
        if (status === 'OutOfStock') return <Tag color="error">Out of Stock</Tag>;
        if (status === 'LowStock') return <Tag color="warning">Low Stock (&le; 5)</Tag>;
        return <Tag color="success">In Stock</Tag>;
      }
    }
  ];

  // Sales Columns
  const salesColumns = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (num) => <Text strong style={{ color: '#0066cc', fontSize: '14px' }}>{num}</Text>
    },
    {
      title: 'Date & Time',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A')
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name) => <Text strong style={{ fontSize: '14px' }}>{name}</Text>
    },
    {
      title: 'Mobile Number',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      render: (phone) => <Text type="secondary">{phone || 'N/A'}</Text>
    },
    {
      title: 'Items Sold',
      dataIndex: 'totalItems',
      key: 'totalItems',
      align: 'center',
      render: (qty) => <Tag color="blue" style={{ fontWeight: 600 }}>{qty} Items</Tag>
    },
    {
      title: 'Payment Status',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      align: 'center',
      render: (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'completed' || s === 'paid') return <Tag color="success">Paid</Tag>;
        if (s === 'failed') return <Tag color="error">Failed</Tag>;
        return <Tag color="warning">Pending</Tag>;
      }
    },
    {
      title: 'Order Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      align: 'center',
      render: (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'delivered') return <Tag color="success">Delivered</Tag>;
        if (s === 'shipped') return <Tag color="processing">Shipped</Tag>;
        if (s === 'cancelled') return <Tag color="error">Cancelled</Tag>;
        return <Tag color="gold">Pending</Tag>;
      }
    },
    {
      title: 'Total Revenue (₹)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (val) => <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>₹{val.toLocaleString('en-IN')}</Text>
    }
  ];

  // Expanded Order Items Table
  const expandedOrderItemsRender = (record) => {
    const itemColumns = [
      {
        title: 'Item Thumbnail',
        dataIndex: 'primaryImageUrl',
        key: 'primaryImageUrl',
        width: '100px',
        render: (url, item) => (
          <img
            src={resolveProductImageUrl(url, 'thumb')}
            alt={item.productName}
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '6px', border: '1px solid #f0f0f0' }}
          />
        )
      },
      {
        title: 'Toy Name',
        dataIndex: 'productName',
        key: 'productName',
        render: (name) => <Text strong>{name}</Text>
      },
      {
        title: 'Unit Price (₹)',
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        align: 'right',
        render: (val) => `₹${val.toLocaleString('en-IN')}`
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center',
        render: (qty) => <Tag color="cyan">x {qty}</Tag>
      },
      {
        title: 'Subtotal (₹)',
        dataIndex: 'subtotal',
        key: 'subtotal',
        align: 'right',
        render: (val) => <Text strong style={{ color: '#52c41a' }}>₹{val.toLocaleString('en-IN')}</Text>
      }
    ];

    return (
      <Card
        size="small"
        title={<Text strong style={{ fontSize: '13px', color: '#0066cc' }}>📦 Order Items Breakdown ({record.orderNumber})</Text>}
        style={{ borderRadius: '12px', background: '#fafafa', margin: '8px 0' }}
      >
        <Table
          dataSource={record.orderItems || []}
          columns={itemColumns}
          rowKey="productId"
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

  const tabItems = [
    {
      key: 'stock',
      label: <span><BoxPlotOutlined /> Stock / Inventory Report</span>,
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Stock KPI Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Total Products</Text>}
                  value={stockData.summary?.totalProducts || 0}
                  prefix={<BoxPlotOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Total Stock Units</Text>}
                  value={stockData.summary?.totalStockQuantity || 0}
                  prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Total Inventory Valuation</Text>}
                  value={stockData.summary?.totalInventoryValue || 0}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ fontWeight: 800 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#fff2f0' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Low / Out of Stock Alert</Text>}
                  value={(stockData.summary?.lowStockCount || 0) + (stockData.summary?.outOfStockCount || 0)}
                  valueStyle={{ color: '#ff4d4f', fontWeight: 800 }}
                  prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Stock Filters Bar */}
          <Card style={{ borderRadius: '14px' }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={8}>
                <Input
                  placeholder="Search toy name or category..."
                  prefix={<SearchOutlined />}
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  onPressEnter={fetchStockReport}
                  allowClear
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Select
                  value={stockFilterCategory}
                  onChange={(val) => setStockFilterCategory(val)}
                  style={{ width: '100%', borderRadius: '8px' }}
                >
                  <Option value={0}>All Categories (Default)</Option>
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={6}>
                <Select
                  value={stockFilterStatus}
                  onChange={(val) => setStockFilterStatus(val)}
                  style={{ width: '100%', borderRadius: '8px' }}
                >
                  <Option value="all">All Stock Statuses</Option>
                  <Option value="InStock">In Stock</Option>
                  <Option value="LowStock">Low Stock (&le; 5)</Option>
                  <Option value="OutOfStock">Out of Stock</Option>
                </Select>
              </Col>
              <Col xs={24} sm={4}>
                <Button type="primary" icon={<FilterOutlined />} onClick={fetchStockReport} block style={{ borderRadius: '8px' }}>
                  Apply Filter
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Stock Table */}
          <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Table
              dataSource={stockData.items}
              columns={stockColumns}
              rowKey="id"
              loading={stockLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>
      )
    },
    {
      key: 'sales',
      label: <span><BarChartOutlined /> Sales & Revenue Report</span>,
      children: (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Sales KPI Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Sum of Total Revenue</Text>}
                  value={salesData.items.reduce((sum, item) => sum + item.totalAmount, 0)}
                  precision={2}
                  prefix="₹"
                  valueStyle={{ color: '#2e7d32', fontWeight: 800, fontSize: '22px' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Total Orders Placed</Text>}
                  value={salesData.items.length}
                  prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Avg Order Value (AOV)</Text>}
                  value={salesData.items.length > 0 ? Math.round(salesData.items.reduce((sum, item) => sum + item.totalAmount, 0) / salesData.items.length) : 0}
                  precision={2}
                  prefix="₹"
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                <Statistic
                  title={<Text type="secondary" style={{ fontSize: '12px' }}>Total Items Sold</Text>}
                  value={salesData.items.reduce((sum, item) => sum + item.totalItems, 0)}
                  prefix={<TagOutlined style={{ color: '#722ed1' }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* Sales Filters Bar */}
          <Card style={{ borderRadius: '14px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              {/* Time Presets Row */}
              <Row gutter={[8, 8]} align="middle">
                <Col>
                  <Text strong style={{ fontSize: '13px', marginRight: '8px' }}>Period Preset:</Text>
                </Col>
                <Col>
                  <Space wrap>
                    <Button
                      type={salesPeriod === 'all' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => { setSalesPeriod('all'); setSalesDateRange(null); }}
                      style={{ borderRadius: '6px' }}
                    >
                      All Time
                    </Button>
                    <Button
                      type={salesPeriod === 'daily' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => { setSalesPeriod('daily'); setSalesDateRange(null); }}
                      style={{ borderRadius: '6px' }}
                    >
                      Daily (Today)
                    </Button>
                    <Button
                      type={salesPeriod === 'monthly' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => { setSalesPeriod('monthly'); setSalesDateRange(null); }}
                      style={{ borderRadius: '6px' }}
                    >
                      Monthly (This Month)
                    </Button>
                    <Button
                      type={salesPeriod === 'yearly' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => { setSalesPeriod('yearly'); setSalesDateRange(null); }}
                      style={{ borderRadius: '6px' }}
                    >
                      Yearly (This Year)
                    </Button>
                    <Button
                      type={salesPeriod === 'custom' ? 'primary' : 'default'}
                      size="small"
                      onClick={() => setSalesPeriod('custom')}
                      style={{ borderRadius: '6px' }}
                    >
                      Custom Range
                    </Button>
                  </Space>
                </Col>
              </Row>

              {/* Explicit Filter Inputs Row */}
              <Row gutter={[12, 12]} align="middle">
                {salesPeriod === 'custom' && (
                  <Col xs={24} sm={8}>
                    <RangePicker
                      value={salesDateRange}
                      onChange={(dates) => setSalesDateRange(dates)}
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  </Col>
                )}
                <Col xs={24} sm={salesPeriod === 'custom' ? 6 : 6}>
                  <Input
                    placeholder="Customer Name..."
                    prefix={<UserOutlined />}
                    value={salesCustomerName}
                    onChange={(e) => setSalesCustomerName(e.target.value)}
                    onPressEnter={fetchSalesReport}
                    allowClear
                    style={{ borderRadius: '8px' }}
                  />
                </Col>
                <Col xs={24} sm={salesPeriod === 'custom' ? 5 : 5}>
                  <Input
                    placeholder="Mobile Number..."
                    prefix={<PhoneOutlined />}
                    value={salesCustomerPhone}
                    onChange={(e) => setSalesCustomerPhone(e.target.value)}
                    onPressEnter={fetchSalesReport}
                    allowClear
                    style={{ borderRadius: '8px' }}
                  />
                </Col>
                <Col xs={12} sm={salesPeriod === 'custom' ? 3 : 4}>
                  <Select
                    value={salesOrderStatus}
                    onChange={(val) => setSalesOrderStatus(val)}
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    <Option value="all">All Statuses</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="Processing">Processing</Option>
                    <Option value="Shipped">Shipped</Option>
                    <Option value="Delivered">Delivered</Option>
                    <Option value="Cancelled">Cancelled</Option>
                  </Select>
                </Col>
                <Col xs={12} sm={salesPeriod === 'custom' ? 2 : 3}>
                  <Button type="primary" icon={<FilterOutlined />} onClick={fetchSalesReport} block style={{ borderRadius: '8px' }}>
                    Apply
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Sales Table with Expandable Order Items Breakdown & Sum of Total Revenue Summary Row */}
          <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Table
              dataSource={salesData.items}
              columns={salesColumns}
              rowKey="orderId"
              loading={salesLoading}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: expandedOrderItemsRender,
                expandRowByClick: false
              }}
              summary={(pageData) => {
                let totalRevenueSum = 0;
                let totalItemsSum = 0;

                salesData.items.forEach(({ totalAmount, totalItems }) => {
                  totalRevenueSum += totalAmount;
                  totalItemsSum += totalItems;
                });

                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ background: '#f6ffed', fontWeight: 'bold', borderTop: '2px solid #52c41a' }}>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <Text strong style={{ fontSize: '15px', color: '#1b5e20' }}>
                          📊 TOTAL REVENUE SUMMARY ({salesData.items.length} Orders)
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="center">
                        <Tag color="green" style={{ fontSize: '13px', padding: '2px 8px', fontWeight: 700 }}>
                          {totalItemsSum} Items
                        </Tag>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={2} align="right">
                        <Text strong style={{ fontSize: '14px', color: '#2e7d32' }}>Sum of Total Revenue:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <Text strong style={{ fontSize: '18px', color: '#2e7d32' }}>
                          ₹{totalRevenueSum.toLocaleString('en-IN')}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </Card>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>ToyVerse Reports & Analytics</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>Monitor inventory counts, low stock alerts, order items, customer name/phone filters, and revenue totals.</Text>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={activeTab === 'stock' ? exportStockCSV : exportSalesCSV}
            style={{ borderRadius: '8px' }}
          >
            Export Excel (CSV)
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => exportPDF(activeTab)}
            style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529' }}
          >
            Export PDF
          </Button>
        </Space>
      </div>

      {/* Main Full-Width Tabs Container */}
      <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
        />
      </Card>
    </Space>
  );
};

export default ReportManagement;
