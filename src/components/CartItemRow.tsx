import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type CartItemRowProps = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onRemove: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
};

function formatMoney(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

function CartItemRowBase({
  id,
  name,
  price,
  quantity,
  onRemove,
  onIncrease,
  onDecrease,
}: CartItemRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Remove item"
          onPress={() => onRemove(id)}
          activeOpacity={0.8}
          style={styles.trashBtn}>
          <MaterialIcons name="delete" size={20} color="#B00020" />
        </TouchableOpacity>
      </View>

      <View style={[styles.row, {marginTop: 10}]}>
        <Text style={styles.price}>
          {formatMoney(price)} <Text style={styles.muted}>× {quantity}</Text>
        </Text>

        <View style={styles.qty}>
          <TouchableOpacity
            onPress={() => onDecrease(id)}
            activeOpacity={0.8}
            style={styles.qtyBtn}>
            <Ionicons name="remove" size={18} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => onIncrease(id)}
            activeOpacity={0.8}
            style={styles.qtyBtn}>
            <Ionicons name="add" size={18} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const CartItemRow = memo(CartItemRowBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEF2F7',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
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
  qtyValue: {
    minWidth: 18,
    textAlign: 'center',
    fontWeight: '800',
    color: '#111827',
  },
});

