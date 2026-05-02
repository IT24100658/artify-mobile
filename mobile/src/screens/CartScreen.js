import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import { useCart } from '../context/CartContext';
const API_BASE = 'http://192.168.1.177:5000';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  if (!cart.length) return (
    <View style={s.empty}><Ionicons name="cart-outline" size={64} color={colors.textMuted} /><Text style={s.emptyText}>Your cart is empty</Text>
      <TouchableOpacity onPress={() => navigation.navigate('CatalogTab')} style={s.shopBtn}><Text style={s.shopBtnText}>Browse Artworks</Text></TouchableOpacity></View>
  );
  return (
    <View style={s.container}>
      <FlatList data={cart} keyExtractor={i => (i.id || i._id)?.toString()} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => {
          const img = item.imageUrl?.startsWith('http') ? item.imageUrl : `${API_BASE}${item.imageUrl}`;
          return (
            <View style={s.card}>
              <Image source={{ uri: img }} style={s.img} />
              <View style={s.info}>
                <Text style={s.title} numberOfLines={1}>{item.title}</Text>
                <Text style={s.price}>Rs. {item.price?.toLocaleString()}</Text>
                <View style={s.qtyRow}>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.id || item._id, item.quantity - 1, item.stockQuantity)}>
                    <Ionicons name="remove" size={16} color={colors.textPrimary} /></TouchableOpacity>
                  <Text style={s.qty}>{item.quantity}</Text>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.id || item._id, item.quantity + 1, item.stockQuantity)}>
                    <Ionicons name="add" size={16} color={colors.textPrimary} /></TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(item.id || item._id)} style={s.removeBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.error} /></TouchableOpacity>
            </View>
          );
        }} />
      <View style={s.footer}>
        <View><Text style={s.totalLabel}>{cartCount} items</Text><Text style={s.totalPrice}>Rs. {cartTotal.toLocaleString()}</Text></View>
        <TouchableOpacity onPress={() => navigation.navigate('Checkout')} style={s.checkoutBtn}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={s.gradBtn}>
            <Text style={s.checkoutText}>Checkout</Text><Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  empty: { flex: 1, backgroundColor: colors.dark, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 16, marginTop: 12 },
  shopBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 20 },
  shopBtnText: { color: '#fff', fontWeight: '700' },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 12, alignItems: 'center' },
  img: { width: 80, height: 80, borderRadius: 10, backgroundColor: colors.surface },
  info: { flex: 1, marginLeft: 12 },
  title: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  price: { color: colors.gold, fontSize: 14, fontWeight: '700', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
  qtyBtn: { backgroundColor: colors.surface, padding: 6, borderRadius: 8 },
  qty: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 10 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, padding: 16, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  totalLabel: { color: colors.textMuted, fontSize: 12 },
  totalPrice: { color: colors.textPrimary, fontSize: 22, fontWeight: '900' },
  checkoutBtn: { borderRadius: 14, overflow: 'hidden' },
  gradBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, gap: 8, borderRadius: 14 },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
