import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import colors from '../theme/colors';
import OfferService from '../services/offer.service';
import { useCart } from '../context/CartContext';

export default function MyOffersScreen({ navigation }) {
  const [offers, setOffers] = useState([]); const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  useEffect(() => { (async () => { try { const r = await OfferService.getMyOffers(); setOffers(r.data); } catch (e) {} setLoading(false); })(); }, []);
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return (
    <View style={s.container}><Text style={s.heading}>My Offers</Text>
      <FlatList data={offers} keyExtractor={i => (i.id || i._id)?.toString()} contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={<Text style={s.empty}>No offers made yet</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{item.artwork?.title || 'Artwork'}</Text>
              <Text style={s.price}>Offered: Rs. {item.offeringPrice?.toLocaleString()}</Text>
              <View style={[s.badge, { backgroundColor: item.status === 'ACCEPTED' ? colors.success + '20' : item.status === 'REJECTED' ? colors.error + '20' : colors.warning + '20' }]}>
                <Text style={{ color: item.status === 'ACCEPTED' ? colors.success : item.status === 'REJECTED' ? colors.error : colors.warning, fontWeight: '700', fontSize: 12 }}>{item.status}</Text>
              </View>
              <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {item.status === 'ACCEPTED' && (
              <TouchableOpacity style={s.buyBtn} onPress={() => {
                addToCart({ ...item.artwork, price: item.offeringPrice });
                Alert.alert('Added to Cart', 'Artwork added at your accepted offer price!', [
                  { text: 'Go to Cart', onPress: () => navigation.navigate('CartTab') },
                  { text: 'OK', style: 'cancel' }
                ]);
              }}>
                <Text style={s.buyBtnText}>Buy Now</Text>
              </TouchableOpacity>
            )}
          </View>
        )} /></View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', padding: 16 }, empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' }, price: { color: colors.gold, fontSize: 14, fontWeight: '700', marginTop: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  date: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  buyBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 10 },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
