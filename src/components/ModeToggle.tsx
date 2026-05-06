import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {AppMode} from '../context/AppModeContext';

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}) {
  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onChange('CUSTOMER')}
        style={[styles.btn, mode === 'CUSTOMER' && styles.activeBtn]}>
        <Text style={[styles.text, mode === 'CUSTOMER' && styles.activeText]}>
          Customer
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onChange('MERCHANT')}
        style={[styles.btn, mode === 'MERCHANT' && styles.activeBtn]}>
        <Text style={[styles.text, mode === 'MERCHANT' && styles.activeText]}>
          Merchant
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 3,
    gap: 6,
    alignSelf: 'flex-start',
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeBtn: {backgroundColor: '#fff'},
  text: {fontSize: 12, fontWeight: '800', color: '#6B7280'},
  activeText: {color: '#111827'},
});

