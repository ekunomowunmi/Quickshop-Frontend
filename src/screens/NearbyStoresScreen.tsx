import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {getNearbyStoresSmart, NearbyStore} from '../services/api';
import {useCart} from '../context/CartContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useAppMode} from '../context/AppModeContext';
import {ModeToggle} from '../components/ModeToggle';
import * as Location from 'expo-location';

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
  const {mode, setMode, isStoreOwner} = useAppMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [manualMode, setManualMode] = useState(false);
  const [address, setAddress] = useState('');

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
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          if (!cancelled) setManualMode(true);
          if (!cancelled) setStores([]);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const data = await getNearbyStoresSmart({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
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

  async function onSearch() {
    const q = address.trim();
    if (!q) {
      setError('Enter a location to search.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyStoresSmart({address: q});
      setStores(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to search stores.');
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
        <View style={styles.topbarLeft}>
          <Text style={styles.topTitle}>Nearby Stores</Text>
          <Text style={styles.topSubtitle}>Find groceries near you</Text>
          {isStoreOwner ? (
            <View style={{marginTop: 10}}>
              <ModeToggle
                mode={mode}
                onChange={next => {
                  setMode(next);
                  if (next === 'MERCHANT') {
                    navigation.reset({
                      index: 0,
                      routes: [{name: 'MerchantDashboard'}],
                    });
                  }
                }}
              />
            </View>
          ) : null}
        </View>
        <View style={styles.topbarRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}
            style={styles.iconBtn}>
            <Ionicons name="cart-outline" size={22} color="#374151" />
            {itemCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {itemCount > 99 ? '99+' : String(itemCount)}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
            style={styles.iconBtn}>
            <Ionicons
              name="person-circle-outline"
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
        </View>
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

      {!loading && manualMode ? (
        <View style={styles.manual}>
          <Text style={styles.manualTitle}>Enter location</Text>
          <View style={styles.manualRow}>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. Ikeja, Lagos"
              placeholderTextColor="#9CA3AF"
              style={styles.manualInput}
            />
            <TouchableOpacity
              onPress={onSearch}
              activeOpacity={0.9}
              style={styles.manualBtn}>
              <Text style={styles.manualBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
  topbarRight: {flexDirection: 'row', alignItems: 'center', gap: 10},
  iconBtn: {
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

  manual: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
  },
  manualTitle: {fontWeight: '900', color: '#111827', marginBottom: 8},
  manualRow: {flexDirection: 'row', gap: 10, alignItems: 'center'},
  manualInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: '#111827',
  },
  manualBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  manualBtnText: {color: '#fff', fontWeight: '900'},
});

