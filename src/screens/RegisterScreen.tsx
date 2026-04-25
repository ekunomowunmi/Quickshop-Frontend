import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {registerUser} from '../services/api';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'STORE_OWNER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRegister() {
    setLoading(true);
    setError(null);
    try {
      await registerUser({
        name: name.trim(),
        phone: phone.trim(),
        password,
        role,
      });
      navigation.replace('Login');
    } catch (e: any) {
      setError(e?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.safe,
        {paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12)},
      ]}>
      <View style={styles.outer}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>Quickshop</Text>
          <Text style={styles.brandSubtitle}>Create your account</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+234 800 000 0000"
              keyboardType="phone-pad"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleRow}>
              <Pressable
                onPress={() => setRole('CUSTOMER')}
                style={[
                  styles.roleBtn,
                  role === 'CUSTOMER' && styles.roleBtnActive,
                ]}>
                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'CUSTOMER' && styles.roleBtnTextActive,
                  ]}>
                  Customer
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRole('STORE_OWNER')}
                style={[
                  styles.roleBtn,
                  role === 'STORE_OWNER' && styles.roleBtnActive,
                ]}>
                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'STORE_OWNER' && styles.roleBtnTextActive,
                  ]}>
                  Store Owner
                </Text>
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.ctaRow}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#16A34A" />
                <Text style={styles.muted}>Creating account…</Text>
              </View>
            ) : (
              <Pressable
                onPress={onRegister}
                style={({pressed}) => [
                  styles.primaryBtn,
                  pressed && styles.primaryBtnPressed,
                ]}>
                <Text style={styles.primaryBtnText}>Register</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.link}>Login</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 24},
  outer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  brand: {alignItems: 'center', marginBottom: 24},
  brandName: {fontSize: 34, fontWeight: '800', color: '#16A34A', marginBottom: 6},
  brandSubtitle: {fontSize: 14, color: '#4B5563'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  field: {gap: 8, marginBottom: 14},
  label: {fontWeight: '600', color: '#374151'},
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  roleRow: {flexDirection: 'row', gap: 12},
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleBtnActive: {borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,0.06)'},
  roleBtnText: {fontWeight: '700', color: '#6B7280'},
  roleBtnTextActive: {color: '#16A34A'},
  error: {color: '#b00020', fontWeight: '600', marginTop: 2, marginBottom: 8},
  muted: {color: '#6B7280', fontWeight: '600'},
  ctaRow: {paddingTop: 6},
  loadingRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10},
  primaryBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnPressed: {opacity: 0.9},
  primaryBtnText: {color: '#fff', fontWeight: '800', fontSize: 16},
  footer: {flexDirection: 'row', justifyContent: 'center', marginTop: 18},
  footerText: {color: '#4B5563'},
  link: {color: '#16A34A', fontWeight: '800'},
});

