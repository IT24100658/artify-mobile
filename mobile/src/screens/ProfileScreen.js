import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAdmin, isCustomer } = useAuth();
  const [profile, setProfile] = useState({ username: '', email: '', address: '', phone: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (user) loadProfile(); }, [user]);
  const loadProfile = async () => {
    try { const res = await UserService.getUserProfile(user.id); setProfile(res.data); }
    catch (e) { setProfile({ username: user.username, email: user.email, address: '', phone: '' }); }
  };

  const handleSave = async () => {
    try { await UserService.updateUserProfile(user.id, profile); setEditing(false); Alert.alert('Success', 'Profile updated!'); }
    catch (e) { Alert.alert('Error', 'Failed to update profile'); }
  };

  const menuItems = [
    ...(isCustomer ? [
      { icon: 'receipt-outline', label: 'My Orders', onPress: () => navigation.navigate('OrderHistory') },
      { icon: 'pricetag-outline', label: 'My Offers', onPress: () => navigation.navigate('MyOffers') },
    ] : []),
    ...(isAdmin ? [
      { icon: 'grid-outline', label: 'Admin Dashboard', onPress: () => navigation.navigate('AdminDashboard') },
      { icon: 'cube-outline', label: 'Inventory', onPress: () => navigation.navigate('Inventory') },
      { icon: 'add-circle-outline', label: 'Upload Artwork', onPress: () => navigation.navigate('ArtworkUpload') },
      { icon: 'pricetags-outline', label: 'Manage Offers', onPress: () => navigation.navigate('OfferManagement') },
      { icon: 'receipt-outline', label: 'All Orders', onPress: () => navigation.navigate('OrderHistory') },
    ] : []),
    { icon: 'log-out-outline', label: 'Logout', onPress: () => { Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }]); }, color: colors.error },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={s.avatarWrap}>
        <View style={s.avatar}><Text style={s.avatarText}>{profile.username?.[0]?.toUpperCase() || '?'}</Text></View>
        <Text style={s.name}>{profile.username}</Text>
        <Text style={s.email}>{profile.email}</Text>
        <View style={s.roleBadge}><Text style={s.roleText}>{user?.roles?.[0]?.replace('ROLE_', '')}</Text></View>
      </View>

      <View style={s.section}>
        <View style={s.sHeader}><Text style={s.sTitle}>Profile Details</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
            <Text style={s.editBtn}>{editing ? 'Save' : 'Edit'}</Text></TouchableOpacity></View>
        {[{ key: 'username', label: 'Username', icon: 'person-outline' }, { key: 'email', label: 'Email', icon: 'mail-outline' },
          { key: 'address', label: 'Address', icon: 'location-outline' }, { key: 'phone', label: 'Phone', icon: 'call-outline' }].map(f => (
          <View key={f.key} style={s.field}>
            <Ionicons name={f.icon} size={18} color={colors.textMuted} />
            {editing ? <TextInput style={s.fieldInput} value={profile[f.key] || ''} onChangeText={v => setProfile(p => ({ ...p, [f.key]: v }))} placeholder={f.label} placeholderTextColor={colors.textMuted} />
              : <Text style={s.fieldText}>{profile[f.key] || 'Not set'}</Text>}
          </View>
        ))}
      </View>

      <View style={s.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={s.menuItem} onPress={item.onPress}>
            <Ionicons name={item.icon} size={22} color={item.color || colors.textSecondary} />
            <Text style={[s.menuLabel, item.color && { color: item.color }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  avatarWrap: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  name: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: 10 },
  email: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  roleBadge: { backgroundColor: colors.primary + '20', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  section: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  sHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  editBtn: { color: colors.primary, fontWeight: '700' },
  field: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
  fieldText: { color: colors.textSecondary, fontSize: 14, flex: 1 },
  fieldInput: { color: colors.textPrimary, fontSize: 14, flex: 1, padding: 0 },
  menu: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  menuLabel: { flex: 1, color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
});
