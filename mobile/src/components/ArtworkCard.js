import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import StarRating from './StarRating';
import config from '../config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const API_BASE = config.BASE_URL;

const ArtworkCard = ({ artwork, onPress, onAddToCart, onAddToWishlist, showActions = true }) => {
  const imageUri = artwork.imageUrl?.startsWith('http') ? artwork.imageUrl : `${API_BASE}${artwork.imageUrl}`;
  const stockStatus = artwork.stockQuantity <= 0 ? 'Out of Stock' : artwork.stockQuantity <= artwork.minStockThreshold ? 'Low Stock' : 'Available';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.badge}>
        <Text style={[styles.badgeText, { color: stockStatus === 'Available' ? colors.success : stockStatus === 'Low Stock' ? colors.warning : colors.error }]}>
          {stockStatus}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{artwork.title}</Text>
        <Text style={styles.category}>{artwork.category}</Text>
        <Text style={styles.price}>Rs. {artwork.price?.toLocaleString()}</Text>
        {artwork.artist && <Text style={styles.artist}>by {artwork.artist.username || 'Unknown'}</Text>}
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cartBtn} onPress={onAddToCart} disabled={artwork.stockQuantity <= 0}>
              <Ionicons name="cart-outline" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.wishBtn} onPress={onAddToWishlist}>
              <Ionicons name="heart-outline" size={16} color={colors.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: colors.card, borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 4 },
  image: { width: '100%', height: CARD_WIDTH * 1.1, backgroundColor: colors.surface },
  badge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  info: { padding: 10 },
  title: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  category: { color: colors.primary, fontSize: 11, fontWeight: '500', marginBottom: 4 },
  price: { color: colors.gold, fontSize: 15, fontWeight: '800' },
  artist: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
  cartBtn: { backgroundColor: colors.primary, padding: 8, borderRadius: 10 },
  wishBtn: { backgroundColor: colors.surface, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.secondary },
});

export default ArtworkCard;
