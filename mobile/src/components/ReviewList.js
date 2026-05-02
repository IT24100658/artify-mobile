import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import colors from '../theme/colors';
import StarRating from './StarRating';
import config from '../config';

const API_BASE = config.BASE_URL;

const ReviewList = ({ reviews, currentUser, onEditReview, onDeleteReview }) => {
  if (!reviews?.length) {
    return <Text style={styles.empty}>No reviews yet. Be the first to review!</Text>;
  }

  const renderReview = ({ item }) => {
    const isOwner = currentUser && (currentUser.id === item.user?._id || currentUser.id === item.user?.id);
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user?.username?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{item.user?.username || 'Anonymous'}</Text>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <StarRating rating={item.rating} size={14} />
        </View>
        <Text style={styles.comment}>{item.comment}</Text>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE}${item.imageUrl}` }} style={styles.reviewImage} resizeMode="cover" />
        ) : null}
        
        {isOwner && (
          <View style={styles.actions}>
            <Text style={styles.actionBtn} onPress={() => onEditReview && onEditReview(item)}>Edit</Text>
            <Text style={[styles.actionBtn, { color: colors.error }]} onPress={() => onDeleteReview && onDeleteReview(item._id || item.id)}>Delete</Text>
          </View>
        )}
      </View>
    );
  };

  return <FlatList data={reviews} renderItem={renderReview} keyExtractor={i => i.id || i._id} scrollEnabled={false} />;
};

const styles = StyleSheet.create({
  empty: { color: colors.textSecondary, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: colors.textPrimary, fontWeight: '700', fontSize: 16 },
  username: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
  date: { color: colors.textMuted, fontSize: 11 },
  comment: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  reviewImage: { width: '100%', height: 150, borderRadius: 8, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 15 },
  actionBtn: { color: colors.primary, fontSize: 13, fontWeight: 'bold' },
});

export default ReviewList;
