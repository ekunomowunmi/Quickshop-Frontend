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
import type {RootStackParamList} from '../types/navigation';
import {getNearbyStores, NearbyStore} from '../services/api';
import {useCart} from '../context/CartContext';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'NearbyStores'>;

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function extractDistanceMeters(store: NearbyStore): number | undefined {
  return (
    toNumber(store.distanceMeters) ??
    toNumber(store.distance_meters) ??
    toNumber(store.distance)
  );
}

export default function NearbyStoresScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {itemCount} = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<NearbyStore[]>([]);

  const sortedStores = useMemo(() => {
    const copy = [...stores];
    copy.sort((a, b) => {
      const da = extractDistanceMeters(a) ?? Number.POSITIVE_INFINITY;
      const db = extractDistanceMeters(b) ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
    return copy;
  }, [stores]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await getNearbyStores();
        if (!cancelled) setStores(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load stores.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View
      style={[
        styles.safe,
        {paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12)},
      ]}>
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <Text style={styles.topTitle}>Nearby Stores</Text>
          <Text style={styles.topSubtitle}>Find groceries near you</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.8}
          style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={22} color="#374151" />
          {itemCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {itemCount > 99 ? '99+' : String(itemCount)}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading stores…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={sortedStores}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={
            sortedStores.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No stores found</Text>
            </View>
          }
          renderItem={({item}) => {
            const meters = extractDistanceMeters(item);
            const km =
              typeof meters === 'number'
                ? Math.round((meters / 1000) * 10) / 10
                : null;

            const storeId = String(item.id ?? '');
            const storeName = item.name ?? 'Store';

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('StoreProducts', {storeId, storeName})
                }>
                <View style={styles.row}>
                  <View style={{flex: 1}}>
                    <Text style={styles.name} numberOfLines={1}>
                      {storeName}
                    </Text>
                    {item.address ? (
                      <Text style={styles.address} numberOfLines={2}>
                        {item.address}
                      </Text>
                    ) : null}
                  </View>
                  {km !== null ? (
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{km} km</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
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
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topbarLeft: {flex: 1, paddingRight: 12},
  topTitle: {fontSize: 22, fontWeight: '900', color: '#16A34A'},
  topSubtitle: {marginTop: 2, fontSize: 12, color: '#6B7280', fontWeight: '600'},
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: '#fff', fontWeight: '900', fontSize: 11},
  pressed: {opacity: 0.85},
  list: {paddingHorizontal: 16, paddingVertical: 16, gap: 12},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  muted: {color: '#666'},
  errorTitle: {fontSize: 18, fontWeight: '800', color: '#b00020'},
  errorBody: {color: '#333', textAlign: 'center'},
  emptyContainer: {flexGrow: 1},
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
    backgroundColor: '#fff',
  },
  row: {flexDirection: 'row', justifyContent: 'space-between', gap: 12},
  name: {fontSize: 16, fontWeight: '900', color: '#111827'},
  address: {marginTop: 6, color: '#6B7280', lineHeight: 18, fontWeight: '600'},
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(22,163,74,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(22,163,74,0.25)',
  },
  pillText: {color: '#16A34A', fontWeight: '900', fontSize: 12},
});

