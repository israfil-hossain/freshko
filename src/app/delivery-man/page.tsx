"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDeliveryManStore } from "@/stores/deliveryManStore";

export default function DeliveryManHome() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useDeliveryManStore();

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        router.replace("/delivery-man/dashboard");
      }
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return null;
}
