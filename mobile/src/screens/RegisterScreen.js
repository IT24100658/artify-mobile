import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', address: '', phone: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) { Alert.alert('Error', 'Please fill required fields'); return; }
    if (form.password !== form.confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (form.password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.address, form.phone, [form.role]);
      Alert.alert('Success', 'Registration successful!', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Registration failed'); }
    setLoading(false);
  };

  const roles = [
    { key: 'customer', label: 'Customer', icon: 'person' },
    { key: 'artist', label: 'Artist', icon: 'brush' },
    { key: 'admin', label: 'Admin', icon: 'shield' }
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.gradientEnd, colors.gradientStart]} style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the art community</Text>
        </LinearGradient>
        <View style={styles.form}>
          {[{ key: 'username', icon: 'person-outline', ph: 'Username *' }, { key: 'email', icon: 'mail-outline', ph: 'Email *', kb: 'email-address' },
            { key: 'password', icon: 'lock-closed-outline', ph: 'Password *', secure: true }, { key: 'confirmPassword', icon: 'lock-closed-outline', ph: 'Confirm Password *', secure: true },
            { key: 'address', icon: 'location-outline', ph: 'Address' }, { key: 'phone', icon: 'call-outline', ph: 'Phone', kb: 'phone-pad' }].map(f => (
            <View key={f.key} style={styles.inputWrap}>
              <Ionicons name={f.icon} size={20} color={colors.textMuted} />
              <TextInput style={styles.input} value={form[f.key]} onChangeText={v => update(f.key, v)} placeholder={f.ph} placeholderTextColor={colors.textMuted} secureTextEntry={f.secure} keyboardType={f.kb || 'default'} autoCapitalize="none" />
            </View>
          ))}

          <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.btn}>
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: colors.textSecondary }}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  scroll: { flexGrow: 1 },
  header: { paddingTop: 60, paddingBottom: 40, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  form: { padding: 24 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  input: { flex: 1, color: colors.textPrimary, paddingVertical: 14, marginLeft: 10, fontSize: 15 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.surface, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  roleBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(108,99,255,0.1)' },
  roleText: { color: colors.textMuted, fontWeight: '600' },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  gradientBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
