import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import ArtworkService from '../services/artwork.service';

export default function ArtworkUploadScreen({ navigation }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Oil Painting', tags: '', stockQuantity: '1', minStockThreshold: '0' });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleUpload = async () => {
    if (!form.title || !form.price || !image) { Alert.alert('Error', 'Please fill required fields and select an image'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title); fd.append('description', form.description); fd.append('price', form.price);
      fd.append('category', form.category); fd.append('tags', form.tags);
      fd.append('stockQuantity', form.stockQuantity); fd.append('minStockThreshold', form.minStockThreshold);
      fd.append('artistId', user.id);
      fd.append('image', { uri: image.uri, name: 'artwork.jpg', type: 'image/jpeg' });
      await ArtworkService.createArtwork(fd);
      Alert.alert('Success', 'Artwork uploaded!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Upload failed'); }
    setLoading(false);
  };

  const categories = ['Oil Painting', 'Mix Medium', 'Abstract Art', 'Watercolor Art'];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.heading}>Upload Artwork</Text>
      <TouchableOpacity style={s.imagePicker} onPress={pickImage}>
        {image ? <Image source={{ uri: image.uri }} style={s.preview} /> :
          <><Ionicons name="image-outline" size={48} color={colors.textMuted} /><Text style={s.pickText}>Select Image *</Text></>}
      </TouchableOpacity>
      {[{ k: 'title', ph: 'Title *' }, { k: 'description', ph: 'Description', multi: true }, { k: 'price', ph: 'Price (Rs.) *', kb: 'numeric' },
        { k: 'tags', ph: 'Tags (comma separated)' }, { k: 'stockQuantity', ph: 'Stock Quantity', kb: 'numeric' }, { k: 'minStockThreshold', ph: 'Min Stock Threshold', kb: 'numeric' }].map(f => (
        <TextInput key={f.k} style={[s.input, f.multi && { minHeight: 80, textAlignVertical: 'top' }]} value={form[f.k]} onChangeText={v => update(f.k, v)} placeholder={f.ph} placeholderTextColor={colors.textMuted} keyboardType={f.kb || 'default'} multiline={f.multi} />
      ))}
      <Text style={s.label}>Category</Text>
      <View style={s.catRow}>
        {categories.map(c => (
          <TouchableOpacity key={c} style={[s.catChip, form.category === c && s.catActive]} onPress={() => update('category', c)}>
            <Text style={[s.catText, form.category === c && { color: '#fff' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={handleUpload} disabled={loading} style={s.uploadBtn}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={s.gradBtn}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.uploadText}>Upload Artwork</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark }, heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 16 },
  imagePicker: { height: 200, backgroundColor: colors.surface, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  preview: { width: '100%', height: '100%', borderRadius: 16 }, pickText: { color: colors.textMuted, marginTop: 8 },
  input: { backgroundColor: colors.inputBg, color: colors.textPrimary, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12, fontSize: 15 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: { backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  catActive: { backgroundColor: colors.primary, borderColor: colors.primary }, catText: { color: colors.textSecondary, fontSize: 13 },
  uploadBtn: { borderRadius: 14, overflow: 'hidden' },
  gradBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 }, uploadText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
