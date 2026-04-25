import React, {createContext, useContext, useMemo, useState} from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: {id: string; name: string; price: number}) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    function addItem(item: {id: string; name: string; price: number}) {
      setItems(prev => {
        const idx = prev.findIndex(p => p.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {...next[idx], quantity: next[idx].quantity + 1};
          return next;
        }
        return [...prev, {...item, quantity: 1}];
      });
    }

    function increase(id: string) {
      setItems(prev =>
        prev.map(p => (p.id === id ? {...p, quantity: p.quantity + 1} : p)),
      );
    }

    function decrease(id: string) {
      setItems(prev =>
        prev
          .map(p => (p.id === id ? {...p, quantity: p.quantity - 1} : p))
          .filter(p => p.quantity > 0),
      );
    }

    function remove(id: string) {
      setItems(prev => prev.filter(p => p.id !== id));
    }

    function clear() {
      setItems([]);
    }

    return {items, itemCount, total, addItem, increase, decrease, remove, clear};
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

