import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {useCart} from '../context/CartContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

function formatMoney(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

export default function CartScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {items, total, increase, decrease, remove} = useCart();

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
        <Text style={styles.topTitle}>Cart</Text>
        <View style={{width: 40}} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
            style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            renderItem={({item}) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Remove item"
                    onPress={() => remove(item.id)}
                    activeOpacity={0.8}
                    style={styles.trashBtn}>
                    <MaterialIcons name="delete" size={20} color="#B00020" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.row, {marginTop: 10}]}>
                  <Text style={styles.price}>
                    {formatMoney(item.price)}{' '}
                    <Text style={styles.muted}>× {item.quantity}</Text>
                  </Text>

                  <View style={styles.qty}>
                    <TouchableOpacity
                      onPress={() => decrease(item.id)}
                      activeOpacity={0.8}
                      style={styles.qtyBtn}>
                      <Ionicons name="remove" size={18} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => increase(item.id)}
                      activeOpacity={0.8}
                      style={styles.qtyBtn}>
                      <Ionicons name="add" size={18} color="#111827" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.bottom}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMoney(total)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.9}
              style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
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
  topTitle: {flex: 1, fontSize: 18, fontWeight: '800', color: '#111827'},
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  pressed: {opacity: 0.85},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14},
  emptyText: {color: '#6B7280', fontWeight: '600'},
  list: {paddingHorizontal: 16, paddingVertical: 16, gap: 12},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
  },
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  name: {flex: 1, fontWeight: '800', color: '#111827', fontSize: 16},
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
  },
  price: {fontWeight: '800', color: '#111827'},
  muted: {color: '#6B7280', fontWeight: '600'},
  qty: {flexDirection: 'row', alignItems: 'center', gap: 10},
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {minWidth: 18, textAlign: 'center', fontWeight: '800', color: '#111827'},
  bottom: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  totalRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  totalLabel: {color: '#374151', fontWeight: '700'},
  totalValue: {color: '#16A34A', fontWeight: '900', fontSize: 16},
  primaryBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {color: '#fff', fontWeight: '800', fontSize: 16},
});

