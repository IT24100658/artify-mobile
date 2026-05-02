import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import ArtworkService from '../services/artwork.service';

export default function EditArtworkScreen({ route, navigation }) {
  const { id } = route.params;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await ArtworkService.getArtworkById(id); const a = r.data; setForm({ title: a.title, description: a.description, price: a.price?.toString(), category: a.category, tags: a.tags?.join(', ') || '', stockQuantity: a.stockQuantity?.toString(), minStockThreshold: a.minStockThreshold?.toString() }); } catch (e) {} setLoading(false); })(); }, [id]);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = async () => {
    try { await ArtworkService.updateArtwork(id, { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity), minStockThreshold: parseInt(form.minStockThreshold), tags: form.tags?.split(',').map(t => t.trim()) }); Alert.alert('Success', 'Artwork updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]); }
    catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
  };
  if (loading || !form) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.heading}>Edit Artwork</Text>
      {[{ k: 'title', ph: 'Title' }, { k: 'description', ph: 'Description', multi: true }, { k: 'price', ph: 'Price', kb: 'numeric' }, { k: 'category', ph: 'Category' }, { k: 'tags', ph: 'Tags (comma separated)' }, { k: 'stockQuantity', ph: 'Stock Quantity', kb: 'numeric' }, { k: 'minStockThreshold', ph: 'Min Stock Threshold', kb: 'numeric' }].map(f => (
        <TextInput key={f.k} style={[s.input, f.multi && { minHeight: 80, textAlignVertical: 'top' }]} value={form[f.k]} onChangeText={v => update(f.k, v)} placeholder={f.ph} placeholderTextColor={colors.textMuted} keyboardType={f.kb || 'default'} multiline={f.multi} />
      ))}
      <TouchableOpacity style={s.saveBtn} onPress={handleSave}><Text style={s.saveBtnText}>Save Changes</Text></TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 16 },
  input: { backgroundColor: colors.inputBg, color: colors.textPrimary, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12, fontSize: 15 },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
