import React, { useState } from 'react';
import { Card, Form, Input, Switch, Button, Space, Typography, Row, Col, Alert, message, Divider } from 'antd';
import { FileTextOutlined, SaveOutlined, CheckCircleOutlined, InfoCircleOutlined, PrinterOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const InvoiceManagement = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // Store local invoice preferences into localStorage or shop settings
      localStorage.setItem('invoice_settings', JSON.stringify(values));
      message.success('Invoice settings saved successfully!');
    } catch (err) {
      message.error('Failed to save invoice settings');
    } finally {
      setSaving(false);
    }
  };

  const initialValues = JSON.parse(localStorage.getItem('invoice_settings') || '{}') || {
    invoicePrefix: 'INV-2026-',
    companyName: 'ToyShop Wonderland',
    gstin: '32ABCDE1234F1Z5',
    hotline: '+91 98765 43210',
    termsText: 'Thank you for shopping with ToyShop Wonderland! Certified safe toys for kids.',
    showLogo: true,
    autoEmailInvoice: true
  };

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined style={{ color: '#fa8c16' }} /> Invoice Settings
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Customize tax invoice headers, invoice numbering format, terms & conditions, and automated PDF email receipts.
          </Text>
        </div>
      </div>

      <Alert
        message="PDF Tax Invoice & Receipt Control"
        description="Configure details printed on customer order invoices. Changes applied here will reflect on generated sales bills and downloadable order PDFs."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ borderRadius: '12px' }}
      />

      <Card style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSave}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Invoice Serial Number Prefix" name="invoicePrefix" rules={[{ required: true }]}>
                <Input placeholder="e.g. INV-2026-" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Company Header Title" name="companyName" rules={[{ required: true }]}>
                <Input placeholder="e.g. ToyShop Wonderland" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="GSTIN / Tax Number on Invoice" name="gstin">
                <Input placeholder="e.g. 32ABCDE1234F1Z5" style={{ borderRadius: '6px', textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Customer Care Hotline on Invoice" name="hotline">
                <Input placeholder="e.g. +91 98765 43210" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Invoice Footer Terms & Conditions Note" name="termsText">
                <Input.TextArea rows={3} placeholder="Enter terms printed at the bottom of customer invoices" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#fafafa', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Include Store Logo on Invoice</Text>
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>Prints store header logo on generated PDF bill</Text></div>
                </div>
                <Form.Item name="showLogo" valuePropName="checked" noStyle>
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ padding: '16px', borderRadius: '12px', background: '#fafafa', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Auto-Email Invoice PDF to Customer</Text>
                  <div><Text type="secondary" style={{ fontSize: '12px' }}>Sends digital invoice attachment on payment success</Text></div>
                </div>
                <Form.Item name="autoEmailInvoice" valuePropName="checked" noStyle>
                  <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
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
            Save Invoice Settings
          </Button>
        </Form>
      </Card>
    </Space>
  );
};

export default InvoiceManagement;
