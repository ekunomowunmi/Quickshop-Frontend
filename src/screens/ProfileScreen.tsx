import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';
import {logout} from '../services/api';
import {useCart} from '../context/CartContext';
import {useAppMode} from '../context/AppModeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {user, setUser, setMode} = useAppMode();
  const {clear} = useCart();

  async function onLogout() {
    await logout();
    clear();
    setUser(null);
    setMode('CUSTOMER');
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
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
        <Text style={styles.topTitle}>Profile</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name ?? '—'}</Text>

          <View style={{height: 12}} />

          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{user?.phone ?? '—'}</Text>
        </View>

        <TouchableOpacity
          onPress={onLogout}
          activeOpacity={0.85}
          style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#B00020" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  body: {paddingHorizontal: 16, paddingVertical: 16, gap: 14},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
  },
  label: {color: '#6B7280', fontWeight: '700', fontSize: 12},
  value: {color: '#111827', fontWeight: '900', fontSize: 16, marginTop: 4},
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FECACA',
  },
  logoutText: {color: '#B00020', fontWeight: '900'},
});

