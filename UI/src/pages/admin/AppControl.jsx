import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Form, Input, InputNumber, Switch, Button, Tag, Space, Typography, Row, Col, Alert, message, Spin } from 'antd';
import { TruckOutlined, FileTextOutlined, PercentageOutlined, SaveOutlined, ReloadOutlined, CheckCircleOutlined, InfoCircleOutlined, ToolOutlined } from '@ant-design/icons';
import { shipmentApi } from '../../api/shipmentApi';

const { Title, Text, Paragraph } = Typography;

const AppControl = () => {
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

  const shipmentColumns = [
    {
      title: 'Method & Code',
      dataIndex: 'name',
      key: 'name',
      width: '240px',
      render: (text, record) => (
        <div>
          <Space align="center" size={6}>
            <Text strong style={{ fontSize: '15px' }}>{text}</Text>
            {record.isDefault && <Tag color="blue" style={{ fontSize: '11px' }}>Default</Tag>}
          </Space>
          <div style={{ marginTop: '2px' }}>
            <Tag color="cyan"><code>{record.code}</code></Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Delivery Time Info',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <Form initialValues={{ description: text }} onFinish={(vals) => handleUpdateMethod(record, vals)}>
          <Form.Item name="description" style={{ margin: 0 }}>
            <Input placeholder="e.g. Delivered in 3-5 days" style={{ borderRadius: '6px' }} />
          </Form.Item>
        </Form>
      )
    },
    {
      title: 'Shipment Fee (₹)',
      dataIndex: 'fee',
      key: 'fee',
      width: '150px',
      align: 'right',
      render: (val, record) => (
        <Form initialValues={{ fee: val }} onFinish={(vals) => handleUpdateMethod(record, vals)}>
          <Form.Item name="fee" style={{ margin: 0 }}>
            <InputNumber min={0} prefix="₹" style={{ width: '100%', borderRadius: '6px' }} />
          </Form.Item>
        </Form>
      )
    },
    {
      title: 'Free Shipping Min Order (₹)',
      dataIndex: 'freeShippingThreshold',
      key: 'freeShippingThreshold',
      width: '200px',
      align: 'right',
      render: (val, record) => (
        <Form initialValues={{ freeShippingThreshold: val }} onFinish={(vals) => handleUpdateMethod(record, vals)}>
          <Form.Item name="freeShippingThreshold" style={{ margin: 0 }}>
            <InputNumber min={0} prefix="₹" style={{ width: '100%', borderRadius: '6px' }} placeholder="e.g. 1000" />
          </Form.Item>
        </Form>
      )
    },
    {
      title: 'Active Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '120px',
      align: 'center',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => handleUpdateMethod(record, { isActive: checked })}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      )
    }
  ];

  const tabItems = [
    {
      key: 'shipment',
      label: <span><TruckOutlined /> Shipment Settings</span>,
      children: (
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <Alert
            message="Standard Delivery & Fee Control"
            description="Currently, Standard Delivery is automatically assigned to all customer checkout orders. Shop owners can set standard shipment fees and configure minimum free shipping thresholds (e.g. Free shipping on orders over ₹1000 or ₹500). Express and Superfast methods can be configured here and will be linked with automated country logistics in future updates."
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

                    <Form.Item label="Delivery Time Description" name="description">
                      <Input style={{ borderRadius: '6px' }} />
                    </Form.Item>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item label="Shipping Fee (₹)" name="fee" rules={[{ required: true }]}>
                          <InputNumber min={0} prefix="₹" style={{ width: '100%', borderRadius: '6px' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Free Shipping > (₹)" name="freeShippingThreshold" help="0 = Disabled">
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
                      Save Settings
                    </Button>
                  </Form>
                </Card>
              </Col>
            ))}
          </Row>
        </Space>
      )
    },
    {
      key: 'invoice',
      label: <span><FileTextOutlined /> Invoice Settings</span>,
      children: (
        <Card style={{ borderRadius: '16px', textAlign: 'center', padding: '60px 20px', border: '1px dashed #d9d9d9' }}>
          <Space direction="vertical" size={16}>
            <ToolOutlined style={{ fontSize: '50px', color: '#faad14' }} />
            <Title level={4} style={{ margin: 0 }}>Invoice Settings Module Under Development</Title>
            <Paragraph type="secondary" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '14px' }}>
              Invoice customization, company logo header formatting, automated PDF bill generation, and customer email receipt templates are currently being prepared and will be available in an upcoming release.
            </Paragraph>
            <Tag color="gold" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '6px' }}>
              🚧 Feature Coming Soon
            </Tag>
          </Space>
        </Card>
      )
    },
    {
      key: 'tax',
      label: <span><PercentageOutlined /> Tax Settings</span>,
      children: (
        <Card style={{ borderRadius: '16px', textAlign: 'center', padding: '60px 20px', border: '1px dashed #d9d9d9' }}>
          <Space direction="vertical" size={16}>
            <ToolOutlined style={{ fontSize: '50px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>Tax Settings Module Under Development</Title>
            <Paragraph type="secondary" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '14px' }}>
              GST rate configurations, state-wise IGST / CGST / SGST breakdown rules, tax exemption thresholds, and automated tax reporting tools are currently being designed.
            </Paragraph>
            <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '6px' }}>
              🚧 Feature Coming Soon
            </Tag>
          </Space>
        </Card>
      )
    }
  ];

  if (loading && methods.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" tip="Loading App Control & Shipment Settings..." />
      </div>
    );
  }

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>App Control & Core Settings</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>Configure store shipment methods, free shipping thresholds, invoice policies, and tax rules.</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchShipmentMethods} style={{ borderRadius: '8px' }}>
          Refresh
        </Button>
      </div>

      <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Tabs defaultActiveKey="shipment" items={tabItems} />
      </Card>
    </Space>
  );
};

export default AppControl;
