import React, { useState, useEffect, useRef } from 'react';
import { Input, Tag, Space, Typography, Button } from 'antd';
import { SearchOutlined, ClockCircleOutlined, CloseOutlined, FireOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const STORAGE_KEY = 'recent_product_searches';
const MAX_HISTORY = 6;
const SUGGESTED_SEARCHES = ['RC Car', 'Lego', 'Puzzle', 'Action Figure', 'Doll', 'Board Game'];

const RecentSearchInput = ({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search toys & products...',
  size = 'large',
  style = {},
  maxWidth = '360px'
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Sync internal input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load recent searches', err);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save new search term to history
  const saveSearchTerm = (term) => {
    const trimmed = (term || '').trim();
    if (!trimmed) return;

    try {
      const filtered = recentSearches.filter(
        item => item.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save recent search', err);
    }
  };

  // Remove individual search term
  const handleRemoveTerm = (e, termToRemove) => {
    e.stopPropagation();
    const updated = recentSearches.filter(item => item !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {}
  };

  // Clear all recent search history
  const handleClearAll = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
  };

  // Execute search submission
  const triggerSearch = (searchTerm) => {
    const term = searchTerm !== undefined ? searchTerm : inputValue;
    setInputValue(term);
    setIsOpen(false);
    if (term.trim()) {
      saveSearchTerm(term);
    }
    if (onSearch) {
      onSearch(term);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: maxWidth,
        ...style
      }}
    >
      <Input.Search
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onSearch={(val) => triggerSearch(val)}
        onFocus={() => setIsOpen(true)}
        allowClear
        enterButton={<SearchOutlined />}
        size={size}
        style={{ width: '100%' }}
      />

      {/* Recently Searched Dropdown Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            border: '1px solid #f0f0f0',
            zIndex: 1100,
            padding: '14px 16px',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInDown 0.2s ease-out'
          }}
        >
          {recentSearches.length > 0 ? (
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  paddingBottom: '6px',
                  borderBottom: '1px dashed #f0f0f0'
                }}
              >
                <Space align="center" size={6}>
                  <ClockCircleOutlined style={{ color: '#1890ff', fontSize: '13px' }} />
                  <Text strong style={{ fontSize: '12px', color: '#595959', letterSpacing: '0.2px' }}>
                    RECENTLY SEARCHED
                  </Text>
                </Space>

                <Button
                  type="text"
                  size="small"
                  onClick={handleClearAll}
                  style={{
                    fontSize: '11px',
                    color: '#8c8c8c',
                    padding: '0 4px',
                    height: 'auto'
                  }}
                  icon={<DeleteOutlined style={{ fontSize: '11px' }} />}
                >
                  Clear History
                </Button>
              </div>

              {/* History Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {recentSearches.map((term, index) => (
                  <div
                    key={index}
                    onClick={() => triggerSearch(term)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f7fa')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Space align="center" size={10}>
                      <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: '13px' }} />
                      <Text style={{ fontSize: '13px', color: '#262626', fontWeight: 500 }}>
                        {term}
                      </Text>
                    </Space>

                    <CloseOutlined
                      onClick={(e) => handleRemoveTerm(e, term)}
                      style={{
                        color: '#bfbfbf',
                        fontSize: '11px',
                        padding: '4px',
                        borderRadius: '50%',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4d4f')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#bfbfbf')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Suggested Searches Header */}
              <div style={{ marginBottom: '8px' }}>
                <Space align="center" size={6}>
                  <FireOutlined style={{ color: '#ff4d4f', fontSize: '13px' }} />
                  <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    POPULAR SEARCHES
                  </Text>
                </Space>
              </div>

              {/* Suggested Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SUGGESTED_SEARCHES.map((item, idx) => (
                  <Tag
                    key={idx}
                    onClick={() => triggerSearch(item)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      background: '#fafafa',
                      border: '1px solid #e8e8e8',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1890ff';
                      e.currentTarget.style.color = '#1890ff';
                      e.currentTarget.style.background = '#e6f7ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e8e8e8';
                      e.currentTarget.style.color = 'inherit';
                      e.currentTarget.style.background = '#fafafa';
                    }}
                  >
                    {item}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentSearchInput;
