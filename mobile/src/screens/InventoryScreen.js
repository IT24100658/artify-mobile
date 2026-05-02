import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import ArtworkService from '../services/artwork.service';
import config from '../config';
const API_BASE = config.BASE_URL;

export default function InventoryScreen({ navigation }) {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await ArtworkService.getAllArtworks(); setArtworks(r.data); } catch (e) {} setLoading(false); };
  const handleDelete = (id, title) => Alert.alert('Delete', `Delete "${title}"?`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await ArtworkService.deleteArtwork(id); load(); } catch (e) { Alert.alert('Error', 'Failed'); } } }]);
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return (
    <View style={s.container}>
      <Text style={s.heading}>Inventory ({artworks.length})</Text>
      <FlatList data={artworks} keyExtractor={i => (i.id || i._id)?.toString()} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Image source={{ uri: item.imageUrl?.startsWith('http') ? item.imageUrl : `${API_BASE}${item.imageUrl}` }} style={s.img} />
            <View style={s.info}>
              <Text style={s.title} numberOfLines={1}>{item.title}</Text>
              <Text style={s.sub}>Stock: {item.stockQuantity} | Rs. {item.price?.toLocaleString()}</Text>
              <Text style={[s.status, { color: item.stockQuantity <= item.minStockThreshold ? colors.warning : colors.success }]}>{item.stockQuantity <= 0 ? 'Out of Stock' : item.stockQuantity <= item.minStockThreshold ? 'Low Stock' : 'Available'}</Text>
            </View>
            <View style={s.actions}>
              <TouchableOpacity onPress={() => navigation.navigate('EditArtwork', { id: item.id || item._id })} style={s.editBtn}><Ionicons name="create-outline" size={18} color={colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id || item._id, item.title)} style={s.delBtn}><Ionicons name="trash-outline" size={18} color={colors.error} /></TouchableOpacity>
            </View>
          </View>
        )} />
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', padding: 16 },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 10, marginBottom: 10, alignItems: 'center' },
  img: { width: 60, height: 60, borderRadius: 10, backgroundColor: colors.surface }, info: { flex: 1, marginLeft: 12 },
  title: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' }, sub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '600', marginTop: 2 }, actions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: colors.surface, padding: 8, borderRadius: 8 }, delBtn: { backgroundColor: colors.surface, padding: 8, borderRadius: 8 },
});
