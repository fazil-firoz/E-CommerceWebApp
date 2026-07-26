import React, { createContext, useState, useEffect } from 'react';
import { message } from 'antd';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('toy_shop_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('toy_shop_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, showToast = true) => {
    let messageType = 'success';
    let messageText = `Added "${product.name}" to cart!`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stockQuantity) {
          messageType = 'warning';
          messageText = `Cannot add more. Only ${product.stockQuantity} items available in stock.`;
          return prevItems;
        }
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      if (quantity > product.stockQuantity) {
        messageType = 'warning';
        messageText = `Only ${product.stockQuantity} items available in stock.`;
        return prevItems;
      }

      const mainImageObj = product.images?.find(i => i.isMain) || product.images?.[0];
      const mainImageUrl = mainImageObj?.imageUrl || product.imageUrl || product.imageUrls?.[0] || 'https://via.placeholder.com/200?text=Toy';

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: mainImageUrl,
          imageUrls: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [mainImageUrl],
          quantity,
          stockQuantity: product.stockQuantity,
        },
      ];
    });

    if (showToast) {
      if (messageType === 'warning') {
        message.warning(messageText);
      } else {
        message.success(messageText);
      }
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === productId) {
          if (quantity > item.stockQuantity) {
            message.warning(`Only ${item.stockQuantity} items available in stock.`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('toy_shop_cart');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
