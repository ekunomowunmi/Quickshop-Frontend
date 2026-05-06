import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {RootStackParamList} from '../types/navigation';
import {createProduct, updateProduct, type Product} from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateProduct'>;

function parsePrice(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseStock(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (!/^\d+$/.test(t)) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export default function CreateProductScreen({navigation, route}: Props) {
  const insets = useSafeAreaInsets();
  const {storeId, storeName, product} = route.params;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingId = product?.id;
  const isEdit = editingId != null;

  useEffect(() => {
    const p: Product | undefined = route.params.product;
    if (p && p.id != null) {
      setName(String(p.name ?? ''));
      setPrice(p.price != null && Number.isFinite(Number(p.price)) ? String(p.price) : '');
      setStock(
        typeof p.stock === 'number' && Number.isFinite(p.stock) ? String(Math.trunc(p.stock)) : '',
      );
      setDescription(typeof p.description === 'string' ? p.description : '');
    } else {
      setName('');
      setPrice('');
      setStock('');
      setDescription('');
    }
    setError(null);
  }, [route.params.product, route.params.storeId]);

  const canSubmit = useMemo(() => {
    const priceOk = parsePrice(price) != null;
    const stockOk = parseStock(stock) != null;
    return name.trim().length > 0 && priceOk && stockOk;
  }, [name, price, stock]);

  async function onSubmit() {
    setError(null);
    const priceNum = parsePrice(price);
    const stockNum = parseStock(stock);
    if (!name.trim()) {
      setError('Please enter a product name.');
      return;
    }
    if (priceNum == null) {
      setError('Please enter a valid price (0 or greater).');
      return;
    }
    if (stockNum == null) {
      setError('Please enter stock as a whole number (0 or greater).');
      return;
    }

    const descTrim = description.trim();
    const payload = {
      name: name.trim(),
      price: priceNum,
      stock: stockNum,
      ...(descTrim ? {description: descTrim} : {}),
      store_id: storeId,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      console.log('error', e);
      setError(e?.message ?? (isEdit ? 'Failed to update product.' : 'Failed to create product.'));
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          style={styles.iconBtn}
          disabled={loading}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        style={styles.scrollView}>
        {storeName ? (
          <Text style={styles.storeHint} numberOfLines={1}>
            Store: {storeName}
          </Text>
        ) : null}

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Bottled water 50cl"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={styles.input}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Stock</Text>
            <TextInput
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              style={styles.input}
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Short description"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textArea]}
              multiline
              editable={!loading}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            disabled={loading || !canSubmit}
            onPress={onSubmit}
            activeOpacity={0.9}
            style={[
              styles.primaryBtn,
              (!canSubmit || loading) && styles.primaryBtnDisabled,
            ]}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {isEdit ? 'Updating…' : 'Creating…'}
                </Text>
              </View>
            ) : (
              <Text style={styles.primaryBtnText}>
                {isEdit ? 'Update Product' : 'Add Product'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollView: {flex: 1},
  scroll: {paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 32},
  storeHint: {marginBottom: 10, color: '#6B7280', fontWeight: '700'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
    gap: 12,
  },
  field: {gap: 8},
  label: {color: '#374151', fontWeight: '700'},
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  textArea: {minHeight: 88, textAlignVertical: 'top'},
  error: {color: '#b00020', fontWeight: '700'},
  primaryBtn: {
    marginTop: 8,
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnDisabled: {opacity: 0.5},
  primaryBtnText: {color: '#fff', fontWeight: '900', fontSize: 16},
  loadingRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
});
