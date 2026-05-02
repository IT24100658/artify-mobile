import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import ArtworkCard from '../components/ArtworkCard';
import ArtworkService from '../services/artwork.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [artworks, setArtworks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [artRes, recRes] = await Promise.all([
        ArtworkService.getAllArtworks(),
        ArtworkService.getRecommendations(user?.id),
      ]);
      setArtworks(artRes.data.slice(0, 6));
      setRecommendations(recRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroTitle}>Discover{'\n'}Extraordinary Art</Text>
        <Text style={styles.heroSub}>Curated masterpieces from talented artists</Text>
        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('CatalogTab')}>
          <Text style={styles.heroBtnText}>Browse Collection</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Artworks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CatalogTab')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={artworks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id || i._id}
          renderItem={({ item }) => (
            <View style={{ width: width * 0.44, marginRight: 12 }}>
              <ArtworkCard
                artwork={item}
                onPress={() => navigation.navigate('ArtworkDetail', { id: item.id || item._id })}
                onAddToCart={() => addToCart(item)}
                onAddToWishlist={() => addToWishlist(item)}
                showActions={!isAdmin}
              />
            </View>
          )}
        />
      </View>

      {/* Recommendations */}
      {!isAdmin && recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <FlatList
            data={recommendations}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={i => i.id || i._id}
            renderItem={({ item }) => (
              <View style={{ width: width * 0.44, marginRight: 12 }}>
                <ArtworkCard
                  artwork={item}
                  onPress={() => navigation.navigate('ArtworkDetail', { id: item.id || item._id })}
                  onAddToCart={() => addToCart(item)}
                  onAddToWishlist={() => addToWishlist(item)}
                  showActions={!isAdmin}
                />
              </View>
            )}
          />
        </View>
      )}

      {/* Categories */}
      <View style={[styles.section, { marginBottom: 40 }]}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categories}>
          {['Oil Painting', 'Mix Medium', 'Abstract Art', 'Watercolor Art'].map(cat => (
            <TouchableOpacity key={cat} style={styles.catChip} onPress={() => navigation.navigate('CatalogTab', { search: cat })}>
              <Ionicons name="color-palette-outline" size={16} color={colors.primary} />
              <Text style={styles.catText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  hero: { padding: 28, paddingTop: 60, paddingBottom: 36, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 40 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 8, marginBottom: 20 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, gap: 8 },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: colors.border },
  catText: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
});
