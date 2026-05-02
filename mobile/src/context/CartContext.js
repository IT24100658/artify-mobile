import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('artify_cart');
      if (saved) setCart(JSON.parse(saved));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('artify_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (artwork) => {
    setCart(prev => {
      const existing = prev.find(i => (i.id || i._id) === (artwork.id || artwork._id));
      if (existing) {
        const newQty = Math.min(existing.quantity + 1, artwork.stockQuantity);
        return prev.map(i => (i.id || i._id) === (artwork.id || artwork._id) ? { ...i, quantity: newQty } : i);
      }
      return [...prev, { ...artwork, quantity: 1 }];
    });
  };

  const removeFromCart = (artworkId) => {
    setCart(prev => prev.filter(i => (i.id || i._id) !== artworkId));
  };

  const updateQuantity = (artworkId, quantity, stockLimit) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(i => (i.id || i._id) === artworkId ? { ...i, quantity: Math.min(quantity, stockLimit) } : i));
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('artify_cart');
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
