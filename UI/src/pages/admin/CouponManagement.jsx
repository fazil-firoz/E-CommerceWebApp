import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Switch, Space, Modal, Form, Input, InputNumber, DatePicker, Typography, Popconfirm, message, Spin, Row, Col, Alert } from 'antd';
import { TagOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
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

  const columns = [
    {
      title: 'Coupon Code',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 800, borderRadius: '6px' }}>
          🏷️ {code}
        </Tag>
      )
    },
    {
      title: 'Discount %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      render: (pct) => <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>{pct}% OFF</Text>
    },
    {
      title: 'Min Order Amount',
      dataIndex: 'minPurchaseAmount',
      key: 'minPurchaseAmount',
      render: (amt) => amt > 0 ? <Text>₹{amt.toLocaleString('en-IN')}</Text> : <Tag color="gray">No Minimum</Tag>
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
            <Text style={{ color: isExpired ? '#ff4d4f' : 'inherit' }}>{d.format('DD MMM YYYY')}</Text>
            {isExpired && <Tag color="error">Expired</Tag>}
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
          checkedChildren="ACTIVE"
          unCheckedChildren="OFF"
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
            <Button type="text" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TagOutlined style={{ color: '#722ed1' }} /> Coupon Code Management
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Create and manage promotional discount coupons, minimum purchase rules, and expiry dates.
          </Text>
        </div>

        <Space size={12}>
          <Button icon={<ReloadOutlined />} onClick={fetchCoupons}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAddModal}
            style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #722ed1, #1890ff)', borderColor: 'transparent', fontWeight: 700 }}
          >
            Create Coupon Code
          </Button>
        </Space>
      </div>

      <Alert
        message="Coupon Discount Logic & Calculation Rule"
        description="Coupon discounts apply to orders meeting the minimum order amount criteria. The discount percentage is calculated on total payable amount after adding shipment charges."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />

      <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: '16px', maxWidth: '300px' }}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Search coupon codes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ borderRadius: '8px' }}
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
          <span style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TagOutlined style={{ color: '#722ed1' }} /> {editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon Code'}
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: '16px' }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: '16px' }}>
          <Form.Item
            label="Coupon Code"
            name="code"
            rules={[
              { required: true, message: 'Please enter coupon code' },
              { pattern: /^[A-Za-z0-9_-]+$/, message: 'Code must be alphanumeric (e.g. WELCOME10)' }
            ]}
          >
            <Input placeholder="e.g. TOYSHOP10" style={{ textTransform: 'uppercase', borderRadius: '6px', fontWeight: 700 }} />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Discount Percentage (%)"
                name="discountPercentage"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} max={100} prefix="%" style={{ width: '100%', borderRadius: '6px' }} placeholder="10" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Min Purchase Amount (₹)"
                name="minPurchaseAmount"
                help="e.g. 500 (0 = No Minimum)"
              >
                <InputNumber min={0} prefix="₹" style={{ width: '100%', borderRadius: '6px' }} placeholder="500" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Expiry Date"
            name="expiryDate"
            rules={[{ required: true, message: 'Please pick an expiry date' }]}
          >
            <DatePicker style={{ width: '100%', borderRadius: '6px' }} format="DD MMM YYYY" />
          </Form.Item>

          <Form.Item label="Initial Status" name="isActive" valuePropName="checked">
            <Switch checkedChildren="ACTIVE" unCheckedChildren="OFF" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #722ed1, #1890ff)', borderColor: 'transparent', fontWeight: 700 }}
            >
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Space>
  );
};

export default CouponManagement;
