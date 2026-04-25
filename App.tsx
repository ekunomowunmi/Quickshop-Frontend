import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NearbyStoresScreen from './src/screens/NearbyStoresScreen';
import StoreProductsScreen from './src/screens/StoreProductsScreen';
import type {RootStackParamList} from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="NearbyStores">
          <Stack.Screen
            name="NearbyStores"
            component={NearbyStoresScreen}
            options={{title: 'Nearby Stores'}}
          />
          <Stack.Screen
            name="StoreProducts"
            component={StoreProductsScreen}
            options={({route}) => ({title: route.params.storeName})}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

