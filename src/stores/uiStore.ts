"use client";

import { create } from "zustand";

interface UIState {
  showUserLogin: boolean;
  searchQuery: string;
  currency: string;
  setShowUserLogin: (val: boolean) => void;
  setSearchQuery: (val: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  showUserLogin: false,
  searchQuery: "",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "৳",

  setShowUserLogin: (val) => set({ showUserLogin: val }),
  setSearchQuery: (val) => set({ searchQuery: val }),
}));
