import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import StarRating from '../components/StarRating';
import ReviewList from '../components/ReviewList';
import ArtworkService from '../services/artwork.service';
import ReviewService from '../services/review.service';
import OfferService from '../services/offer.service';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import config from '../config';

const { width } = Dimensions.get('window');
const API_BASE = config.BASE_URL;

export default function ArtworkDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [artwork, setArtwork] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [showOffer, setShowOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const { user, isCustomer, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [artRes, revRes, avgRes] = await Promise.all([
        ArtworkService.getArtworkById(id), ReviewService.getArtworkReviews(id), ReviewService.getAverageRating(id),
      ]);
      setArtwork(artRes.data);
      setReviews(revRes.data);
      setAvgRating(avgRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review._id || review.id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await ReviewService.deleteReview(reviewId);
          loadData();
          Alert.alert('Success', 'Review deleted');
        } catch(e) { Alert.alert('Error', 'Failed to delete review'); }
      }}
    ]);
  };

  const handleAddReview = async () => {
    if (!reviewComment.trim()) { Alert.alert('Error', 'Please write a comment'); return; }
    try {
      if (editingReviewId) {
        await ReviewService.updateReview(editingReviewId, reviewRating, reviewComment);
        setEditingReviewId(null);
        Alert.alert('Success', 'Review updated!');
      } else {
        await ReviewService.postReview(id, reviewRating, reviewComment, null);
        Alert.alert('Success', 'Review posted!');
      }
      setReviewComment(''); setReviewRating(5); loadData();
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed to save review'); }
  };

  const handleMakeOffer = async () => {
    if (!offerPrice || parseFloat(offerPrice) <= 0) { Alert.alert('Error', 'Enter a valid price'); return; }
    try {
      await OfferService.createOffer({
        artwork: { id: artwork.id || artwork._id },
        customer: { id: user.id },
        artist: { id: artwork.artist?.id || artwork.artist?._id || artwork.artist },
        offeringPrice: parseFloat(offerPrice),
      });
      setShowOffer(false); setOfferPrice('');
      Alert.alert('Success', 'Your offer has been submitted!');
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed to submit offer'); }
  };

  if (loading || !artwork) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const imageUri = artwork.imageUrl?.startsWith('http') ? artwork.imageUrl : `${API_BASE}${artwork.imageUrl}`;
  const inStock = artwork.stockQuantity > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{artwork.title}</Text>
          <Text style={styles.price}>Rs. {artwork.price?.toLocaleString()}</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingWrap}>
            <StarRating rating={avgRating} size={16} />
            <Text style={styles.ratingText}>({reviews.length})</Text>
          </View>
          <View style={[styles.stockBadge, { backgroundColor: inStock ? 'rgba(76,175,80,0.15)' : 'rgba(255,82,82,0.15)' }]}>
            <Text style={[styles.stockText, { color: inStock ? colors.success : colors.error }]}>
              {inStock ? `${artwork.stockQuantity} in stock` : 'Out of Stock'}
            </Text>
          </View>
        </View>

        {artwork.category ? <Text style={styles.category}>{artwork.category}</Text> : null}
        {artwork.artist?.username ? <Text style={styles.artist}>Artist: {artwork.artist.username}</Text> : null}
        <Text style={styles.description}>{artwork.description}</Text>

        {artwork.tags?.length > 0 && (
          <View style={styles.tagsRow}>{artwork.tags.map(t => <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>)}</View>
        )}

        {/* Actions - Hidden for Admin */}
        {!isAdmin && (
          <>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.cartBtn, !inStock && { opacity: 0.4 }]} disabled={!inStock} onPress={() => { addToCart(artwork); Alert.alert('Added', 'Added to cart!'); }}>
                <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.gradientBtn}>
                  <Ionicons name="cart" size={20} color="#fff" />
                  <Text style={styles.cartBtnText}>Add to Cart</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.wishBtn} onPress={() => { addToWishlist(artwork); Alert.alert('Added', 'Added to wishlist!'); }}>
                <Ionicons name="heart" size={22} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {isCustomer && (
              <TouchableOpacity style={styles.offerBtn} onPress={() => setShowOffer(!showOffer)}>
                <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                <Text style={styles.offerBtnText}>Make an Offer</Text>
              </TouchableOpacity>
            )}

            {showOffer && (
              <View style={styles.offerForm}>
                <TextInput style={styles.offerInput} value={offerPrice} onChangeText={setOfferPrice} placeholder="Your price (Rs.)" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                <TouchableOpacity style={styles.offerSubmit} onPress={handleMakeOffer}>
                  <Text style={styles.offerSubmitText}>Submit Offer</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.vizBtn} onPress={() => navigation.navigate('InteriorVisualizer', { id: artwork.id || artwork._id })}>
              <Ionicons name="eye-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.vizBtnText}>View in Room</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Reviews */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {user && isCustomer && (
            <View style={styles.reviewForm}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <StarRating rating={reviewRating} size={24} editable onRate={setReviewRating} />
                {editingReviewId && (
                  <TouchableOpacity onPress={() => { setEditingReviewId(null); setReviewComment(''); setReviewRating(5); }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput style={styles.reviewInput} value={reviewComment} onChangeText={setReviewComment} placeholder="Write your review..." placeholderTextColor={colors.textMuted} multiline />
              <TouchableOpacity style={styles.reviewSubmit} onPress={handleAddReview}>
                <Text style={styles.reviewSubmitText}>{editingReviewId ? 'Update Review' : 'Post Review'}</Text>
              </TouchableOpacity>
            </View>
          )}
          <ReviewList reviews={reviews} currentUser={user} onEditReview={handleEditClick} onDeleteReview={handleDeleteReview} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  image: { width, height: width * 0.9, backgroundColor: colors.surface },
  backBtn: { position: 'absolute', top: 48, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  content: { padding: 20, paddingTop: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', flex: 1, marginRight: 10 },
  price: { color: colors.gold, fontSize: 22, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { color: colors.textMuted, fontSize: 12 },
  stockBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  stockText: { fontSize: 12, fontWeight: '600' },
  category: { color: colors.primary, fontSize: 14, fontWeight: '600', marginTop: 10 },
  artist: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tag: { backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  tagText: { color: colors.textSecondary, fontSize: 11 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 12 },
  cartBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  gradientBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  cartBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  wishBtn: { width: 50, height: 50, backgroundColor: colors.surface, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  offerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, paddingVertical: 12, borderRadius: 14, marginTop: 12, gap: 8, borderWidth: 1, borderColor: colors.primary },
  offerBtnText: { color: colors.primary, fontWeight: '700' },
  offerForm: { flexDirection: 'row', gap: 10, marginTop: 10 },
  offerInput: { flex: 1, backgroundColor: colors.inputBg, color: colors.textPrimary, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  offerSubmit: { backgroundColor: colors.success, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 10 },
  offerSubmitText: { color: '#fff', fontWeight: '700' },
  vizBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, paddingVertical: 12, borderRadius: 14, marginTop: 12, gap: 8 },
  vizBtnText: { color: colors.textPrimary, fontWeight: '600' },
  reviewSection: { marginTop: 28 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  reviewForm: { backgroundColor: colors.surface, padding: 14, borderRadius: 14, marginBottom: 16 },
  reviewInput: { color: colors.textPrimary, backgroundColor: colors.inputBg, padding: 12, borderRadius: 10, marginTop: 10, minHeight: 60, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border },
  reviewSubmit: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  reviewSubmitText: { color: '#fff', fontWeight: '700' },
});
