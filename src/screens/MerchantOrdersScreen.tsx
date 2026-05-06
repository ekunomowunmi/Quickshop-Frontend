import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type {RootStackParamList} from '../types/navigation';
import {getMyOrders, Order} from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'MerchantOrders'>;

function formatMoney(amount: unknown) {
  if (typeof amount === 'number' && Number.isFinite(amount)) {
    return `₦${amount.toLocaleString()}`;
  }
  return '—';
}

export default function MerchantOrdersScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyOrders();
        if (!cancelled) setOrders(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load orders.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    return [...orders];
  }, [orders]);

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
        <Text style={styles.topTitle}>Orders</Text>
        <View style={{width: 40}} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading orders…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={
            sorted.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No orders</Text>
            </View>
          }
          renderItem={({item}) => {
            const itemsText =
              Array.isArray(item.items) && item.items.length
                ? item.items
                    .map(i => `${i.name ?? 'Item'} × ${i.quantity ?? 1}`)
                    .join(', ')
                : '—';

            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.orderId} numberOfLines={1}>
                    Order #{String(item.id).slice(0, 8)}
                  </Text>
                  <Text style={styles.status}>
                    {String(item.status ?? 'PENDING')}
                  </Text>
                </View>

                <Text style={styles.items} numberOfLines={2}>
                  {itemsText}
                </Text>

                <View style={[styles.row, {marginTop: 10}]}>
                  <Text style={styles.total}>{formatMoney(item.total)}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {}}
                      style={styles.actionBtn}
                      accessibilityLabel="Accept order">
                      <MaterialIcons name="check" size={20} color="#16A34A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {}}
                      style={[styles.actionBtn, styles.dangerBtn]}
                      accessibilityLabel="Reject order">
                      <MaterialIcons name="close" size={20} color="#B00020" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {}}
                      style={styles.actionBtn}
                      accessibilityLabel="Mark ready">
                      <MaterialIcons name="local-shipping" size={20} color="#374151" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {}}
                      style={styles.actionBtn}
                      accessibilityLabel="Complete order">
                      <MaterialIcons name="done-all" size={20} color="#374151" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
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
  list: {paddingHorizontal: 16, paddingVertical: 16, gap: 12},
  emptyContainer: {flexGrow: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8},
  muted: {color: '#6B7280', fontWeight: '600'},
  errorTitle: {fontSize: 18, fontWeight: '900', color: '#b00020'},
  errorBody: {color: '#333', textAlign: 'center'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
    gap: 8,
  },
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  orderId: {fontSize: 14, fontWeight: '900', color: '#111827', flex: 1},
  status: {fontSize: 12, fontWeight: '900', color: '#374151'},
  items: {color: '#6B7280', fontWeight: '600', lineHeight: 18},
  total: {fontWeight: '900', color: '#111827'},
  actions: {flexDirection: 'row', gap: 10},
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtn: {backgroundColor: '#FEF2F2'},
});

