import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import wishlistService from '../services/wishlist.service';
import { Alert } from 'react-native';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (user && user.roles?.includes('ROLE_CUSTOMER')) fetchWishlist();
    else setWishlist([]);
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getMyWishlist();
      setWishlist(res.data);
    } catch (e) { console.error('Wishlist fetch error:', e); }
  };

  const addToWishlist = async (artwork) => {
    if (!user) { Alert.alert('Login Required', 'Please login to add to wishlist'); return; }
    try {
      const res = await wishlistService.addToWishlist(artwork.id || artwork._id);
      setWishlist(prev => [...prev, res.data]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await wishlistService.removeFromWishlist(wishlistId);
      setWishlist(prev => prev.filter(i => (i.id || i._id) !== wishlistId));
    } catch (e) { console.error('Remove wishlist error:', e); }
  };

  const moveToCart = async (wishlistItem) => {
    try {
      addToCart(wishlistItem.artwork);
      await removeFromWishlist(wishlistItem.id || wishlistItem._id);
    } catch (e) { console.error('Move to cart error:', e); }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, moveToCart, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
