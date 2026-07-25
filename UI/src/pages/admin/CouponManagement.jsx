import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Switch, Space, Modal, Form, Input, InputNumber, DatePicker, Typography, Popconfirm, message, Spin, Row, Col, Alert, Statistic } from 'antd';
import { TagOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, InfoCircleOutlined, SearchOutlined, CheckCircleOutlined, StopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { couponApi } from '../../api/couponApi';

const { Title, Text } = Typography;

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponApi.getAll();
      if (res.success) {
        setCoupons(res.data || []);
      } else {
        message.error(res.message || 'Failed to fetch coupon codes');
      }
    } catch (err) {
      message.error('Error loading coupon codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    form.resetFields();
    form.setFieldsValue({
      discountPercentage: 10,
      minPurchaseAmount: 500,
      expiryDate: dayjs().add(30, 'day'),
      isActive: true
    });
    setModalVisible(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      code: record.code,
      discountPercentage: record.discountPercentage,
      minPurchaseAmount: record.minPurchaseAmount,
      expiryDate: dayjs(record.expiryDate),
      isActive: record.isActive
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        code: values.code.trim().toUpperCase(),
        discountPercentage: values.discountPercentage,
        minPurchaseAmount: values.minPurchaseAmount || 0,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : dayjs().add(30, 'day').toISOString(),
        isActive: values.isActive !== undefined ? values.isActive : true
      };

      let res;
      if (editingCoupon) {
        res = await couponApi.update(editingCoupon.id, payload);
      } else {
        res = await couponApi.create(payload);
      }

      if (res.success) {
        message.success(res.message || `Coupon ${editingCoupon ? 'updated' : 'created'} successfully!`);
        setModalVisible(false);
        fetchCoupons();
      } else {
        message.error(res.message || 'Failed to save coupon');
      }
    } catch (err) {
      message.error('Error submitting coupon code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (record, checked) => {
    try {
      const payload = {
        code: record.code,
        discountPercentage: record.discountPercentage,
        minPurchaseAmount: record.minPurchaseAmount,
        expiryDate: record.expiryDate,
        isActive: checked
      };
      const res = await couponApi.update(record.id, payload);
      if (res.success) {
        message.success(`Coupon ${record.code} ${checked ? 'enabled' : 'disabled'}`);
        fetchCoupons();
      } else {
        message.error(res.message || 'Failed to update status');
      }
    } catch (err) {
      message.error('Error changing coupon status');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await couponApi.delete(id);
      if (res.success) {
        message.success('Coupon deleted successfully');
        fetchCoupons();
      } else {
        message.error(res.message || 'Failed to delete coupon');
      }
    } catch (err) {
      message.error('Error deleting coupon');
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const activeCount = coupons.filter(c => c.isActive && dayjs(c.expiryDate).isAfter(dayjs())).length;
  const expiredCount = coupons.filter(c => dayjs(c.expiryDate).isBefore(dayjs())).length;

  const columns = [
    {
      title: 'Coupon Code',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '14px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(114, 46, 209, 0.25)',
          letterSpacing: '0.5px'
        }}>
          🏷️ {code}
        </span>
      )
    },
    {
      title: 'Discount %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      render: (pct) => (
        <span style={{ fontWeight: 800, color: '#52c41a', fontSize: '15px' }}>
          {pct}% OFF
        </span>
      )
    },
    {
      title: 'Min Purchase Amount',
      dataIndex: 'minPurchaseAmount',
      key: 'minPurchaseAmount',
      render: (amt) => amt > 0 ? (
        <Text strong style={{ color: '#1f1f1f' }}>₹{amt.toLocaleString('en-IN')}</Text>
      ) : (
        <Tag color="default" style={{ borderRadius: '6px' }}>No Minimum</Tag>
      )
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => {
        const d = dayjs(date);
        const isExpired = d.isBefore(dayjs());
        return (
          <Space direction="vertical" size={2}>
            <Text style={{ color: isExpired ? '#ff4d4f' : '#262626', fontWeight: isExpired ? 700 : 500 }}>
              {d.format('DD MMM YYYY')}
            </Text>
            {isExpired && <Tag color="error" style={{ borderRadius: '4px' }}>Expired</Tag>}
          </Space>
        );
      }
    },
    {
      title: 'Active Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleToggleActive(record, checked)}
          checkedChildren={<CheckCircleOutlined />}
          unCheckedChildren={<StopOutlined />}
          style={{ background: isActive ? '#52c41a' : undefined }}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: '#1890ff' }} />}
            onClick={() => handleOpenEditModal(record)}
            style={{ fontWeight: 600 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Coupon"
            description={`Are you sure you want to delete coupon '${record.code}'?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #722ed1, #1890ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(114, 46, 209, 0.3)'
          }}>
            <TagOutlined style={{ fontSize: '26px', color: '#fff' }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
              Coupon Code Management
            </Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Create and manage promotional discount coupons, minimum purchase rules, and expiry dates.
            </Text>
          </div>
        </div>

        <Space size={12}>
          <Button icon={<ReloadOutlined />} onClick={fetchCoupons} loading={loading} style={{ borderRadius: '8px', height: '40px' }}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #722ed1, #1890ff)',
              borderColor: 'transparent',
              fontWeight: 700,
              height: '40px',
              padding: '0 20px',
              boxShadow: '0 4px 14px rgba(114, 46, 209, 0.3)'
            }}
          >
            Create Coupon Code
          </Button>
        </Space>
      </div>

      {/* Metrics Summary Bar */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic title="Total Coupons" value={coupons.length} prefix={<TagOutlined style={{ color: '#722ed1' }} />} valueStyle={{ fontWeight: 800, color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card style={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic title="Active & Valid" value={activeCount} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ fontWeight: 800, color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} bodyStyle={{ padding: '16px' }}>
            <Statistic title="Expired Coupons" value={expiredCount} prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ fontWeight: 800, color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Alert
        message="Coupon Discount Logic & Calculation Rule"
        description="Coupon discounts apply to orders meeting the minimum order amount criteria. The discount percentage is calculated on total payable amount after adding shipment charges."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />

      <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
        <div style={{ marginBottom: '20px', maxWidth: '320px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Search coupon codes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ borderRadius: '8px', height: '38px' }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredCoupons}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Add / Edit Coupon Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #722ed1, #1890ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TagOutlined style={{ color: '#fff', fontSize: '18px' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '17px' }}>
              {editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon Code'}
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: '16px' }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: '20px' }}>
          <Form.Item
            label="Coupon Code"
            name="code"
            rules={[
              { required: true, message: 'Please enter coupon code' },
              { pattern: /^[A-Za-z0-9_-]+$/, message: 'Code must be alphanumeric (e.g. WELCOME10)' }
            ]}
          >
            <Input placeholder="e.g. TOYSHOP10" size="large" style={{ textTransform: 'uppercase', borderRadius: '8px', fontWeight: 700, letterSpacing: '1px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Discount Percentage (%)"
                name="discountPercentage"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} max={100} prefix="%" size="large" style={{ width: '100%', borderRadius: '8px' }} placeholder="10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Min Purchase Amount (₹)"
                name="minPurchaseAmount"
                help="0 = No Minimum"
              >
                <InputNumber min={0} prefix="₹" size="large" style={{ width: '100%', borderRadius: '8px' }} placeholder="500" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Expiry Date"
            name="expiryDate"
            rules={[{ required: true, message: 'Please pick an expiry date' }]}
          >
            <DatePicker size="large" style={{ width: '100%', borderRadius: '8px' }} format="DD MMM YYYY" />
          </Form.Item>

          <Form.Item label="Initial Active Status" name="isActive" valuePropName="checked">
            <Switch checkedChildren="ACTIVE" unCheckedChildren="OFF" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '28px' }}>
            <Button onClick={() => setModalVisible(false)} style={{ borderRadius: '8px', height: '40px' }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #722ed1, #1890ff)',
                borderColor: 'transparent',
                fontWeight: 700,
                height: '40px',
                padding: '0 24px',
                boxShadow: '0 4px 14px rgba(114, 46, 209, 0.3)'
              }}
            >
              {editingCoupon ? 'Save Changes' : 'Create Coupon Code'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
};

export default CouponManagement;
