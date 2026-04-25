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

// IMPORTANT: replace YOUR_LOCAL_IP with your machine IP, e.g. http://192.168.1.5:3000
const BASE_URL = 'http://192.168.3.9:3000';

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

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {Accept: 'application/json'},
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

