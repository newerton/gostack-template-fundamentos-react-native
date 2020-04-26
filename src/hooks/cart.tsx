import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const storageKey = '@GoMarketplace:products';

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(storageKey);
      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExistsKey = products.findIndex(p => p.id === product.id);
      if (productExistsKey >= 0) {
        products[productExistsKey].quantity += 1;
      } else {
        products.push({ ...product, quantity: 1 });
      }

      setProducts([...products]);
      await AsyncStorage.setItem(storageKey, JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productExistsKey = products.findIndex(p => p.id === id);
      products[productExistsKey].quantity += 1;
      setProducts([...products]);
      await AsyncStorage.setItem(storageKey, JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productExistsKey = products.findIndex(p => p.id === id);

      const newProduct = [...products];

      if (newProduct[productExistsKey].quantity > 1) {
        newProduct[productExistsKey].quantity -= 1;
      } else {
        newProduct.splice(productExistsKey, 1);
      }

      setProducts(newProduct);
      await AsyncStorage.setItem(storageKey, JSON.stringify(newProduct));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
