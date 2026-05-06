import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {RootStackParamList} from '../types/navigation';
import {
  deleteProduct,
  getProductsByMerchantStore,
  type Product,
} from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'MerchantStoreProducts'>;

function toPriceText(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return `₦${value.toLocaleString()}`;
  if (typeof value === 'string') return value;
  return '—';
}

export default function MerchantStoreProductsScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {storeId, storeName} = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductsByMerchantStore(storeId);
      setProducts(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  async function onConfirmDelete(item: Product) {
    const id = item.id;
    if (id == null) {
      Alert.alert('Cannot delete', 'This product has no id.');
      return;
    }
    setDeletingId(id);
    try {
      await deleteProduct(id);
      const data = await getProductsByMerchantStore(storeId);
      setProducts(data);
    } catch (e: any) {
      Alert.alert('Delete failed', e?.message ?? 'Could not delete product.');
    } finally {
      setDeletingId(null);
    }
  }

  function promptDelete(item: Product) {
    Alert.alert(
      'Delete product',
      `Remove "${item.name}"? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: () => void onConfirmDelete(item)},
      ],
    );
  }

  const actionsDisabled = loading || deletingId != null;

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
          style={styles.iconBtn}
          disabled={actionsDisabled}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {storeName}
          </Text>
          <Text style={styles.topSubtitle}>Products</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CreateProduct', {
              storeId: String(storeId),
              storeName,
            })
          }
          activeOpacity={0.85}
          disabled={actionsDisabled}
          style={styles.addHeaderBtn}
          accessibilityLabel="Add product">
          <Text style={styles.addHeaderBtnText} numberOfLines={1}>
            + Add Product
          </Text>
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
          style={styles.listFlex}
          data={products}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={
            products.length === 0 ? styles.emptyContainer : styles.list
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No products yet</Text>
              <Text style={styles.emptySubtitle}>Add your first product</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={actionsDisabled}
                onPress={() =>
                  navigation.navigate('CreateProduct', {
                    storeId: String(storeId),
                    storeName,
                  })
                }
                style={[styles.primaryBtn, actionsDisabled && styles.primaryBtnDisabled]}>
                <Text style={styles.primaryBtnText}>+ Add Product</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({item}) => {
            const deletingThis = deletingId != null && deletingId === item.id;
            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>{toPriceText(item.price)}</Text>
                </View>
                <View style={[styles.row, {marginTop: 10}]}>
                  <Text style={styles.stock}>
                    Stock: {typeof item.stock === 'number' ? item.stock : '—'}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={actionsDisabled}
                      onPress={() =>
                        navigation.navigate('CreateProduct', {
                          storeId: String(storeId),
                          storeName,
                          product: item,
                        })
                      }
                      style={styles.actionBtn}
                      accessibilityLabel="Edit product">
                      <Ionicons name="pencil" size={20} color="#374151" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={actionsDisabled}
                      onPress={() => promptDelete(item)}
                      style={[styles.actionBtn, styles.dangerBtn]}
                      accessibilityLabel="Delete product">
                      {deletingThis ? (
                        <ActivityIndicator size="small" color="#B00020" />
                      ) : (
                        <Ionicons name="trash-outline" size={20} color="#B00020" />
                      )}
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
    gap: 8,
  },
  topTitle: {fontSize: 18, fontWeight: '900', color: '#111827'},
  topSubtitle: {marginTop: 2, fontSize: 12, color: '#6B7280', fontWeight: '600'},
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  addHeaderBtn: {
    maxWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(22,163,74,0.1)',
    justifyContent: 'center',
  },
  addHeaderBtnText: {color: '#16A34A', fontWeight: '900', fontSize: 13},
  listFlex: {flex: 1},
  list: {paddingHorizontal: 16, paddingVertical: 16, gap: 12},
  emptyContainer: {flexGrow: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8},
  muted: {color: '#6B7280', fontWeight: '600'},
  emptyTitle: {fontSize: 18, fontWeight: '900', color: '#111827'},
  emptySubtitle: {color: '#6B7280', fontWeight: '600', textAlign: 'center'},
  primaryBtn: {
    marginTop: 12,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  primaryBtnDisabled: {opacity: 0.5},
  primaryBtnText: {color: '#fff', fontWeight: '900', fontSize: 15},
  errorTitle: {fontSize: 18, fontWeight: '900', color: '#b00020'},
  errorBody: {color: '#333', textAlign: 'center'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
  },
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  name: {flex: 1, fontSize: 16, fontWeight: '900', color: '#111827'},
  price: {fontWeight: '900', color: '#111827'},
  stock: {color: '#6B7280', fontWeight: '700'},
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
