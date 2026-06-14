"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/lib/socket";
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
  const socket = useSocketStore((s) => s.socket);
  const isConnected = useSocketStore((s) => s.isConnected);
  
  const [riderLocation, setRiderLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const { data, isLoading, refetch } = useGet<{ success: boolean; orders: Order[] }>(
    ["order-tracking", orderId as string],
    "/api/order/user",
    { enabled: !!user }
  );

  useEffect(() => {
    if (data?.orders) {
      const foundOrder = data.orders.find((o) => o._id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [data, orderId]);

  // Join order room for real-time updates
  useEffect(() => {
    if (socket && orderId) {
      socket.emit("join_order", orderId);
      
      socket.on("order_status_changed", (data: any) => {
        if (data.orderId === orderId) {
          toast.success(`Order status: ${data.status}`);
          refetch();
        }
      });
      
      socket.on("delivery_status_changed", (data: any) => {
        if (data.orderId === orderId) {
          toast.success(`Delivery status: ${data.status}`);
          refetch();
        }
      });
      
      socket.on("rider_location_update", (data: any) => {
        setRiderLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      });
      
      return () => {
        socket.off("order_status_changed");
        socket.off("delivery_status_changed");
        socket.off("rider_location_update");
      };
    }
  }, [socket, orderId, refetch]);

  // Fetch tracking info
  useEffect(() => {
    if (orderId && order?.deliveryStatus !== "unassigned") {
      fetchTrackingInfo();
    }
  }, [orderId, order?.deliveryStatus]);

  const fetchTrackingInfo = async () => {
    try {
      const { data } = await api.get(`/api/tracking/${orderId}`);
      if (data.success) {
        if (data.riderLocation) {
          setRiderLocation(data.riderLocation);
        }
        if (data.eta) {
          const etaDate = new Date(data.eta);
          const now = new Date();
          const diffMinutes = Math.floor((etaDate.getTime() - now.getTime()) / 60000);
          if (diffMinutes > 0) {
            setEta(`${diffMinutes} mins`);
          } else {
            setEta("Arriving soon");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch tracking info:", error);
    }
  };

  const cancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    
    setIsCancelling(true);
    try {
      const { data } = await api.post(`/api/order/${orderId}/cancel`, { reason: cancelReason });
      if (data.success) {
        toast.success("Order cancelled successfully. Refund processed to your wallet.");
        setShowCancelModal(false);
        refetch();
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsCancelling(false);
    }
  };

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

  const canCancel = deliveryStatus !== "delivered" && 
    deliveryStatus !== "cancelled" && 
    deliveryStatus !== "in-transit";

  const isDelivered = deliveryStatus === "delivered";

  return (
    <main className="py-8 max-w-4xl mx-auto px-4">
      <Link href="/my-orders" className="text-primary text-sm mb-4 inline-block">&larr; Back to orders</Link>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">Order Tracking</h2>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-red-600 border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
      
      <p className="text-gray-500 text-sm mb-6">Order #{order._id.slice(-8)}</p>

      {/* ETA Display */}
      {eta && deliveryStatus !== "delivered" && deliveryStatus !== "cancelled" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Estimated Delivery Time</p>
            <p className="text-sm text-blue-700">{eta}</p>
          </div>
        </div>
      )}

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
            {order.couponCode && (
              <p className="text-green-600">Coupon: {order.couponCode} (-{currency}{order.discountAmount})</p>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-3 text-sm">Delivery Address</h3>
          <p className="text-sm">{order.address?.firstName} {order.address?.lastName}</p>
          <p className="text-sm text-gray-600">House {order.address?.houseNumber}, Road {order.address?.roadNumber}</p>
          <p className="text-sm text-gray-600">Floor {order.address?.floorNumber}, {order.address?.city}</p>
          <p className="text-sm text-gray-600">{order.address?.state}, {order.address?.zipcode}</p>
          <p className="text-sm text-gray-600">{order.address?.phone}</p>
          {order.deliveryInstructions && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-xs text-yellow-800 font-medium">Delivery Instructions:</p>
              <p className="text-xs text-yellow-700">{order.deliveryInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Map with Rider Location */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium mb-3 text-sm">Delivery Location</h3>
        <div className="h-64 rounded-md overflow-hidden">
          <MapWithNoSSR address={order.address} riderLocation={riderLocation} />
        </div>
        {riderLocation && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Rider is live on map
          </p>
        )}
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

      {/* Review Button for Delivered Orders */}
      {isDelivered && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this order? {order.isPaid && "The amount will be refunded to your wallet."}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (required)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500 mb-4"
              rows={3}
              required
            />
            <div className="flex gap-3">
              <button
                onClick={cancelOrder}
                disabled={isCancelling}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
