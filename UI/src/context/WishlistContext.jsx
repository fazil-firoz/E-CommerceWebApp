import React, { createContext, useState, useEffect } from 'react';
import { message } from 'antd';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('toyshop_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('toyshop_wishlist', JSON.stringify(wishlistItems));
    } catch (err) {}
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const addToWishlist = (product) => {
    if (!isInWishlist(product.id)) {
      setWishlistItems((prev) => [...prev, product]);
      message.success({
        content: `Added "${product.name}" to your Wishlist ❤️`,
        icon: <span style={{ color: '#ff4d4f' }}>❤️</span>
      });
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    message.info('Removed item from Wishlist');
  };

  const toggleWishlist = (product, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        wishlistCount: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
