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

const TOKEN_KEY = 'access_token';

export async function getAccessToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function setAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
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

function normalizeLoginResponse(json: unknown): LoginResponse {
  if (!json || typeof json !== 'object') {
    throw new Error('Unexpected response from /auth/login');
  }
  const obj = json as any;
  if (typeof obj.access_token !== 'string') {
    throw new Error('Login response missing access_token');
  }
  return obj as LoginResponse;
}

export async function login(
  phone: string,
  password: string,
): Promise<LoginResponse> {
  const json = await postJson('/auth/login', {phone, password});
  const data = normalizeLoginResponse(json);
  await setAccessToken(data.access_token);
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
  const json = await getJson('/stores/nearby?lat=6.45&lng=3.4');
  return normalizeStoresResponse(json);
}

export async function getProductsByStore(
  storeId: string | number,
): Promise<Product[]> {
  const json = await getJson(`/products/store/${encodeURIComponent(String(storeId))}`);
  return normalizeProductsResponse(json);
}

