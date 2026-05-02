import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';
import AdminService from '../services/admin.service';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          AdminService.getSystemStats(),
          AdminService.getAllUsers()
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await AdminService.setUserStatus(id, !currentStatus);
      setUsers(users.map(u => u.id === id ? { ...u, active: !currentStatus } : u));
    } catch (e) {
      alert('Failed to update user status.');
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: 'people', color: colors.primary },
    { label: 'Total Artworks', value: stats?.totalArtworks || 0, icon: 'image', color: colors.secondary },
    { label: 'Total Sales', value: stats?.totalSales || 0, icon: 'trending-up', color: colors.success },
    { label: 'Low Stock', value: stats?.lowStockCount || 0, icon: 'alert-circle', color: colors.warning },
    { label: 'Revenue', value: `Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: 'cash', color: colors.gold },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.heading}>Admin Dashboard</Text>
      
      <View style={s.grid}>
        {cards.map((c, i) => (
          <View key={i} style={[s.statCard, { backgroundColor: colors.surface }]}>
            <View style={{ backgroundColor: c.color + '20', padding: 8, borderRadius: 8, alignSelf: 'flex-start' }}>
               <Ionicons name={c.icon} size={24} color={c.color} />
            </View>
            <Text style={s.statVal}>{c.value}</Text>
            <Text style={s.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>User Management</Text>
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden' }}>
        {users.map((u, i) => (
          <View key={u.id} style={[s.userRow, i !== users.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: colors.textPrimary }}>{u.username}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{u.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={{ backgroundColor: u.active ? colors.success + '20' : colors.error + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: u.active ? colors.success : colors.error }}>{u.active ? 'ACTIVE' : 'INACTIVE'}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleUserStatus(u.id, u.active)} style={{ borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, color: colors.textPrimary }}>{u.active ? 'Deactivate' : 'Activate'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Recent Activity</Text>
      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12 }}>
        {stats?.recentLogs?.slice(0, 15).map((log, i) => (
          <View key={i} style={s.logItem}>
            <View style={s.logDot} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.logAction}>{log.action}</Text>
                <Text style={s.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
              </View>
              <Text style={s.logDetails}>{log.details}</Text>
            </View>
          </View>
        ))}
        {(!stats?.recentLogs || stats.recentLogs.length === 0) && (
          <Text style={{ textAlign: 'center', color: colors.textMuted }}>No logs available.</Text>
        )}
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', padding: 16, borderRadius: 16, marginBottom: 4 },
  statVal: { color: colors.textPrimary, fontSize: 24, fontWeight: '900', marginTop: 8 },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center' },
  logItem: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, marginRight: 10 },
  logAction: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  logDetails: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  logTime: { color: colors.textMuted, fontSize: 11 },
});
