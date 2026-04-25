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
import {login} from '../services/api';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setLoading(true);
    setError(null);
    try {
      await login(phone.trim(), password);
      navigation.reset({
        index: 0,
        routes: [{name: 'NearbyStores'}],
      });
    } catch (e: any) {
      setError(e?.message ?? 'Login failed');
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
          <Text style={styles.brandSubtitle}>Login to your account</Text>
        </View>

        <View style={styles.card}>
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
              placeholder="Enter your password"
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.ctaRow}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#16A34A" />
                <Text style={styles.muted}>Signing in…</Text>
              </View>
            ) : (
              <Pressable
                onPress={onLogin}
                style={({pressed}) => [
                  styles.primaryBtn,
                  pressed && styles.primaryBtnPressed,
                ]}>
                <Text style={styles.primaryBtnText}>Login</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don&apos;t have an account?{' '}
          </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Register</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 24},
  outer: {flex: 1, justifyContent: 'center', width: '100%', maxWidth: 420, alignSelf: 'center'},
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

