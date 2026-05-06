import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {RootStackParamList} from '../types/navigation';
import {getMyStores, Store} from '../services/api';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'MyStores'>;

export default function MyStoresScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>([]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyStores();
      setStores(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStores();
    }, [fetchStores]),
  );

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
        <Text style={styles.topTitle}>My Stores</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateStore')}
          activeOpacity={0.8}
          style={styles.iconBtn}
          accessibilityLabel="Create store">
          <Ionicons name="add-circle-outline" size={24} color="#16A34A" />
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
          data={stores}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={
            stores.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Image
                source={{uri: 'https://via.placeholder.com/200'}}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyTitle}>You don’t have any stores yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first store to start selling
              </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('CreateStore')}
                style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Create Store</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({item}) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() =>
                navigation.navigate('MerchantStoreProducts', {
                  storeId: String(item.id),
                  storeName: item.name,
                })
              }>
              <View style={{flex: 1}}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.address ? (
                  <Text style={styles.address} numberOfLines={2}>
                    {item.address}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {fontSize: 16, fontWeight: '900', color: '#111827'},
  address: {marginTop: 6, color: '#6B7280', fontWeight: '600', lineHeight: 18},

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyImage: {width: 200, height: 200, borderRadius: 24, marginBottom: 6},
  emptyTitle: {fontSize: 18, fontWeight: '900', color: '#111827', textAlign: 'center'},
  emptySubtitle: {color: '#6B7280', fontWeight: '600', textAlign: 'center', lineHeight: 18},
  primaryBtn: {
    marginTop: 8,
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {color: '#fff', fontWeight: '900', fontSize: 16},
});

