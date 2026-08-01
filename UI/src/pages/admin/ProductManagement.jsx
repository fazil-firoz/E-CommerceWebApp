import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, Typography, Popconfirm, Tag, Row, Col, message, Upload, Slider, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { superAdminApi } from '../../api/superAdminApi';
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isProductBadgeEnabled, setIsProductBadgeEnabled] = useState(true);
  const [form] = Form.useForm();

  const fetchProducts = async (catId = selectedCategory, search = searchText) => {
    setLoading(true);
    try {
      const params = { adminMode: true };
      if (catId) params.categoryId = catId;
      if (search && search.trim()) params.search = search.trim();

      const response = await productApi.getAll(params);
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
    const fetchControls = async () => {
      try {
        const res = await superAdminApi.getControlFlags();
        if (res.success && res.data) {
          setIsProductBadgeEnabled(res.data.isProductBadgeEnabled !== false);
        }
      } catch (err) {}
    };
    fetchControls();

    window.addEventListener('superAdminControlUpdated', fetchControls);
    return () => window.removeEventListener('superAdminControlUpdated', fetchControls);
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
    const imagesSource = product.images && product.images.length > 0
      ? product.images
      : (product.imageUrls || []).map((url, idx) => ({
          imageUrl: url,
          isMain: idx === 0,
          zoomScale: 1.0
        }));

    const existingFiles = imagesSource.map((img, index) => ({
      uid: `-${index}`,
      name: img.imageUrl.substring(img.imageUrl.lastIndexOf('/') + 1),
      status: 'done',
      url: resolveProductImageUrl(img.imageUrl, 'thumb'),
      thumbUrl: resolveProductImageUrl(img.imageUrl, 'thumb'),
      isMain: img.isMain,
      zoomScale: img.zoomScale,
      response: { success: true, data: [img.imageUrl] } // Backend mock response
    }));
    setFileList(existingFiles);

    form.setFieldsValue({
      name: product.name,
      categoryId: product.categoryId,
      mrp: product.mrp || product.price,
      price: product.price,
      stockQuantity: product.stockQuantity,
      description: product.description,
      isActive: product.isActive,
      badgeLabel: product.badgeLabel || undefined
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Check if any files are still uploading
      const stillUploading = fileList.some(f => f.status === 'uploading');
      if (stillUploading) {
        message.warning('Please wait for all images to finish uploading before saving.');
        return;
      }

      // Check for failed uploads
      const failedFiles = fileList.filter(f => f.status === 'error');
      if (failedFiles.length > 0) {
        message.error('Some images failed to upload. Please remove them and try again.');
        return;
      }

      setLoading(true);

      // Extract only image paths from fileList
      const imagesPayload = fileList
        .filter(file => file.status === 'done') // Only include successfully uploaded files
        .map((file) => {
          let url = '';
          if (file.response && file.response.success && file.response.data && file.response.data.length > 0) {
            url = file.response.data[0];
          } else if (file.url) {
            const urlStr = file.url;
            if (urlStr.includes('/uploads/products/')) {
              let relativePath = urlStr.substring(urlStr.indexOf('/uploads/products/'));
              // Remove the suffix _thumb, _medium, _large before saving to DB
              relativePath = relativePath
                .replace('_thumb.webp', '.webp')
                .replace('_medium.webp', '.webp')
                .replace('_large.webp', '.webp');
              url = relativePath;
            } else {
              url = urlStr; // External seeded URL as-is
            }
          }

          if (!url) return null;

          return {
            imageUrl: url,
            isMain: file.isMain || false,
            zoomScale: file.zoomScale || 1.0
          };
        })
        .filter(Boolean);

      // Enforce at least one main image
      if (imagesPayload.length > 0 && !imagesPayload.some(img => img.isMain)) {
        imagesPayload[0].isMain = true;
      }

      const parsedPayload = {
        ...values,
        images: imagesPayload
      };

      console.log('Saving product with payload:', JSON.stringify(parsedPayload, null, 2));

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
      console.error('Save product error:', err);
      if (err?.message) {
        message.error(err.message);
      } else if (err?.errors) {
        message.error(err.errors.join(', '));
      }
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
      dataIndex: 'images',
      key: 'images',
      width: '80px',
      render: (images, record) => {
        // Find main image
        const mainImage = (images && images.length > 0) 
          ? images.find(img => img.isMain) 
          : { imageUrl: record.imageUrls?.[0], zoomScale: 1.0 };
        const previewUrl = mainImage?.imageUrl || record.imageUrls?.[0];
        const zoom = mainImage?.zoomScale || 1.0;

        return (
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #f0f0f0',
            position: 'relative'
          }}>
            <img
              src={resolveProductImageUrl(previewUrl, 'thumb')}
              alt="product"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                transform: `scale(${zoom})`,
                display: 'block' 
              }}
            />
          </div>
        );
      }
    },
    { title: 'Toy Name', dataIndex: 'name', key: 'name', fontWeight: 'bold', render: (text) => <strong>{text}</strong> },
    { title: 'Category', dataIndex: 'categoryName', key: 'categoryName' },
    { 
      title: 'Price (₹)', 
      dataIndex: 'price', 
      key: 'price', 
      align: 'right', 
      render: (val, record) => (
        <div>
          <Text strong style={{ color: '#52c41a' }}>₹{val.toLocaleString('en-IN')}</Text>
          {record.mrp > record.price && (
            <div style={{ fontSize: '11px', color: '#8c8c8c', textDecoration: 'line-through' }}>
              MRP: ₹{record.mrp.toLocaleString('en-IN')}
            </div>
          )}
        </div>
      ) 
    },
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
    // {
    //   title: 'Badge Label',
    //   dataIndex: 'badgeLabel',
    //   key: 'badgeLabel',
    //   align: 'center',
    //   render: (label) => label ? (
    //     <Tag color={label === 'New' ? 'green' : label === 'Best Seller' ? 'orange' : label === 'Popular' ? 'purple' : 'volcano'} style={{ fontWeight: 700 }}>
    //       {label}
    //     </Tag>
    //   ) : (
    //     <Text type="secondary" style={{ fontSize: '12px' }}>—</Text>
    //   )
    // },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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

      {/* Search & Filter Bar */}
      <Card size="small" style={{ borderRadius: '12px', background: '#fafafa', borderColor: '#f0f0f0' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={10} md={9}>
            <Input
              placeholder="Search toy name..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              allowClear
              value={searchText}
              onChange={(e) => {
                const val = e.target.value;
                setSearchText(val);
                if (!val) {
                  fetchProducts(selectedCategory, '');
                }
              }}
              onPressEnter={() => fetchProducts(selectedCategory, searchText)}
            />
          </Col>
          <Col xs={24} sm={10} md={9}>
            <Select
              placeholder="Filter by Category"
              style={{ width: '100%' }}
              allowClear
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                fetchProducts(val, searchText);
              }}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={4} md={6} style={{ display: 'flex', gap: '8px' }}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => fetchProducts(selectedCategory, searchText)}
              style={{ borderRadius: '6px' }}
            >
              Search
            </Button>
            {(selectedCategory !== null || searchText) && (
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchText('');
                  fetchProducts(null, '');
                }}
                style={{ borderRadius: '6px' }}
              >
                Reset
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 850 }}
      />

      <Modal
        title={editingProduct ? "Edit Toy Product" : "Add New Toy Product"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        destroyOnClose
        width={650}
        style={{ borderRadius: '16px', maxWidth: '95vw' }}
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
            <Col span={6}>
              <Form.Item
                name="mrp"
                label="MRP (₹)"
                rules={[{ required: true, message: 'Input MRP!' }]}
                
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="500" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="price"
                label="Real Price (₹)"
                rules={[{ required: true, message: 'Input selling price!' }]}
                
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="299" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="stockQuantity"
                label="Stock Quantity"
                rules={[{ required: true, message: 'Input quantity!' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Form.Item
                name="isActive"
                label="Active Status"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: '-4px', marginBottom: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px', color: '#8c8c8c' }}>
              ℹ️ Note: Prices include all applicable taxes (Price Include tax).
            </Text>
          </div>

          {isProductBadgeEnabled && (
            <Form.Item name="badgeLabel" label="Product Badge / Label (Optional)">
              <Select placeholder="-- Select Badge / Label (Optional) --" allowClear>
                <Option value="New">✨ New</Option>
                <Option value="Best Seller">🔥 Best Seller</Option>
                <Option value="Popular">⭐ Popular</Option>
                <Option value="Limited Stock">⚡ Limited Stock</Option>
              </Select>
            </Form.Item>
          )}

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
              onChange={({ fileList: newFileList }) => {
                // Mutate the original File/RcFile object reference directly to preserve prototypes and uploader methods
                newFileList.forEach((newFile, idx) => {
                  const existing = fileList.find(f => f.uid === newFile.uid);
                  newFile.isMain = existing ? existing.isMain : (fileList.length === 0 && idx === 0);
                  newFile.zoomScale = existing ? existing.zoomScale : 1.0;
                });

                // Auto-flag first one if no main exists
                if (newFileList.length > 0 && !newFileList.some(f => f.isMain)) {
                  newFileList[0].isMain = true;
                }

                setFileList(newFileList.slice(0, 4));
              }}
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

          {/* Interactive Card Presentation Tuning Section */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#262626' }}>
              🖼️ Customize Card Presentation Settings
            </Text>
            {fileList.length === 0 ? (
              <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '13px' }}>
                Upload images above to adjust card display settings.
              </Text>
            ) : (
              <Row gutter={[12, 12]}>
                {fileList.map((file, idx) => {
                  let previewUrl = '';
                  if (file.url) {
                    previewUrl = file.url;
                  } else if (file.response && file.response.success && file.response.data && file.response.data.length > 0) {
                    previewUrl = resolveProductImageUrl(file.response.data[0], 'thumb');
                  } else if (file.thumbUrl) {
                    previewUrl = file.thumbUrl;
                  }

                  const zoom = file.zoomScale || 1.0;
                  const isMain = file.isMain || false;

                  return (
                    <Col span={24} key={file.uid || idx}>
                      <Card 
                        size="small" 
                        style={{ 
                          borderRadius: '12px', 
                          background: isMain ? '#f6ffed' : '#ffffff', 
                          border: isMain ? '1px solid #b7eb8f' : '1px solid #f0f0f0' 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          
                          {/* Live Aspect-Ratio Card Preview Box */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{
                              width: '100px',
                              height: '75px', // Enforces aspect ratio (4:3)
                              borderRadius: '8px',
                              overflow: 'hidden',
                              position: 'relative',
                              border: '1px solid #d9d9d9',
                              background: '#fafafa'
                            }}>
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt="Card preview"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: `scale(${zoom})`,
                                    transition: 'transform 0.1s ease',
                                    display: 'block'
                                  }}
                                />
                              ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', fontSize: '11px' }}>
                                  Uploading...
                                </div>
                              )}
                            </div>
                            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>Card Preview</Text>
                          </div>

                          {/* Control Controls */}
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <Text strong style={{ fontSize: '13px' }}>Image #{idx + 1}</Text>
                              <Button
                                type={isMain ? "primary" : "default"}
                                size="small"
                                style={{ 
                                  borderRadius: '6px', 
                                  fontSize: '12px',
                                  background: isMain ? '#52c41a' : undefined,
                                  borderColor: isMain ? '#52c41a' : undefined
                                }}
                                onClick={() => {
                                  const updated = fileList.map((f, fIdx) => {
                                    f.isMain = fIdx === idx;
                                    return f;
                                  });
                                  setFileList([...updated]);
                                }}
                              >
                                {isMain ? "✓ Card Main Image" : "Set as Main Card"}
                              </Button>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12px', color: '#595959', width: '70px' }}>Card Zoom:</span>
                              <Slider
                                min={1.0}
                                max={2.5}
                                step={0.1}
                                value={zoom}
                                onChange={(val) => {
                                  const updated = [...fileList];
                                  updated[idx].zoomScale = val;
                                  setFileList(updated);
                                }}
                                style={{ flex: 1, margin: '0 8px' }}
                              />
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1890ff', width: '35px', textAlign: 'right' }}>
                                {zoom.toFixed(1)}x
                              </span>
                            </div>
                          </div>

                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        </Form>
      </Modal>
    </Space>
  );
};

export default ProductManagement;
