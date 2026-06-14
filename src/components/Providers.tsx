"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useSocketStore } from "@/lib/socket";

export function Providers({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const fetchSeller = useAuthStore((s) => s.fetchSeller);
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const syncCart = useCartStore((s) => s.syncCart);
  const connectSocket = useSocketStore((s) => s.connect);
  const disconnectSocket = useSocketStore((s) => s.disconnect);

  useEffect(() => {
    fetchUser();
    fetchSeller();
  }, []);

  useEffect(() => {
    if (user) {
      syncCart();
      connectSocket(user._id);
    } else {
      disconnectSocket();
    }
  }, [items, user]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
      {children}
    </QueryClientProvider>
  );
}
