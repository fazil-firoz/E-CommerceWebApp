import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Typography, Popconfirm, Tag, Row, Col, message, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { resolveProductImageUrl } from '../../utils/imageHelper';
import { URLS } from '../../config/urlConfig';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getAll({ adminMode: true });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (err) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      message.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFileList([]);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    
    // Map existing product images to Upload file structure
    const existingFiles = (product.imageUrls || []).map((url, index) => ({
      uid: `-${index}`,
      name: url.substring(url.lastIndexOf('/') + 1),
      status: 'done',
      url: resolveProductImageUrl(url, 'thumb'),
      thumbUrl: resolveProductImageUrl(url, 'thumb'),
      response: { success: true, data: [url] } // Backend response mock to match mapping on save
    }));
    setFileList(existingFiles);

    form.setFieldsValue({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      stockQuantity: product.stockQuantity,
      description: product.description,
      isActive: product.isActive
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Extract only image paths from fileList
      const imageUrls = fileList
        .map(file => {
          // If newly uploaded
          if (file.response && file.response.success && file.response.data && file.response.data.length > 0) {
            return file.response.data[0];
          }
          // If already existing, clean to get only relative path (exclude host/port origin)
          if (file.url) {
            const urlStr = file.url;
            if (urlStr.includes('/uploads/products/')) {
              let relativePath = urlStr.substring(urlStr.indexOf('/uploads/products/'));
              // Remove the suffix _thumb, _medium, _large before saving to DB
              relativePath = relativePath
                .replace('_thumb.webp', '.webp')
                .replace('_medium.webp', '.webp')
                .replace('_large.webp', '.webp');
              return relativePath;
            }
            return urlStr; // External seeded URL as-is
          }
          return null;
        })
        .filter(Boolean);

      const parsedPayload = {
        ...values,
        imageUrls: imageUrls
      };

      if (editingProduct) {
        // Edit product
        const response = await productApi.update(editingProduct.id, {
          id: editingProduct.id,
          ...parsedPayload
        });
        if (response.success) {
          message.success('Toy product updated successfully');
          setModalOpen(false);
          fetchProducts();
        } else {
          message.error(response.message || 'Failed to update product');
        }
      } else {
        // Add product
        const response = await productApi.create(parsedPayload);
        if (response.success) {
          message.success('Toy product created successfully');
          setModalOpen(false);
          fetchProducts();
        } else {
          message.error(response.message || 'Failed to create product');
        }
      }
    } catch (err) {
      // Form validation failed
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await productApi.delete(id);
      if (response.success) {
        message.success('Product soft deleted successfully');
        fetchProducts();
      } else {
        message.error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      message.error(err.message || 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Preview',
      dataIndex: 'imageUrls',
      key: 'imageUrls',
      width: '80px',
      render: (urls) => (
        <img
          src={resolveProductImageUrl(urls?.[0], 'thumb')}
          alt="product"
          style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #f0f0f0' }}
        />
      )
    },
    { title: 'Toy Name', dataIndex: 'name', key: 'name', fontWeight: 'bold', render: (text) => <strong>{text}</strong> },
    { title: 'Category', dataIndex: 'categoryName', key: 'categoryName' },
    { title: 'Price', dataIndex: 'price', key: 'price', align: 'right', render: (val) => `₹${val.toLocaleString('en-IN')}` },
    { title: 'Stock', dataIndex: 'stockQuantity', key: 'stockQuantity', align: 'center', render: (val) => <Text strong>{val}</Text> },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '150px',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            onClick={() => handleOpenEdit(record)}
            style={{ borderRadius: '6px' }}
          />
          <Popconfirm
            title="Are you sure you want to delete this toy?"
            description="Toy will be archived and archived from customer pages."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              ghost 
              icon={<DeleteOutlined />} 
              style={{ borderRadius: '6px' }}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Product Management</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleOpenAdd}
          style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529' }}
        >
          Add Toy
        </Button>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingProduct ? "Edit Toy Product" : "Add New Toy Product"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        destroyOnClose
        width={600}
        style={{ borderRadius: '16px' }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          style={{ marginTop: '20px' }}
        >
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item
                name="name"
                label="Toy Name"
                rules={[{ required: true, message: 'Please input the toy name!' }]}
              >
                <Input placeholder="Space Rocket Blocks, Barbie Doll" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="categoryId"
                label="Category"
                rules={[{ required: true, message: 'Select a category!' }]}
              >
                <Select placeholder="Select Category">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price (₹)"
                rules={[{ required: true, message: 'Input price!' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stockQuantity"
                label="Stock Quantity"
                rules={[{ required: true, message: 'Input quantity!' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Form.Item
                name="isActive"
                label="Active Status"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Product Description"
          >
            <Input.TextArea placeholder="Enter description of toy..." rows={3} />
          </Form.Item>

          <Form.Item
            label="Product Images (Maximum 4 images)"
            help="Allowed formats: JPG, JPEG, PNG, WEBP. Max size: 5 MB per image."
          >
            <Upload
              action={`${URLS.BASE_URL}/upload/products`}
              headers={{
                Authorization: `Bearer ${(() => {
                  const adminAuth = localStorage.getItem('admin_auth');
                  return adminAuth ? JSON.parse(adminAuth).token : '';
                })()}`
              }}
              name="files"
              multiple={true}
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList.slice(0, 4))}
              beforeUpload={(file) => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpg';
                const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                const isValidFormat = isJpgOrPng || ['.jpg', '.jpeg', '.png', '.webp'].includes(extension);

                if (!isValidFormat) {
                  message.error(`Format of '${file.name}' is not allowed. Only JPG, JPEG, PNG, WEBP are supported.`);
                  return Upload.LIST_IGNORE;
                }

                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error(`Image '${file.name}' exceeds the 5 MB size limit.`);
                  return Upload.LIST_IGNORE;
                }

                // Check limit client side
                if (fileList.length >= 4) {
                  message.error("Maximum 4 images can be uploaded per product.");
                  return Upload.LIST_IGNORE;
                }

                return true;
              }}
            >
              {fileList.length < 4 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default ProductManagement;
