import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Input, InputNumber, Switch, Button, Tag, Space, Typography, Row, Col, Alert, message, Spin } from 'antd';
import { TruckOutlined, SaveOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { shipmentApi } from '../../api/shipmentApi';

const { Title, Text } = Typography;

const ShipmentManagement = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchShipmentMethods = async () => {
    setLoading(true);
    try {
      const response = await shipmentApi.getAll(true);
      if (response.success) {
        setMethods(response.data || []);
      } else {
        message.error(response.message || 'Failed to fetch shipment methods');
      }
    } catch (err) {
      message.error('Failed to load shipment settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentMethods();
  }, []);

  const handleUpdateMethod = async (record, values) => {
    setUpdatingId(record.id);
    try {
      const payload = {
        id: record.id,
        name: values.name || record.name,
        description: values.description || record.description,
        fee: values.fee !== undefined ? values.fee : record.fee,
        freeShippingThreshold: values.freeShippingThreshold !== undefined ? values.freeShippingThreshold : record.freeShippingThreshold,
        isActive: values.isActive !== undefined ? values.isActive : record.isActive,
        isDefault: record.isDefault
      };

      const response = await shipmentApi.update(record.id, payload);
      if (response.success) {
        message.success(`Updated ${record.name} settings successfully!`);
        fetchShipmentMethods();
      } else {
        message.error(response.message || 'Failed to update shipment method');
      }
    } catch (err) {
      message.error('Error updating shipment method');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && methods.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Loading Shipment Settings..." />
      </div>
    );
  }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TruckOutlined style={{ color: '#1890ff' }} /> Shipment Settings
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Configure store delivery rates, free shipping thresholds, courier partners, and delivery duration notes.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchShipmentMethods} style={{ borderRadius: '8px' }}>
          Refresh
        </Button>
      </div>

      <Alert
        message="Standard Delivery & Fee Control"
        description="Configure delivery charges and minimum order amounts for Free Shipping (e.g. Free shipping on orders over ₹1000). Standard Delivery is assigned automatically during customer checkout."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />

      <Row gutter={[20, 20]}>
        {methods.map((method) => (
          <Col xs={24} lg={8} key={method.id}>
            <Card
              style={{
                borderRadius: '16px',
                borderColor: method.isActive ? '#1890ff' : '#f0f0f0',
                boxShadow: method.isActive ? '0 4px 12px rgba(24, 144, 255, 0.08)' : 'none',
                background: method.isActive ? '#ffffff' : '#fafafa'
              }}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <TruckOutlined style={{ color: method.isActive ? '#1890ff' : '#bfbfbf', fontSize: '18px' }} />
                    <Text strong style={{ fontSize: '16px' }}>{method.name}</Text>
                  </Space>
                  {method.isDefault && <Tag color="blue">Default</Tag>}
                </div>
              }
              extra={
                <Switch
                  checked={method.isActive}
                  onChange={(checked) => handleUpdateMethod(method, { isActive: checked })}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                />
              }
            >
              <Form
                layout="vertical"
                initialValues={{
                  name: method.name,
                  description: method.description,
                  fee: method.fee,
                  freeShippingThreshold: method.freeShippingThreshold
                }}
                onFinish={(values) => handleUpdateMethod(method, values)}
              >
                <Form.Item label="Method Title" name="name" rules={[{ required: true, message: 'Required' }]}>
                  <Input style={{ borderRadius: '6px' }} />
                </Form.Item>

                <Form.Item label="Delivery Duration Note" name="description">
                  <Input style={{ borderRadius: '6px' }} />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Shipping Fee (₹)" name="fee" rules={[{ required: true }]}>
                      <InputNumber min={0} prefix="₹" style={{ width: '100%', borderRadius: '6px' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Free Delivery Above (₹)" name="freeShippingThreshold" help="0 = Disabled">
                      <InputNumber min={0} prefix="₹" style={{ width: '100%', borderRadius: '6px' }} placeholder="1000" />
                    </Form.Item>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updatingId === method.id}
                  block
                  style={{ borderRadius: '8px', marginTop: '8px', background: '#001529', borderColor: '#001529' }}
                >
                  Save Shipment Settings
                </Button>
              </Form>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
};

export default ShipmentManagement;
