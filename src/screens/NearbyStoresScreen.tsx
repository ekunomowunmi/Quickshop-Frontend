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
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Stores</Text>
        <Text style={styles.subtitle}>
          Tap a store to view products
        </Text>
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
                  <Text style={styles.name} numberOfLines={1}>
                    {storeName}
                  </Text>
                  {km !== null ? (
                    <Text style={styles.distance}>{km} km</Text>
                  ) : null}
                </View>
                {item.address ? (
                  <Text style={styles.address}>{item.address}</Text>
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#fff'},
  header: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8},
  title: {fontSize: 24, fontWeight: '800', color: '#111'},
  subtitle: {marginTop: 4, color: '#666'},
  list: {paddingVertical: 8},
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
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  row: {flexDirection: 'row', justifyContent: 'space-between', gap: 12},
  name: {flex: 1, fontSize: 16, fontWeight: '800', color: '#111'},
  distance: {fontWeight: '700', color: '#111'},
  address: {marginTop: 6, color: '#555', lineHeight: 18},
});

