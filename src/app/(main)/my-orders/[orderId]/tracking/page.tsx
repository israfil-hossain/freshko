"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import type { Order } from "@/types";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("@/components/OrderMap"), { ssr: false });

const statusSteps = ["Order Placed", "assigned", "picked-up", "in-transit", "delivered"];

const stepLabels = [
  "Order Placed",
  "Assigned to Delivery",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{ success: boolean; orders: Order[] }>(
    ["order-tracking", orderId as string],
    "/api/order/user",
    { enabled: !!user, refetchInterval: 15000 }
  );

  const order = data?.orders?.find((o) => o._id === orderId) || null;

  useEffect(() => {
    if (!user && !useAuthStore.getState().isLoading) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  if (isLoading) {
    return (
      <main className="py-8 max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="py-8 max-w-4xl mx-auto px-4">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/my-orders" className="text-primary text-sm mt-2 inline-block">Back to orders</Link>
      </main>
    );
  }

  const deliveryStatus = order.deliveryStatus || "unassigned";
  const currentStepIndex = statusSteps.indexOf(deliveryStatus) >= 0
    ? statusSteps.indexOf(deliveryStatus)
    : 0;

  return (
    <main className="py-8 max-w-4xl mx-auto px-4">
      <Link href="/my-orders" className="text-primary text-sm mb-4 inline-block">&larr; Back to orders</Link>

      <h2 className="text-2xl font-semibold mb-2">Order Tracking</h2>
      <p className="text-gray-500 text-sm mb-6">Order #{order._id.slice(-8)}</p>

      {/* Progress Timeline */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          {stepLabels.map((label, i) => {
            const isCompleted = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={i} className="flex flex-col items-center flex-1 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-500 ${
                  isCompleted ? "bg-green-500 text-white scale-110" :
                  isCurrent ? "bg-primary text-white animate-pulse" :
                  "bg-gray-200 text-gray-400"
                }`}>
                  {isCompleted ? "✓" : i + 1}
                </div>
                <p className={`text-xs mt-2 text-center max-w-20 ${
                  isCompleted ? "text-green-600 font-medium" :
                  isCurrent ? "text-primary font-medium" :
                  "text-gray-400"
                }`}>
                  {label}
                </p>
                {i < stepLabels.length - 1 && (
                  <div className={`absolute top-5 left-[60%] w-[80%] h-1 -z-0 rounded-full transition-all duration-700 ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-sm">Order Items</h3>
          {order.items.map((item) => (
            <div key={item._id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
              <span>{item.product?.name} x {item.quantity}</span>
              <span className="text-primary">{currency}{item.product?.offerPrice * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-primary">{currency}{order.amount}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <p>Payment: {order.paymentType} {order.isPaid ? "(Paid)" : "(Pending)"}</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-sm">Delivery Address</h3>
          <p className="text-sm">{order.address?.firstName} {order.address?.lastName}</p>
          <p className="text-sm text-gray-600">House {order.address?.houseNumber}, Road {order.address?.roadNumber}</p>
          <p className="text-sm text-gray-600">Floor {order.address?.floorNumber}, {order.address?.city}</p>
          <p className="text-sm text-gray-600">{order.address?.state}, {order.address?.zipcode}</p>
          <p className="text-sm text-gray-600">{order.address?.phone}</p>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium mb-3 text-sm">Delivery Location</h3>
        <div className="h-64 rounded-md overflow-hidden">
          <MapWithNoSSR address={order.address} />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 text-center">
        <span className={`text-sm px-4 py-1.5 rounded-full inline-block ${
          deliveryStatus === "delivered" ? "bg-green-100 text-green-700" :
          deliveryStatus === "cancelled" ? "bg-red-100 text-red-600" :
          deliveryStatus === "unassigned" ? "bg-gray-100 text-gray-600" :
          "bg-blue-100 text-blue-700"
        }`}>
          Current Status: {deliveryStatus.replace("-", " ")}
        </span>
      </div>
    </main>
  );
}
