"use client";

import { useGet } from "@/hooks/useGet";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import type { Order } from "@/types";

export default function MyOrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; orders: Order[] }>(
    ["orders"], "/api/order/user", { enabled: !!user }
  );

  useEffect(() => {
    if (!user && !useAuthStore.getState().isLoading) router.push("/");
  }, [user, router]);

  const orders = data?.orders || [];

  const statusColors: Record<string, string> = {
    unassigned: "bg-gray-100 text-gray-600",
    assigned: "bg-blue-50 text-blue-700",
    "picked-up": "bg-yellow-50 text-yellow-700",
    "in-transit": "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-600",
  };

  return (
    <main className="py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">My Orders</h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h3 className="font-semibold text-foreground mb-1">No orders yet</h3>
          <p className="text-sm text-muted">Your orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-border-light p-5 hover:shadow-sm transition-all animate-fade-in">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      {item.product.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} width={44} height={44}
                          className="rounded-xl object-cover w-11 h-11 border border-border-light" />
                      ) : (
                        <div className="w-11 h-11 bg-surface-hover rounded-xl" />
                      )}
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{item.product.name}</span>
                        <span className="text-primary font-medium ml-2">x {item.quantity}</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-sm max-w-xs">
                  <p className="font-semibold text-foreground">{order.address.firstName} {order.address.lastName}</p>
                  <p className="text-muted mt-0.5">House {order.address.houseNumber}, Road {order.address.roadNumber}</p>
                  <p className="text-muted">{order.address.city}</p>
                  <p className="text-muted">{order.address.phone}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">{currency}{order.amount}</p>
                  <p className="text-xs text-muted">{order.paymentType} • {order.isPaid ? "Paid" : "Pending"}</p>
                  <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-lg mt-2 ${statusColors[order.deliveryStatus] || "bg-gray-100 text-gray-600"}`}>
                    {order.deliveryStatus?.replace("-", " ") || "unassigned"}
                  </span>
                  <div className="mt-2">
                    <button onClick={() => router.push(`/my-orders/${order._id}/tracking`)}
                      className="text-xs border border-primary/30 text-primary px-3 py-1.5 rounded-xl hover:bg-primary/5 transition-all cursor-pointer font-medium">
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
