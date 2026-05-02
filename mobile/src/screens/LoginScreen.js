import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) { Alert.alert('Error', 'Please fill all fields'); return; }
    setLoading(true);
    try {
      await login(username, password);
    } catch (e) {
      Alert.alert('Login Failed', e.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.headerGradient}>
          <Ionicons name="color-palette" size={48} color="#fff" />
          <Text style={styles.brand}>ARTIFY</Text>
          <Text style={styles.subtitle}>Welcome back, art lover</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={20} color={colors.textMuted} />
            <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter username" placeholderTextColor={colors.textMuted} autoCapitalize="none" />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter password" placeholderTextColor={colors.textMuted} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  scroll: { flexGrow: 1 },
  headerGradient: { paddingTop: 80, paddingBottom: 50, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  brand: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 10 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 4 },
  form: { padding: 24, paddingTop: 30 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 16 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.textPrimary, paddingVertical: 14, marginLeft: 10, fontSize: 15 },
  loginBtn: { marginTop: 28, borderRadius: 14, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 16, alignItems: 'center', borderRadius: 14 },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  registerLink: { alignItems: 'center', marginTop: 24 },
  registerText: { color: colors.textSecondary, fontSize: 14 },
});
