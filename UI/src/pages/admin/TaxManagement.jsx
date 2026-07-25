import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Radio, Switch, Button, Space, Typography, Row, Col, Alert, message, Divider, Tag } from 'antd';
import { PercentageOutlined, SaveOutlined, InfoCircleOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const TaxManagement = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      localStorage.setItem('tax_settings', JSON.stringify(values));
      message.success('Tax settings saved successfully!');
    } catch (err) {
      message.error('Failed to save tax settings');
    } finally {
      setSaving(false);
    }
  };

  const initialValues = JSON.parse(localStorage.getItem('tax_settings') || '{}') || {
    taxRate: 18,
    pricingType: 'inclusive',
    hsnCode: '95030030',
    autoGstSplit: true,
    enableTaxExemption: false
  };

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PercentageOutlined style={{ color: '#52c41a' }} /> Tax Settings
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Configure store GST percentages, tax-inclusive pricing policies, HSN tax codes, and tax breakdown rules.
          </Text>
        </div>
      </div>

      <Alert
        message="GST & Tax Rate Configuration"
        description="Set default GST tax rates for toys catalog. Choose whether store prices include GST or add tax at checkout."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />

      <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSave}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Default Store GST Tax Rate (%)" name="taxRate" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} suffix="%" style={{ width: '100%', borderRadius: '6px' }} placeholder="18" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Default Toys HSN / SAC Code" name="hsnCode" rules={[{ required: true }]}>
                <Input placeholder="e.g. 95030030" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Product Display Price Tax Policy" name="pricingType" rules={[{ required: true }]}>
                <Radio.Group style={{ width: '100%' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ borderRadius: '12px', background: '#fafafa' }}>
                        <Radio value="inclusive">
                          <Text strong>Tax Inclusive (Recommended)</Text>
                          <div><Text type="secondary" style={{ fontSize: '12px' }}>Product price already includes GST. Customers pay exact listed price.</Text></div>
                        </Radio>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ borderRadius: '12px', background: '#fafafa' }}>
                        <Radio value="exclusive">
                          <Text strong>Tax Exclusive</Text>
                          <div><Text type="secondary" style={{ fontSize: '12px' }}>GST tax is calculated and added separately on cart summary.</Text></div>
                        </Radio>
                      </Card>
                    </Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#fafafa', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Automated CGST + SGST vs IGST Split</Text>
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>Auto-calculates intra-state (CGST 9% + SGST 9%) and inter-state (IGST 18%)</Text></div>
                </div>
                <Form.Item name="autoGstSplit" valuePropName="checked" noStyle>
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#fafafa', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Tax Exemption Threshold Rules</Text>
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>Exempt tax on specific low-cost items under ₹100</Text></div>
                </div>
                <Form.Item name="enableTaxExemption" valuePropName="checked" noStyle>
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '24px 0' }} />

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529', height: '40px', padding: '0 24px' }}
          >
            Save Tax Settings
          </Button>
        </Form>
      </Card>
    </Space>
  );
};

export default TaxManagement;
