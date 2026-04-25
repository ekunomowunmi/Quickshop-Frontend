import React, {useCallback} from 'react';
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
import {CartItemRow} from '../components/CartItemRow';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

function formatMoney(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

export default function CartScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const {items, total, increase, decrease, remove} = useCart();

  const renderItem = useCallback(
    ({item}: {item: (typeof items)[number]}) => (
      <CartItemRow
        id={item.id}
        name={item.name}
        price={item.price}
        quantity={item.quantity}
        onRemove={remove}
        onIncrease={increase}
        onDecrease={decrease}
      />
    ),
    [decrease, increase, remove],
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
            renderItem={renderItem}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
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

