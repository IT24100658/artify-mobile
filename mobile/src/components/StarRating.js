import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const StarRating = ({ rating, size = 18, editable = false, onRate }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {stars.map(s => (
        <TouchableOpacity key={s} disabled={!editable} onPress={() => onRate?.(s)} style={{ marginRight: 2 }}>
          <Ionicons name={s <= rating ? 'star' : s - 0.5 <= rating ? 'star-half' : 'star-outline'} size={size} color={colors.gold} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default StarRating;
