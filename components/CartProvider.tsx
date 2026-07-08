"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string; // unique per line item
  type: "frame" | "collage_frame";
  sizeId: string;
  sizeLabel: string;
  unitPrice: number;
  quantity: number;
  designFee?: number;
  uploadedFileName?: string;
  uploadedFileUrl?: string;
  uploadedFileUrls?: string[];
  customTitle?: string;
  customCaption?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "capo-clicks-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: CartItem) => setItems((prev) => [...prev, item]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateQuantity = (id: string, quantity: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)));
  const clearCart = () => setItems([]);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.unitPrice + (i.designFee || 0)) * i.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
