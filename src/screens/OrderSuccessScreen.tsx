import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderSuccess'>;

export default function OrderSuccessScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.safe,
        {paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12)},
      ]}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={88} color="#16A34A" />
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your order has been confirmed and will be ready soon.
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.reset({index: 0, routes: [{name: 'NearbyStores'}]})
          }
          activeOpacity={0.9}
          style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 24},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
  iconWrap: {marginBottom: 6},
  title: {fontSize: 22, fontWeight: '900', color: '#111827', textAlign: 'center'},
  subtitle: {color: '#6B7280', fontWeight: '600', textAlign: 'center', lineHeight: 20},
  primaryBtn: {
    marginTop: 10,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {color: '#fff', fontWeight: '900', fontSize: 16},
});

