"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { getProductById } from "@/lib/data/products";
import type { CartItem, ProductSummary } from "@/lib/types";

const STORAGE_KEY = "plantia-cart";
const EMPTY_ITEMS: CartItem[] = [];

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

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedItems: CartItem[] = EMPTY_ITEMS;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    if (!raw) {
      cachedItems = EMPTY_ITEMS;
      return cachedItems;
    }
    const parsed = JSON.parse(raw) as CartItem[];
    cachedItems = Array.isArray(parsed) ? parsed : EMPTY_ITEMS;
    return cachedItems;
  } catch {
    cachedItems = EMPTY_ITEMS;
    cachedRaw = null;
    return cachedItems;
  }
}

function writeItems(next: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedRaw = JSON.stringify(next);
  cachedItems = next.length === 0 ? EMPTY_ITEMS : next;
  emit();
}

function getServerSnapshot() {
  return EMPTY_ITEMS;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, getServerSnapshot);

  const addItem = useCallback(
    (
      productId: string,
      quantity = 1,
      options?: { selectedSize?: string; selectedColor?: string },
    ) => {
      const prev = readItems();
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        writeItems(
          prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(99, i.quantity + quantity) }
              : i,
          ),
        );
        return;
      }
      writeItems([
        ...prev,
        {
          productId,
          quantity: Math.min(99, Math.max(1, quantity)),
          ...options,
        },
      ]);
    },
    [],
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const prev = readItems();
    if (quantity < 1) {
      writeItems(prev.filter((i) => i.productId !== productId));
      return;
    }
    writeItems(
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(99, quantity) }
          : i,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    writeItems(readItems().filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => writeItems([]), []);

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
