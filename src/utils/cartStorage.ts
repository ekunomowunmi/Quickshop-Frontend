import AsyncStorage from '@react-native-async-storage/async-storage';
import type {CartItem} from '../context/CartContext';

const CART_KEY = 'cart_items_v1';

export async function saveCart(cart: CartItem[]): Promise<void> {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export async function loadCart(): Promise<CartItem[]> {
  const raw = await AsyncStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export async function clearCart(): Promise<void> {
  await AsyncStorage.removeItem(CART_KEY);
}

