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

const ProductBadge = ({ label, style = {} }) => {
  if (!label) return null;

  const themeClass = getBadgeThemeClass(label);

  return (
    <div className="corner-ribbon-wrapper" style={style}>
      <div className={`corner-ribbon ${themeClass}`}>
        {label}
      </div>
    </div>
  );
};

export default ProductBadge;
