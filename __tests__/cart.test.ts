import {clearCart, loadCart, saveCart} from '../src/utils/cartStorage';

jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('cartStorage', () => {
  it('saves and loads cart items', async () => {
    const cart = [
      {id: 'p1', name: 'Tomatoes', price: 1500, quantity: 2},
      {id: 'p2', name: 'Rice', price: 8500, quantity: 1},
    ];

    await saveCart(cart);
    const loaded = await loadCart();

    expect(loaded).toEqual(cart);
  });

  it('clears stored cart items', async () => {
    await saveCart([{id: 'p1', name: 'Tomatoes', price: 1500, quantity: 2}]);
    await clearCart();
    const loaded = await loadCart();
    expect(loaded).toEqual([]);
  });
});

