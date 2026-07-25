import React from 'react';

export const getBadgeThemeClass = (label) => {
  if (!label) return '';
  const clean = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === 'new') return 'badge-theme-new';
  if (clean === 'bestseller') return 'badge-theme-bestseller';
  if (clean === 'popular') return 'badge-theme-popular';
  if (clean === 'limitedstock') return 'badge-theme-limitedstock';
  return 'badge-theme-new';
};

export const getBadgeEmoji = (label) => {
  if (!label) return '✨';
  const clean = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === 'new') return '✨';
  if (clean === 'bestseller') return '🔥';
  if (clean === 'popular') return '⭐';
  if (clean === 'limitedstock') return '⚡';
  return '✨';
};

const ProductBadge = ({ label, style = {} }) => {
  if (!label) return null;

  const themeClass = getBadgeThemeClass(label);
  const emoji = getBadgeEmoji(label);

  return (
    <div className={`shining-product-badge ${themeClass}`} style={style}>
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
};

export default ProductBadge;
