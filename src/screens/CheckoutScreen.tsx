import React, {useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {useCart} from '../context/CartContext';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

function formatMoney(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

export default function CheckoutScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {total, clear} = useCart();

  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');

  const canPlace = useMemo(() => {
    if (method === 'pickup') return true;
    return address.trim().length > 5;
  }, [address, method]);

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
        <Text style={styles.topTitle}>Checkout</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Delivery Method</Text>
          <View style={styles.methodRow}>
            <TouchableOpacity
              onPress={() => setMethod('pickup')}
              activeOpacity={0.85}
              style={[
                styles.methodBtn,
                method === 'pickup' && styles.methodBtnActive,
              ]}>
              <Text
                style={[
                  styles.methodText,
                  method === 'pickup' && styles.methodTextActive,
                ]}>
                Pickup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMethod('delivery')}
              activeOpacity={0.85}
              style={[
                styles.methodBtn,
                method === 'delivery' && styles.methodBtnActive,
              ]}>
              <Text
                style={[
                  styles.methodText,
                  method === 'delivery' && styles.methodTextActive,
                ]}>
                Delivery
              </Text>
            </TouchableOpacity>
          </View>

          {method === 'delivery' ? (
            <View style={{marginTop: 14}}>
              <Text style={styles.label}>Delivery Address</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your delivery address"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatMoney(total)}</Text>
          </View>

          <TouchableOpacity
            disabled={!canPlace}
            onPress={() => {
              clear();
              navigation.reset({index: 0, routes: [{name: 'OrderSuccess'}]});
            }}
            activeOpacity={0.9}
            style={[styles.primaryBtn, !canPlace && styles.primaryBtnDisabled]}>
            <Text style={styles.primaryBtnText}>Place Order</Text>
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
  body: {paddingHorizontal: 16, paddingVertical: 16, gap: 14},
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
  },
  label: {fontWeight: '700', color: '#374151', marginBottom: 10},
  methodRow: {flexDirection: 'row', gap: 12},
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  methodBtnActive: {
    borderColor: '#16A34A',
    backgroundColor: 'rgba(22,163,74,0.06)',
  },
  methodText: {fontWeight: '800', color: '#6B7280'},
  methodTextActive: {color: '#16A34A'},
  input: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  totalLabel: {color: '#374151', fontWeight: '700'},
  totalValue: {color: '#16A34A', fontWeight: '900', fontSize: 16},
  primaryBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: {opacity: 0.5},
  primaryBtnText: {color: '#fff', fontWeight: '900', fontSize: 16},
});

