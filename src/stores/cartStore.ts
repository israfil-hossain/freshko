"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";

interface CartState {
  items: Record<string, number>;
  setItems: (items: Record<string, number>) => void;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  getCartCount: () => number;
  getCartAmount: (products: { _id: string; offerPrice: number }[]) => number;
  syncCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      setItems: (items) => set({ items }),

      addToCart: (itemId) => {
        const items = { ...get().items };
        items[itemId] = (items[itemId] || 0) + 1;
        set({ items });
      },

      removeFromCart: (itemId) => {
        const items = { ...get().items };
        if (items[itemId]) {
          items[itemId] -= 1;
          if (items[itemId] <= 0) delete items[itemId];
        }
        set({ items });
      },

      updateCartItem: (itemId, quantity) => {
        const items = { ...get().items };
        if (quantity <= 0) {
          delete items[itemId];
        } else {
          items[itemId] = quantity;
        }
        set({ items });
      },

      getCartCount: () => {
        return Object.values(get().items).reduce((sum, qty) => sum + qty, 0);
      },

      getCartAmount: (products) => {
        const { items } = get();
        let total = 0;
        for (const id in items) {
          const product = products.find((p) => p._id === id);
          if (product && items[id] > 0) {
            total += product.offerPrice * items[id];
          }
        }
        return Math.floor(total * 100) / 100;
      },

      syncCart: async () => {
        try {
          await api.post("/api/cart/update", { cartItems: get().items });
        } catch {
          // silently fail — cart is synced optimistically
        }
      },
    }),
    { name: "cart-storage" }
  )
);
