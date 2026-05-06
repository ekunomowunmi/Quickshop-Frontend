import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {RootStackParamList} from '../types/navigation';
import {createStore} from '../services/api';
import * as Location from 'expo-location';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateStore'>;

export default function CreateStoreScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [coords, setCoords] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'none' | 'gps_selected' | 'using_address'
  >('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && address.trim().length > 0 && phone.trim().length > 0;
  }, [address, name, phone]);

  async function onSubmit() {
    setError(null);
    if (!canSubmit) {
      setError('Please fill name, address, and phone.');
      return;
    }

    setLoading(true);
    try {
      await createStore({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        ...(coords ? {latitude: coords.latitude, longitude: coords.longitude} : {}),
      });
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  }

  async function useCurrentLocation() {
    setError(null);
    setLoading(true);
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Location permission denied. You can enter address instead.');
        setCoords(null);
        setLocationStatus('using_address');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
      setLocationStatus('gps_selected');
    } catch (e: any) {
      setError(e?.message ?? 'Could not get location.');
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
      <View style={styles.topbar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Create Store</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.title}>Store details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Store Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Quickshop VI"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              value={address}
              onChangeText={t => {
                setAddress(t);
                if (!coords && t.trim().length > 0) setLocationStatus('using_address');
              }}
              placeholder="Store address"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+234 800 000 0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            onPress={useCurrentLocation}
            disabled={loading}
            activeOpacity={0.9}
            style={[styles.secondaryBtn, loading && styles.primaryBtnDisabled]}>
            <Ionicons name="locate-outline" size={18} color="#16A34A" />
            <Text style={styles.secondaryBtnText}>Use Current Location 📍</Text>
          </TouchableOpacity>

          {locationStatus === 'gps_selected' ? (
            <Text style={styles.hint}>Location selected ✅</Text>
          ) : locationStatus === 'using_address' ? (
            <Text style={styles.hint}>Using address for location</Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            disabled={loading}
            onPress={onSubmit}
            activeOpacity={0.9}
            style={[
              styles.primaryBtn,
              (!canSubmit || loading) && styles.primaryBtnDisabled,
            ]}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.primaryBtnText}>Creating…</Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>Create Store</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB'},
  topbar: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topTitle: {flex: 1, fontSize: 18, fontWeight: '900', color: '#111827'},
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  body: {paddingHorizontal: 16, paddingVertical: 16},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
    gap: 12,
  },
  title: {fontSize: 18, fontWeight: '900', color: '#111827'},
  field: {gap: 8},
  label: {color: '#374151', fontWeight: '700'},
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
  row: {flexDirection: 'row', gap: 12},
  error: {color: '#b00020', fontWeight: '700'},
  hint: {color: '#6B7280', fontWeight: '700'},
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(22,163,74,0.06)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(22,163,74,0.25)',
  },
  secondaryBtnText: {color: '#16A34A', fontWeight: '900'},
  primaryBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: {opacity: 0.5},
  primaryBtnText: {color: '#fff', fontWeight: '900', fontSize: 16},
  loadingRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
});

