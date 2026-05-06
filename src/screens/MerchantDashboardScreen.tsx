import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useAppMode} from '../context/AppModeContext';
import {ModeToggle} from '../components/ModeToggle';
import {logout} from '../services/api';
import {useCart} from '../context/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MerchantDashboard'>;

export default function MerchantDashboardScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {mode, setMode, isStoreOwner, setUser} = useAppMode();
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
        <View style={{flex: 1}}>
          <Text style={styles.topTitle}>Merchant</Text>
          <Text style={styles.topSubtitle}>Manage your store</Text>
          {isStoreOwner ? (
            <View style={{marginTop: 10}}>
              <ModeToggle
                mode={mode}
                onChange={next => {
                  setMode(next);
                  if (next === 'CUSTOMER') {
                    navigation.reset({index: 0, routes: [{name: 'NearbyStores'}]});
                  }
                }}
              />
            </View>
          ) : null}
        </View>
        <View style={{gap: 10}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}
            style={styles.iconBtn}>
            <Ionicons name="cart-outline" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.8}
            style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={22} color="#B00020" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => navigation.navigate('MyStores')}>
          <View style={styles.cardLeft}>
            <Ionicons name="storefront-outline" size={20} color="#111827" />
            <Text style={styles.cardTitle}>My Stores</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.card}
          onPress={() => navigation.navigate('MerchantOrders')}>
          <View style={styles.cardLeft}>
            <Ionicons name="receipt-outline" size={20} color="#111827" />
            <Text style={styles.cardTitle}>Orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
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
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  topTitle: {fontSize: 22, fontWeight: '900', color: '#16A34A'},
  topSubtitle: {marginTop: 2, fontSize: 12, color: '#6B7280', fontWeight: '600'},
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {paddingHorizontal: 16, paddingVertical: 16, gap: 12},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  cardTitle: {fontWeight: '900', color: '#111827'},
});

