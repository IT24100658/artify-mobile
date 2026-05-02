import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import OrderService from '../services/order.service';
import { useAuth } from '../context/AuthContext';

const statusColors = { PENDING: colors.warning, PAID: colors.primary, CONFIRMED: '#2196F3', SHIPPED: '#9C27B0', OUT_FOR_DELIVERY: '#FF9800', DELIVERED: colors.success, CANCELLED: colors.error };

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => { loadOrders(); }, []);
  const loadOrders = async () => {
    try { const res = isAdmin ? await OrderService.getAllOrders() : await OrderService.getCustomerOrders(); setOrders(res.data); }
    catch (e) { console.error(e); } setLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    try { await OrderService.updateOrderStatus(id, status); loadOrders(); Alert.alert('Updated', `Status changed to ${status}`); }
    catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return (
    <View style={s.container}>
      <Text style={s.heading}>{isAdmin ? 'All Orders' : 'My Orders'}</Text>
      <FlatList data={orders} keyExtractor={i => (i.id || i._id)?.toString()} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={s.empty}>No orders yet</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.orderId}>Order #{(item.id || item._id)?.slice(-8)}</Text>
              <View style={[s.statusBadge, { backgroundColor: (statusColors[item.status] || colors.textMuted) + '20' }]}>
                <Text style={[s.statusText, { color: statusColors[item.status] || colors.textMuted }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={s.date}>{new Date(item.orderDate).toLocaleDateString()}</Text>
            <Text style={s.items}>{item.items?.length} item(s)</Text>
            <View style={s.cardFooter}>
              <Text style={s.total}>Rs. {item.totalAmount?.toLocaleString()}</Text>
              {isAdmin && item.status === 'PAID' && (
                <TouchableOpacity style={s.confirmBtn} onPress={() => handleStatusUpdate(item.id || item._id, 'CONFIRMED')}>
                  <Text style={s.confirmText}>Confirm</Text></TouchableOpacity>
              )}
              {isAdmin && item.status === 'CONFIRMED' && (
                <TouchableOpacity style={s.shipBtn} onPress={() => handleStatusUpdate(item.id || item._id, 'SHIPPED')}>
                  <Text style={s.confirmText}>Ship</Text></TouchableOpacity>
              )}
            </View>
            {item.shippingDetails?.estimatedDeliveryDate && (
              <Text style={s.delivery}>Est. Delivery: {new Date(item.shippingDetails.estimatedDeliveryDate).toLocaleDateString()}</Text>
            )}
          </View>
        )} />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', padding: 16 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  items: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  total: { color: colors.gold, fontSize: 16, fontWeight: '800' },
  confirmBtn: { backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  shipBtn: { backgroundColor: '#9C27B0', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  delivery: { color: colors.textSecondary, fontSize: 12, marginTop: 6, fontStyle: 'italic' },
});
