import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Table, Select, Input, Button, DatePicker, 
  Tag, Space, Statistic, Divider, Alert, Spin, message, Tooltip 
} from 'antd';
import { 
  BarChartOutlined, BoxPlotOutlined, DollarOutlined, ShoppingCartOutlined, 
  SearchOutlined, DownloadOutlined, PrinterOutlined, ReloadOutlined, 
  CalendarOutlined, WarningOutlined, CheckCircleOutlined, InfoCircleOutlined,
  FilterOutlined, ArrowUpOutlined, TagOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { reportApi } from '../../api/reportApi';
import { categoryApi } from '../../api/categoryApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportManagement = () => {
  const [selectedReport, setSelectedReport] = useState('stock'); // 'stock' | 'sales'
  const [categories, setCategories] = useState([]);
  
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
  const [salesSearch, setSalesSearch] = useState('');

  // Load Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
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
    if (selectedReport === 'stock') {
      fetchStockReport();
    } else {
      fetchSalesReport();
    }
  }, [selectedReport]);

  // Export Stock CSV
  const exportStockCSV = () => {
    if (!stockData.items.length) {
      message.warning('No stock data to export');
      return;
    }
    let csv = 'Product ID,Toy Name,Category,MRP (₹),Selling Price (₹),Stock Quantity,Stock Value (₹),Status\n';
    stockData.items.forEach(item => {
      csv += `"${item.id}","${item.name.replace(/"/g, '""')}","${item.categoryName}",${item.mrp},${item.price},${item.stockQuantity},${item.totalStockValue},"${item.stockStatus}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Stock_Report_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Stock report downloaded as CSV');
  };

  // Export Sales CSV
  const exportSalesCSV = () => {
    if (!salesData.items.length) {
      message.warning('No sales data to export');
      return;
    }
    let csv = 'Order #,Date,Customer Name,Phone,Total Items,Payment Status,Order Status,Total Amount (₹)\n';
    salesData.items.forEach(item => {
      const dateStr = dayjs(item.orderDate).format('YYYY-MM-DD HH:mm');
      csv += `"${item.orderNumber}","${dateStr}","${item.customerName.replace(/"/g, '""')}","${item.customerPhone}",${item.totalItems},"${item.paymentStatus}","${item.orderStatus}",${item.totalAmount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Report_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Sales report downloaded as CSV');
  };

  // Print Report
  const handlePrint = () => {
    window.print();
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
      title: 'Product',
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
            <Text strong style={{ display: 'block' }}>{name}</Text>
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
      render: (val) => <Text strong style={{ color: '#52c41a' }}>₹{val.toLocaleString('en-IN')}</Text>
    },
    {
      title: 'Stock Qty',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      align: 'center',
      render: (qty) => (
        <Text strong style={{ fontSize: '15px', color: qty === 0 ? '#ff4d4f' : qty <= 5 ? '#faad14' : '#1890ff' }}>
          {qty}
        </Text>
      )
    },
    {
      title: 'Inventory Value (₹)',
      dataIndex: 'totalStockValue',
      key: 'totalStockValue',
      align: 'right',
      render: (val) => <Text strong style={{ fontSize: '14px' }}>₹{val.toLocaleString('en-IN')}</Text>
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
      render: (num) => <Text strong style={{ color: '#0066cc' }}>{num}</Text>
    },
    {
      title: 'Date & Time',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => dayjs(date).format('DD MMM YYYY, hh:mm A')
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name, record) => (
        <div>
          <Text strong style={{ display: 'block' }}>{name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.customerPhone}</Text>
        </div>
      )
    },
    {
      title: 'Items',
      dataIndex: 'totalItems',
      key: 'totalItems',
      align: 'center',
      render: (qty) => <Tag color="blue">{qty} Items</Tag>
    },
    {
      title: 'Payment',
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
      title: 'Revenue (₹)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (val) => <Text strong style={{ fontSize: '15px', color: '#ff4d4f' }}>₹{val.toLocaleString('en-IN')}</Text>
    }
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Top Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>ToyVerse Reports & Analytics</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>Generate and analyze inventory valuation, low stock alerts, and financial sales performance.</Text>
        </div>
        <Space>
          <Button icon={<PrinterOutlined />} onClick={handlePrint} style={{ borderRadius: '8px' }}>
            Print
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={selectedReport === 'stock' ? exportStockCSV : exportSalesCSV}
            style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529' }}
          >
            Export CSV
          </Button>
        </Space>
      </div>

      <Row gutter={[20, 20]}>
        {/* Left Side Reports Menu Selector */}
        <Col xs={24} md={6}>
          <Card
            title={<Text strong style={{ fontSize: '15px' }}>📋 Available Reports</Text>}
            style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: '12px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <div
                onClick={() => setSelectedReport('stock')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: selectedReport === 'stock' ? '#e6f7ff' : '#ffffff',
                  border: selectedReport === 'stock' ? '1px solid #1890ff' : '1px solid #f0f0f0',
                  transition: 'all 0.2s'
                }}
              >
                <Space align="center" size={12}>
                  <BoxPlotOutlined style={{ fontSize: '22px', color: selectedReport === 'stock' ? '#1890ff' : '#8c8c8c' }} />
                  <div>
                    <Text strong style={{ display: 'block', color: selectedReport === 'stock' ? '#1890ff' : '#262626' }}>
                      Stock / Inventory Report
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Inventory count & valuation</Text>
                  </div>
                </Space>
              </div>

              <div
                onClick={() => setSelectedReport('sales')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: selectedReport === 'sales' ? '#e6f7ff' : '#ffffff',
                  border: selectedReport === 'sales' ? '1px solid #1890ff' : '1px solid #f0f0f0',
                  transition: 'all 0.2s'
                }}
              >
                <Space align="center" size={12}>
                  <BarChartOutlined style={{ fontSize: '22px', color: selectedReport === 'sales' ? '#1890ff' : '#8c8c8c' }} />
                  <div>
                    <Text strong style={{ display: 'block', color: selectedReport === 'sales' ? '#1890ff' : '#262626' }}>
                      Sales & Revenue Report
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Financial sales & order metrics</Text>
                  </div>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Side Main Report View */}
        <Col xs={24} md={18}>
          {selectedReport === 'stock' ? (
            /* 📦 STOCK REPORT */
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
                      title={<Text type="secondary" style={{ fontSize: '12px' }}>Inventory Value</Text>}
                      value={stockData.summary?.totalInventoryValue || 0}
                      precision={2}
                      prefix="₹"
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ borderRadius: '14px', background: '#fff2f0' }}>
                    <Statistic
                      title={<Text type="secondary" style={{ fontSize: '12px' }}>Low / Out of Stock</Text>}
                      value={(stockData.summary?.lowStockCount || 0) + (stockData.summary?.outOfStockCount || 0)}
                      valueStyle={{ color: '#ff4d4f' }}
                      prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Stock Filters Card */}
              <Card style={{ borderRadius: '14px' }}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={8}>
                    <Input
                      placeholder="Search toy or category..."
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
                      <Option value={0}>All Categories</Option>
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
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            </Space>
          ) : (
            /* 📊 SALES REPORT */
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {/* Sales KPI Summary Cards */}
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Card style={{ borderRadius: '14px', background: '#f6ffed' }}>
                    <Statistic
                      title={<Text type="secondary" style={{ fontSize: '12px' }}>Total Revenue</Text>}
                      value={salesData.summary?.totalRevenue || 0}
                      precision={2}
                      prefix="₹"
                      valueStyle={{ color: '#52c41a', fontWeight: 800 }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                    <Statistic
                      title={<Text type="secondary" style={{ fontSize: '12px' }}>Total Orders</Text>}
                      value={salesData.summary?.totalOrders || 0}
                      prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                    <Statistic
                      title={<Text type="secondary" style={{ fontSize: '12px' }}>Avg Order Value (AOV)</Text>}
                      value={salesData.summary?.averageOrderValue || 0}
                      precision={2}
                      prefix="₹"
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card style={{ borderRadius: '14px', background: '#fafafa' }}>
                    <Statistic
                      title={<Text type="secondary" style={{ fontSize: '12px' }}>Items Sold</Text>}
                      value={salesData.summary?.totalItemsSold || 0}
                      prefix={<TagOutlined style={{ color: '#722ed1' }} />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Sales Filters Card */}
              <Card style={{ borderRadius: '14px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {/* Time Presets Row */}
                  <Row gutter={[8, 8]} align="middle">
                    <Col>
                      <Text strong style={{ fontSize: '13px', marginRight: '8px' }}>Period:</Text>
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

                  {/* Range Picker & Filters Row */}
                  <Row gutter={[12, 12]} align="middle">
                    {salesPeriod === 'custom' && (
                      <Col xs={24} sm={10}>
                        <RangePicker
                          value={salesDateRange}
                          onChange={(dates) => setSalesDateRange(dates)}
                          style={{ width: '100%', borderRadius: '8px' }}
                        />
                      </Col>
                    )}
                    <Col xs={24} sm={salesPeriod === 'custom' ? 7 : 10}>
                      <Input
                        placeholder="Search Order # or Customer..."
                        prefix={<SearchOutlined />}
                        value={salesSearch}
                        onChange={(e) => setSalesSearch(e.target.value)}
                        onPressEnter={fetchSalesReport}
                        allowClear
                        style={{ borderRadius: '8px' }}
                      />
                    </Col>
                    <Col xs={12} sm={salesPeriod === 'custom' ? 4 : 8}>
                      <Select
                        value={salesOrderStatus}
                        onChange={(val) => setSalesOrderStatus(val)}
                        style={{ width: '100%', borderRadius: '8px' }}
                      >
                        <Option value="all">All Order Statuses</Option>
                        <Option value="Pending">Pending</Option>
                        <Option value="Processing">Processing</Option>
                        <Option value="Shipped">Shipped</Option>
                        <Option value="Delivered">Delivered</Option>
                        <Option value="Cancelled">Cancelled</Option>
                      </Select>
                    </Col>
                    <Col xs={12} sm={3}>
                      <Button type="primary" icon={<FilterOutlined />} onClick={fetchSalesReport} block style={{ borderRadius: '8px' }}>
                        Apply
                      </Button>
                    </Col>
                  </Row>
                </Space>
              </Card>

              {/* Sales Table */}
              <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Table
                  dataSource={salesData.items}
                  columns={salesColumns}
                  rowKey="orderId"
                  loading={salesLoading}
                  pagination={{ pageSize: 8 }}
                />
              </Card>
            </Space>
          )}
        </Col>
      </Row>
    </Space>
  );
};

export default ReportManagement;
