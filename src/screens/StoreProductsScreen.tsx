import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {getProductsByStore, Product} from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'StoreProducts'>;

export default function StoreProductsScreen({route}: Props) {
  const insets = useSafeAreaInsets();
  const {storeId} = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductsByStore(storeId);
        if (!cancelled) setProducts(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  return (
    <View
      style={[
        styles.safe,
        {paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12)},
      ]}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading products…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={
            products.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No products available</Text>
            </View>
          }
          renderItem={({item}) => {
            const price =
              typeof item.price === 'number'
                ? `₦${item.price.toFixed(2)}`
                : item.price != null
                  ? String(item.price)
                  : null;

            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {price ? <Text style={styles.price}>{price}</Text> : null}
                </View>
                {typeof item.stock === 'number' ? (
                  <Text style={styles.stock}>Stock: {item.stock}</Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#fff'},
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
  price: {fontWeight: '800', color: '#111'},
  stock: {marginTop: 6, color: '#555'},
});

