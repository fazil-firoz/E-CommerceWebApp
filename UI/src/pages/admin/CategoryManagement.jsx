import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryApi } from '../../api/categoryApi';

const { Title } = Typography;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getAll();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingCategory) {
        // Edit category
        const response = await categoryApi.update(editingCategory.id, values);
        if (response.success) {
          message.success('Category updated successfully');
          setModalOpen(false);
          fetchCategories();
        } else {
          message.error(response.message || 'Failed to update category');
        }
      } else {
        // Add category
        const response = await categoryApi.create(values);
        if (response.success) {
          message.success('Category created successfully');
          setModalOpen(false);
          fetchCategories();
        } else {
          message.error(response.message || 'Failed to create category');
        }
      }
    } catch (err) {
      // form validation failed or request failed
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await categoryApi.delete(id);
      if (response.success) {
        message.success('Category soft deleted successfully');
        fetchCategories();
      } else {
        message.error(response.message || 'Failed to delete category');
      }
    } catch (err) {
      message.error(err.message || 'Error deleting category');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: '80px' },
    { title: 'Category Name', dataIndex: 'name', key: 'name', fontWeight: 'bold', render: (text) => <strong>{text}</strong> },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      width: '180px',
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
            title="Are you sure you want to delete this category?"
            description="All products in this category will be preserved but category will be hidden."
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
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Category Management</Title>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleOpenAdd}
          style={{ borderRadius: '8px', background: '#001529', borderColor: '#001529' }}
        >
          Add Category
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add New Category"}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={loading}
        destroyOnClose
        style={{ borderRadius: '16px' }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please input the category name!' }]}
          >
            <Input placeholder="STEM, Board Games, Dolls, etc." />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter category description" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default CategoryManagement;
