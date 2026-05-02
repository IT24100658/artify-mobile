import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import OfferService from '../services/offer.service';

export default function OfferManagementScreen() {
  const [offers, setOffers] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await OfferService.getAllOffers(); setOffers(r.data); } catch (e) {} setLoading(false); };
  const updateStatus = async (id, status) => { try { await OfferService.updateOfferStatus(id, status); load(); Alert.alert('Updated', `Offer ${status.toLowerCase()}`); } catch (e) { Alert.alert('Error', 'Failed'); } };
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return (
    <View style={s.container}><Text style={s.heading}>Manage Offers</Text>
      <FlatList data={offers} keyExtractor={i => (i.id || i._id)?.toString()} contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={s.empty}>No offers</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.title}>{item.artwork?.title || 'Artwork'}</Text>
            <Text style={s.sub}>By: {item.customer?.username} → Rs. {item.offeringPrice?.toLocaleString()}</Text>
            <View style={[s.badge, { backgroundColor: item.status === 'ACCEPTED' ? colors.success + '20' : item.status === 'REJECTED' ? colors.error + '20' : colors.warning + '20' }]}>
              <Text style={{ color: item.status === 'ACCEPTED' ? colors.success : item.status === 'REJECTED' ? colors.error : colors.warning, fontWeight: '700', fontSize: 11 }}>{item.status}</Text></View>
            {item.status === 'PENDING' && <View style={s.actions}>
              <TouchableOpacity style={s.acceptBtn} onPress={() => updateStatus(item.id || item._id, 'ACCEPTED')}><Text style={s.btnText}>Accept</Text></TouchableOpacity>
              <TouchableOpacity style={s.rejectBtn} onPress={() => updateStatus(item.id || item._id, 'REJECTED')}><Text style={s.btnText}>Reject</Text></TouchableOpacity>
            </View>}
          </View>
        )} /></View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', padding: 16 }, empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10 },
  title: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' }, sub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  acceptBtn: { flex: 1, backgroundColor: colors.success, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  rejectBtn: { flex: 1, backgroundColor: colors.error, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
