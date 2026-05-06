import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NearbyStoresScreen from './src/screens/NearbyStoresScreen';
import StoreProductsScreen from './src/screens/StoreProductsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import type {RootStackParamList} from './src/types/navigation';
import {getAccessToken} from './src/services/api';
import {CartProvider} from './src/context/CartContext';
import {AppModeProvider, useAppMode} from './src/context/AppModeContext';
import MerchantDashboardScreen from './src/screens/MerchantDashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyStoresScreen from './src/screens/MyStoresScreen';
import CreateStoreScreen from './src/screens/CreateStoreScreen';
import MerchantStoreProductsScreen from './src/screens/MerchantStoreProductsScreen';
import CreateProductScreen from './src/screens/CreateProductScreen';
import MerchantOrdersScreen from './src/screens/MerchantOrdersScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [booting, setBooting] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!cancelled) setIsAuthed(!!token);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      {booting ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <AppModeProvider>
          <CartProvider>
            <AppNavigator isAuthed={isAuthed} />
          </CartProvider>
        </AppModeProvider>
      )}
    </SafeAreaProvider>
  );
}

function AppNavigator({isAuthed}: {isAuthed: boolean}) {
  const {ready, isStoreOwner, mode} = useAppMode();

  if (!ready) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const initial =
    !isAuthed
      ? 'Login'
      : isStoreOwner && mode === 'MERCHANT'
        ? 'MerchantDashboard'
        : 'NearbyStores';

  return (
    <NavigationContainer>
      <Stack.Navigator key={initial} initialRouteName={initial}>
        <Stack.Screen name="Login" component={LoginScreen} options={{title: 'Login'}} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{title: 'Register'}} />

        <Stack.Screen
          name="NearbyStores"
          component={NearbyStoresScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MerchantDashboard"
          component={MerchantDashboardScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MyStores"
          component={MyStoresScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CreateStore"
          component={CreateStoreScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MerchantStoreProducts"
          component={MerchantStoreProductsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CreateProduct"
          component={CreateProductScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MerchantOrders"
          component={MerchantOrdersScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="StoreProducts"
          component={StoreProductsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Cart" component={CartScreen} options={{headerShown: false}} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{headerShown: false}} />
        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

