import React, {useEffect, useState} from 'react';
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
import {getProductsByStore, Product} from '../services/api';
import {useCart} from '../context/CartContext';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'StoreProducts'>;

function toPriceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export default function StoreProductsScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {storeId, storeName} = route.params;
  const {addItem, itemCount} = useCart();

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
      <View style={styles.topbar}>
        <View style={styles.topbarLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text style={styles.topTitle} numberOfLines={1}>
              {storeName}
            </Text>
            <Text style={styles.topSubtitle}>Browse products</Text>
          </View>
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
            const priceNum = toPriceNumber(item.price);
            const priceText =
              priceNum != null
                ? `₦${priceNum.toLocaleString()}`
                : item.price != null
                  ? String(item.price)
                  : '';

            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {priceText ? <Text style={styles.price}>{priceText}</Text> : null}
                </View>

                <View style={[styles.row, {marginTop: 10}]}>
                  {typeof item.stock === 'number' ? (
                    <Text style={styles.stock}>Stock: {item.stock}</Text>
                  ) : (
                    <View />
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      if (priceNum == null) return;
                      addItem({
                        id: String(item.id ?? item.name),
                        name: item.name,
                        price: priceNum,
                      });
                    }}
                    activeOpacity={0.85}
                    disabled={priceNum == null}
                    style={[
                      styles.addBtn,
                      priceNum == null && styles.addBtnDisabled,
                    ]}>
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
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
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topbarLeft: {flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {fontSize: 18, fontWeight: '900', color: '#111827'},
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
  name: {flex: 1, fontSize: 16, fontWeight: '900', color: '#111827'},
  price: {fontWeight: '900', color: '#111827'},
  stock: {color: '#6B7280', fontWeight: '700'},
  addBtn: {
    width: 44,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {opacity: 0.4},
});

