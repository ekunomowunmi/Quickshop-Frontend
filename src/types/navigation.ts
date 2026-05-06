import type {Product} from '../services/api';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  NearbyStores: undefined;
  StoreProducts: {storeId: string; storeName: string};
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: undefined;
  MerchantDashboard: undefined;
  Profile: undefined;
  MyStores: undefined;
  CreateStore: undefined;
  MerchantStoreProducts: {storeId: string; storeName: string};
  CreateProduct: {storeId: string; storeName?: string; product?: Product};
  MerchantOrders: undefined;
};
