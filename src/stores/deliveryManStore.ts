"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";

interface DeliveryManAuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  deliveryMan: { name: string; email: string } | null;
  setIsLoggedIn: (val: boolean) => void;
  setDeliveryMan: (dm: { name: string; email: string } | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useDeliveryManStore = create<DeliveryManAuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      isLoading: true,
      deliveryMan: null,

      setIsLoggedIn: (val) => set({ isLoggedIn: val }),
      setDeliveryMan: (dm) => set({ deliveryMan: dm }),

      checkAuth: async () => {
        try {
          const { data } = await api.get("/api/delivery-man/is-auth");
          if (data.success) {
            set({ isLoggedIn: true, deliveryMan: data.deliveryMan });
          } else {
            set({ isLoggedIn: false, deliveryMan: null });
          }
        } catch {
          set({ isLoggedIn: false, deliveryMan: null });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.get("/api/delivery-man/logout");
          set({ isLoggedIn: false, deliveryMan: null });
        } catch {
          console.error("Logout failed");
        }
      },
    }),
    { name: "delivery-man-storage", partialize: (state) => ({ isLoggedIn: state.isLoggedIn }) }
  )
);
