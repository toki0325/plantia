"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProductById } from "@/lib/data/products";
import type { CartItem, ProductSummary } from "@/lib/types";

const STORAGE_KEY = "plantia-cart";

export type CartLine = CartItem & {
  product: ProductSummary;
  lineTotal: number;
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  addItem: (
    productId: string,
    quantity?: number,
    options?: { selectedSize?: string; selectedColor?: string },
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveItems(items);
  }, [items, hydrated]);

  const addItem = useCallback(
    (
      productId: string,
      quantity = 1,
      options?: { selectedSize?: string; selectedColor?: string },
    ) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
              : i,
          );
        }
        return [
          ...prev,
          {
            productId,
            quantity: Math.min(99, Math.max(1, quantity)),
            ...options,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity < 1) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(99, quantity) }
          : i,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        const summary: ProductSummary = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          freeShipping: product.freeShipping,
        };
        return {
          ...item,
          product: summary,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter(Boolean) as CartLine[];
  }, [items]);

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  const value = useMemo(
    () => ({
      items: lines,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [lines, count, subtotal, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
