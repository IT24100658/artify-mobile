import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkService from '../services/artwork.service';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function CatalogScreen({ navigation, route }) {
  const [artworks, setArtworks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState(route?.params?.search || '');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const { isAdmin } = useAuth();

  const categories = ['All', 'Oil Painting', 'Mix Medium', 'Abstract Art', 'Watercolor Art'];
  const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low'];

  useEffect(() => { loadArtworks(); }, []);
  useEffect(() => { filterAndSortArtworks(); }, [search, selectedCategory, sortBy, artworks]);

  const loadArtworks = async () => {
    try { const res = await ArtworkService.getAllArtworks(); setArtworks(res.data); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  const filterAndSortArtworks = () => {
    let result = [...artworks];
    
    // Filter
    if (selectedCategory !== 'All') {
      result = result.filter(a => a.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(a => 
        a.title?.toLowerCase().includes(q) || 
        a.description?.toLowerCase().includes(q) ||
        a.artist?.username?.toLowerCase().includes(q) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    
    // Sort
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFiltered(result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search by name, artist, or tag..." placeholderTextColor={colors.textMuted} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity> : null}
      </View>

      <View style={{ marginTop: 12 }}>
        <FlatList horizontal data={categories} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={i => i} renderItem={({ item }) => (
            <TouchableOpacity style={[styles.catChip, selectedCategory === item && styles.catChipActive]} onPress={() => setSelectedCategory(item)}>
              <Text style={[styles.catChipText, selectedCategory === item && styles.catChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )} />
      </View>

      <View style={{ marginTop: 10, marginBottom: 12 }}>
        <FlatList horizontal data={sortOptions} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={i => i} renderItem={({ item }) => (
            <TouchableOpacity style={[styles.sortChip, sortBy === item && styles.sortChipActive]} onPress={() => setSortBy(item)}>
              <Ionicons name="funnel-outline" size={12} color={sortBy === item ? '#fff' : colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.sortChipText, sortBy === item && styles.sortChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )} />
      </View>

      {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /> : (
        <FlatList data={filtered} numColumns={2} columnWrapperStyle={styles.row} showsVerticalScrollIndicator={false}
          keyExtractor={i => i.id || i._id} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>No artworks found</Text>}
          renderItem={({ item }) => (
            <ArtworkCard artwork={item} onPress={() => navigation.navigate('ArtworkDetail', { id: item.id || item._id })}
              onAddToCart={() => addToCart(item)} onAddToWishlist={() => addToWishlist(item)} showActions={!isAdmin} />
          )} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, marginHorizontal: 16, marginTop: 12, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.textPrimary, paddingVertical: 12, marginLeft: 10, fontSize: 15 },
  catChip: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  catChipTextActive: { color: '#fff' },
  sortChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  sortChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  sortChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  sortChipTextActive: { color: '#fff' },
  row: { justifyContent: 'space-between' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
