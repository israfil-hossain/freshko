"use client";

import { useGet } from "@/hooks/useGet";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Order } from "@/types";

export default function MyOrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; orders: Order[] }>(
    ["orders"],
    "/api/order/user",
    { enabled: !!user }
  );

  useEffect(() => {
    if (!user && !useAuthStore.getState().isLoading) {
      router.push("/");
    }
  }, [user, router]);

  const orders = data?.orders || [];

  return (
    <main className="py-8">
      <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="p-5 border border-gray-200 rounded-lg">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <p key={item._id} className="text-sm">
                      <span className="font-medium">{item.product.name}</span>
                      <span className="text-primary ml-2">x {item.quantity}</span>
                    </p>
                  ))}
                </div>

                <div className="text-sm text-gray-500">
                  <p><span className="text-black/80 font-medium">{order.address.firstName} {order.address.lastName}</span></p>
                  <p>House {order.address.houseNumber}, Road {order.address.roadNumber}, Floor {order.address.floorNumber}, {order.address.city}</p>
                  <p>{order.address.phone}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-lg">{currency}{order.amount}</p>
                  <p className="text-xs text-gray-400">{order.paymentType} • {order.isPaid ? "Paid" : "Pending"}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className={`text-xs mt-1 ${order.deliveryStatus === "delivered" ? "text-green-600" : "text-blue-600"}`}>
                    {order.deliveryStatus?.replace("-", " ") || "unassigned"}
                  </p>
                  <button
                    onClick={() => router.push(`/my-orders/${order._id}/tracking`)}
                    className="mt-2 text-xs bg-primary text-white px-3 py-1.5 rounded cursor-pointer"
                  >
                    Track
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
