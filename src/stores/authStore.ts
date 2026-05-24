"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import api from "@/lib/axios";

interface AuthState {
  user: User | null;
  isSeller: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsSeller: (val: boolean) => void;
  fetchUser: () => Promise<void>;
  fetchSeller: () => Promise<void>;
  logout: () => Promise<void>;
  sellerLogout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isSeller: false,
      isLoading: true,

      setUser: (user) => set({ user }),
      setIsSeller: (val) => set({ isSeller: val }),

      fetchUser: async () => {
        try {
          const { data } = await api.get("/api/user/is-auth");
          if (data.success) {
            set({ user: data.user });
          } else {
            set({ user: null });
          }
        } catch {
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchSeller: async () => {
        try {
          const { data } = await api.get("/api/seller/is-auth");
          set({ isSeller: data.success });
        } catch {
          set({ isSeller: false });
        }
      },

      logout: async () => {
        try {
          await api.get("/api/user/logout");
          set({ user: null });
        } catch {
          console.error("Logout failed");
        }
      },

      sellerLogout: async () => {
        try {
          await api.get("/api/seller/logout");
          set({ isSeller: false });
        } catch {
          console.error("Seller logout failed");
        }
      },
    }),
    { name: "auth-storage", partialize: (state) => ({ isSeller: state.isSeller }) }
  )
);
