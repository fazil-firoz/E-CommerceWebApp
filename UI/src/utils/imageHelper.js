import { URLS } from '../config/urlConfig';

// Resolve full backend URL for relative uploaded paths
const API_BASE_ORIGIN = URLS.BASE_URL.replace('/api', ''); // e.g. https://localhost:53993

/**
 * Resolves a product image path to a full backend URL, supporting size suffixes.
 * @param {string} path - Relative path (e.g. /uploads/products/xyz.webp) or absolute URL.
 * @param {'thumb' | 'medium' | 'large'} size - Requested image size size suffix.
 * @returns {string} Fully resolved image URL or placeholder.
 */
export const resolveProductImageUrl = (path, size = 'large') => {
  if (!path) {
    return 'https://via.placeholder.com/400?text=ToyVerse+Product';
  }

  // If it's already a full HTTP url (for seeded internet URLs), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure relative path has leading slash
  let cleanPath = path;
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  // Remove any existing size suffix to prevent invalid URLs like xyz_thumb_large.webp
  cleanPath = cleanPath
    .replace('_thumb.webp', '.webp')
    .replace('_medium.webp', '.webp')
    .replace('_large.webp', '.webp');

  // Append size suffix if WebP (thumb & medium use resized variants; large/default uses original base image)
  if (cleanPath.endsWith('.webp')) {
    if (size === 'thumb') {
      cleanPath = cleanPath.replace('.webp', '_thumb.webp');
    } else if (size === 'medium') {
      cleanPath = cleanPath.replace('.webp', '_medium.webp');
    }
  }

  return `${API_BASE_ORIGIN}${cleanPath}`;
};
