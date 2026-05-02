import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useWishlist } from '../context/WishlistContext';
const API_BASE = 'http://192.168.1.177:5000';

export default function WishlistScreen({ navigation }) {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  if (!wishlist.length) return <View style={s.empty}><Ionicons name="heart-outline" size={64} color={colors.textMuted} /><Text style={s.emptyText}>Your wishlist is empty</Text></View>;
  return (
    <View style={s.container}>
      <Text style={s.heading}>My Wishlist</Text>
      <FlatList data={wishlist} keyExtractor={i => (i.id || i._id)?.toString()} contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const art = item.artwork;
          if (!art) return null;
          const img = art.imageUrl?.startsWith('http') ? art.imageUrl : `${API_BASE}${art.imageUrl}`;
          return (
            <View style={s.card}>
              <TouchableOpacity style={s.cardInner} onPress={() => navigation.navigate('ArtworkDetail', { id: art.id || art._id })}>
                <Image source={{ uri: img }} style={s.img} />
                <View style={s.info}><Text style={s.title} numberOfLines={1}>{art.title}</Text><Text style={s.price}>Rs. {art.price?.toLocaleString()}</Text></View>
              </TouchableOpacity>
              <View style={s.actions}>
                <TouchableOpacity style={s.cartBtn} onPress={() => moveToCart(item)}><Ionicons name="cart-outline" size={18} color="#fff" /></TouchableOpacity>
                <TouchableOpacity style={s.removeBtn} onPress={() => removeFromWishlist(item.id || item._id)}><Ionicons name="trash-outline" size={18} color={colors.error} /></TouchableOpacity>
              </View>
            </View>
          );
        }} />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  empty: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 16, marginTop: 12 },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', padding: 16 },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, marginBottom: 12, overflow: 'hidden', alignItems: 'center' },
  cardInner: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 10 },
  img: { width: 70, height: 70, borderRadius: 10, backgroundColor: colors.surface },
  info: { flex: 1, marginLeft: 12 },
  title: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  price: { color: colors.gold, fontSize: 14, fontWeight: '700', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, paddingRight: 10 },
  cartBtn: { backgroundColor: colors.primary, padding: 10, borderRadius: 10 },
  removeBtn: { backgroundColor: colors.surface, padding: 10, borderRadius: 10 },
});
