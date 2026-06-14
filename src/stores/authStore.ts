"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import api from "@/lib/axios";

interface AuthState {
  user: User | null;
  isSeller: boolean;
  isLoading: boolean;
  walletBalance: number;
  setUser: (user: User | null) => void;
  setIsSeller: (val: boolean) => void;
  fetchUser: () => Promise<void>;
  fetchSeller: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => Promise<void>;
  sellerLogout: () => Promise<void>;
  updateWallet: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isSeller: false,
      isLoading: true,
      walletBalance: 0,

      setUser: (user) => set({ user }),
      setIsSeller: (val) => set({ isSeller: val }),
      updateWallet: (amount) => set((state) => ({ walletBalance: state.walletBalance + amount })),

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

      login: async (email, password) => {
        try {
          const { data } = await api.post("/api/user/login", { email, password });
          if (data.success) {
            set({ user: data.user });
            return { success: true, user: data.user };
          }
          return { success: false, message: data.message };
        } catch (err: any) {
          return { success: false, message: err.message || "Login failed" };
        }
      },

      register: async (name, email, password) => {
        try {
          const { data } = await api.post("/api/user/register", { name, email, password });
          if (data.success) {
            set({ user: data.user });
            return { success: true, user: data.user };
          }
          return { success: false, message: data.message };
        } catch (err: any) {
          return { success: false, message: err.message || "Registration failed" };
        }
      },

      googleLogin: async (idToken) => {
        try {
          const { data } = await api.post("/api/user/google-login", { idToken });
          if (data.success) {
            set({ user: data.user });
            return { success: true, user: data.user };
          }
          return { success: false, message: data.message };
        } catch (err: any) {
          return { success: false, message: err.message || "Google login failed" };
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
    { name: "auth-storage", partialize: (state) => ({ user: state.user, isSeller: state.isSeller }) }
  )
);
