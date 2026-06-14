"use client";

import { create } from "zustand";
import api from "@/lib/axios";

interface WalletState {
  balance: number;
  transactions: any[];
  isLoading: boolean;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  credit: (amount: number, description: string) => Promise<void>;
  debit: (amount: number, description: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>()((set) => ({
  balance: 0,
  transactions: [],
  isLoading: false,

  fetchBalance: async () => {
    try {
      const { data } = await api.get("/api/wallet/balance");
      if (data.success) {
        set({ balance: data.balance });
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    }
  },

  fetchTransactions: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get("/api/wallet/transactions");
      if (data.success) {
        set({ transactions: data.transactions });
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  credit: async (amount: number, description: string) => {
    try {
      const { data } = await api.post("/api/wallet/credit", { amount, description });
      if (data.success) {
        set({ balance: data.newBalance });
      }
    } catch (error) {
      console.error("Failed to credit wallet:", error);
    }
  },

  debit: async (amount: number, description: string) => {
    try {
      const { data } = await api.post("/api/wallet/debit", { amount, description });
      if (data.success) {
        set({ balance: data.newBalance });
      }
    } catch (error) {
      console.error("Failed to debit wallet:", error);
    }
  },
}));
