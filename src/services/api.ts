import AsyncStorage from '@react-native-async-storage/async-storage';

export type NearbyStore = {
  id?: string | number;
  name: string;
  address?: string;
  distanceMeters?: number;
  distance?: number;
  distance_meters?: number;
  [key: string]: unknown;
};

export type Product = {
  id?: string | number;
  name: string;
  price?: number;
  stock?: number;
  description?: string;
  [key: string]: unknown;
};

export type Store = {
  id: string | number;
  name: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
};

export type CreateStoreInput = {
  name: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
};

export type CreateProductInput = {
  name: string;
  price: number;
  stock: number;
  description?: string;
  store_id: string;
};

export type OrderItem = {
  id?: string | number;
  name?: string;
  quantity?: number;
  price?: number;
  [key: string]: unknown;
};

export type Order = {
  id: string | number;
  status?: string;
  total?: number;
  items?: OrderItem[];
  [key: string]: unknown;
};

export type AuthUser = {
  id?: string | number;
  name?: string;
  phone?: string;
  role?: string;
  [key: string]: unknown;
};

export type LoginResponse = {
  access_token: string;
  user?: AuthUser;
  [key: string]: unknown;
};

// IMPORTANT: replace YOUR_LOCAL_IP with your machine IP, e.g. http://192.168.1.5:3000
const BASE_URL = 'http://192.168.3.9:3000';
// const BASE_URL = 'http://10.128.160.235:3000';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user_v1';

export async function getAccessToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function setCurrentUser(user: AuthUser | null): Promise<void> {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function logout(): Promise<void> {
  await Promise.all([clearAccessToken(), setCurrentUser(null)]);
}

function normalizeStoresResponse(json: unknown): NearbyStore[] {
  if (Array.isArray(json)) return json as NearbyStore[];
  if (json && typeof json === 'object') {
    const obj = json as any;
    if (Array.isArray(obj.stores)) return obj.stores as NearbyStore[];
    if (Array.isArray(obj.data)) return obj.data as NearbyStore[];
  }
  throw new Error('Unexpected response from /stores/nearby');
}

function normalizeProductsResponse(json: unknown): Product[] {
  if (Array.isArray(json)) return json as Product[];
  if (json && typeof json === 'object') {
    const obj = json as any;
    if (Array.isArray(obj.products)) return obj.products as Product[];
    if (Array.isArray(obj.data)) return obj.data as Product[];
  }
  throw new Error('Unexpected response from /products/store/:storeId');
}

function normalizeMyStoresResponse(json: unknown): Store[] {
  if (Array.isArray(json)) return json as Store[];
  if (json && typeof json === 'object') {
    const obj = json as any;
    if (Array.isArray(obj.stores)) return obj.stores as Store[];
    if (Array.isArray(obj.data)) return obj.data as Store[];
  }
  throw new Error('Unexpected response from /stores/my');
}

function normalizeOrdersResponse(json: unknown): Order[] {
  if (Array.isArray(json)) return json as Order[];
  if (json && typeof json === 'object') {
    const obj = json as any;
    if (Array.isArray(obj.orders)) return obj.orders as Order[];
    if (Array.isArray(obj.data)) return obj.data as Order[];
  }
  throw new Error('Unexpected response from /orders/my');
}

async function requestJson(path: string, init: RequestInit): Promise<unknown> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {Accept: 'application/json'};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    console.log('json res', res);
    const message =
      (json as any)?.message ||
      (json as any)?.error ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return json;
}

async function getJson(path: string): Promise<unknown> {
  return await requestJson(path, {method: 'GET'});
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  return await requestJson(path, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
}

async function patchJson(path: string, body: unknown): Promise<unknown> {
  return await requestJson(path, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
}

async function deleteJson(path: string): Promise<unknown> {
  return await requestJson(path, {method: 'DELETE'});
}

function normalizeSingleProduct(json: unknown): Product {
  if (!json || typeof json !== 'object') {
    throw new Error('Unexpected response from /products');
  }
  const obj = json as any;
  const p = obj.product ?? obj.data ?? obj;
  if (!p || typeof p !== 'object') {
    throw new Error('Unexpected response from /products');
  }
  return p as Product;
}

function normalizeStoreResponse(json: unknown): Store {
  if (!json || typeof json !== 'object') {
    throw new Error('Unexpected response from /stores');
  }
  const obj = json as any;
  const store = obj.store ?? obj.data ?? obj;
  if (!store || typeof store !== 'object') {
    throw new Error('Unexpected response from /stores');
  }
  return store as Store;
}

function normalizeLoginResponse(json: unknown): LoginResponse {
  if (!json || typeof json !== 'object') {
    throw new Error('Unexpected response from /auth/login');
  }
  const obj = json as any;
  if (typeof obj.access_token !== 'string') {
    throw new Error('Login response missing access_token');
  }

  const rawUser = obj.user ?? obj;
  const roleRaw = rawUser?.role;
  const role =
    roleRaw === 'STORE_OWNER' || roleRaw === 'CUSTOMER'
      ? roleRaw
      : roleRaw === 'store_owner'
        ? 'STORE_OWNER'
        : roleRaw === 'customer'
          ? 'CUSTOMER'
          : undefined;

  const user: AuthUser | undefined =
    rawUser && (rawUser.id != null || rawUser.phone != null || rawUser.name != null || role)
      ? {
          id: rawUser.id,
          name: rawUser.name,
          phone: rawUser.phone,
          role,
        }
      : undefined;

  return {
    ...(obj as LoginResponse),
    user: user ?? (obj.user as AuthUser | undefined),
  };
}

export async function login(
  phone: string,
  password: string,
): Promise<LoginResponse> {
  const json = await postJson('/auth/login', {phone, password});
  const data = normalizeLoginResponse(json);
  await setAccessToken(data.access_token);
  await setCurrentUser(data.user ?? null);
  return data;
}

export async function registerUser(input: {
  name: string;
  phone: string;
  password: string;
  role: 'CUSTOMER' | 'STORE_OWNER';
}): Promise<unknown> {
  return await postJson('/auth/register', input);
}

export async function getNearbyStores(): Promise<NearbyStore[]> {
  throw new Error('Use getNearbyStoresSmart(payload) instead');
}

export type NearbyStoresPayload =
  | {latitude: number; longitude: number}
  | {address: string};

export async function getNearbyStoresSmart(
  payload: NearbyStoresPayload,
): Promise<NearbyStore[]> {
  const json = await postJson('/stores/nearby', payload);
  return normalizeStoresResponse(json);
}

export async function getProductsByStore(
  storeId: string | number,
): Promise<Product[]> {
  const json = await getJson(`/products/store/${encodeURIComponent(String(storeId))}`);
  return normalizeProductsResponse(json);
}

export async function getMyStores(): Promise<Store[]> {
  const json = await getJson('/stores/my');
  return normalizeMyStoresResponse(json);
}

export async function getProductsByMerchantStore(
  storeId: string | number,
): Promise<Product[]> {
  const json = await getJson(`/stores/${encodeURIComponent(String(storeId))}/products`);
  return normalizeProductsResponse(json);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const json = await postJson('/products', input);
  return normalizeSingleProduct(json);
}

export async function updateProduct(
  productId: string | number,
  input: CreateProductInput,
): Promise<Product> {
  const json = await patchJson(
    `/products/${encodeURIComponent(String(productId))}`,
    input,
  );
  return normalizeSingleProduct(json);
}

export async function deleteProduct(productId: string | number): Promise<void> {
  await deleteJson(`/products/${encodeURIComponent(String(productId))}`);
}

export async function getMyOrders(): Promise<Order[]> {
  const json = await getJson('/orders/my');
  return normalizeOrdersResponse(json);
}

export async function createStore(input: CreateStoreInput): Promise<Store> {
  const user = await getCurrentUser();
  const ownerId = user?.id != null ? String(user.id).trim() : '';
  if (!ownerId) {
    throw new Error(
      'Missing store owner. Log out and log in again, then retry creating a store.',
    );
  }

  const json = await postJson('/stores', {
    ...input,
    ownerId,
  });
  return normalizeStoreResponse(json);
}

