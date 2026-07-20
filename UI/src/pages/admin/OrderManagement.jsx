import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, Card, Row, Col, Divider, message, DatePicker } from 'antd';
import { EyeOutlined, SendOutlined, TruckOutlined, SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { orderApi } from '../../api/orderApi';

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Shipping modal state
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // { orderId, newStatus }
  const [shippingForm] = Form.useForm();
  const [shippingLoading, setShippingLoading] = useState(false);

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

      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      {/* Order Detail Modal */}
      <Modal
        title={<span><EyeOutlined /> Order Details: <strong>{selectedOrder?.orderNumber}</strong></span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={780}
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
                  { title: 'Toy Product', dataIndex: 'productName', key: 'productName' },
                  { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center', render: (val) => <Text strong>{val}</Text> },
                  { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right', render: (val) => `₹${val.toLocaleString('en-IN')}` },
                  { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', align: 'right', render: (val) => <Text strong>₹{val.toLocaleString('en-IN')}</Text> },
                ]}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Title level={4} style={{ margin: 0 }}>
                Total: <span style={{ color: '#ff4d4f' }}>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </Title>
            </div>

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
