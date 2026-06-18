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
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Circle,
  Navigation,
  Phone,
  User,
  CreditCard,
  Ticket,
  MessageSquare,
  Loader2,
  CircleDot,
  ShieldCheck,
} from "lucide-react";

const MapWithNoSSR = dynamic(() => import("@/components/OrderMap"), { ssr: false });

const statusSteps = ["Order Placed", "assigned", "picked-up", "in-transit", "delivered"];

const stepLabels = [
  "Order Placed",
  "Assigned to Delivery",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
];

const stepIcons = [Package, User, Navigation, Truck, CheckCircle2];

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
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="py-8 max-w-4xl mx-auto px-4">
        <div className="text-center py-16 animate-fade-in-up">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Order not found.</p>
          <Link href="/my-orders" className="text-primary text-sm font-medium hover:underline">Back to orders</Link>
        </div>
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
  const isCancelled = deliveryStatus === "cancelled";

  return (
    <main className="py-8 max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link
          href="/my-orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to orders</span>
        </Link>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Order Tracking</h1>
            <p className="text-sm text-gray-400 mt-1">
              Order #{order._id.slice(-8)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn-press inline-flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ETA Display */}
      {eta && deliveryStatus !== "delivered" && deliveryStatus !== "cancelled" && (
        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzRtMC04djJIMnYtMmgzNG0wLTh2Mkgdi0yaDM0bTAtOXYySDJ2LTJoMzRtMC04djJIMnYtMmgzNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Estimated Delivery Time</p>
                <p className="text-2xl font-bold">{eta}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Timeline - Hero Element */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="relative bg-white border border-border-light rounded-2xl p-6 md:p-8 shadow-sm card-hover">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-semibold text-gray-900">Delivery Progress</h3>
            {isCancelled && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                <XCircle className="w-3.5 h-3.5" />
                Cancelled
              </span>
            )}
          </div>

          {/* Mobile: Vertical Timeline */}
          <div className="md:hidden space-y-0">
            {stepLabels.map((label, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isLast = i === stepLabels.length - 1;
              const StepIcon = stepIcons[i];

              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                          : isCurrent
                          ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 animate-pulse"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                      {isCurrent && (
                        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 h-12 my-1 rounded-full transition-all duration-700 ${
                          isCompleted
                            ? "bg-gradient-to-b from-green-400 to-emerald-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? "text-green-600"
                          : isCurrent
                          ? "text-primary"
                          : "text-gray-400"
                      }`}
                    >
                      {label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-gray-400 mt-0.5">Current step</p>
                    )}
                    {isCompleted && (
                      <p className="text-xs text-green-500 mt-0.5">Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Horizontal Timeline */}
          <div className="hidden md:block">
            <div className="relative flex items-start justify-between">
              {/* Background Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 rounded-full" />
              
              {/* Progress Line */}
              <div
                className="absolute top-6 left-0 h-1 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${(currentStepIndex / (stepLabels.length - 1)) * 100}%`,
                  background: "linear-gradient(to right, #10b981, #059669, #047857)",
                }}
              />

              {stepLabels.map((label, i) => {
                const isCompleted = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const StepIcon = stepIcons[i];

                return (
                  <div key={i} className="flex flex-col items-center flex-1 relative">
                    {/* Step Circle */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-110"
                          : isCurrent
                          ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30 scale-110"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                      {isCurrent && (
                        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-4 text-center max-w-24">
                      <p
                        className={`text-xs font-semibold leading-tight ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                            ? "text-primary"
                            : "text-gray-400"
                        }`}
                      >
                        {label}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] text-gray-400 mt-1">In progress</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Order Items Card */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm card-hover h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-primary ml-3">
                    {currency}{item.product?.offerPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center font-semibold text-gray-900">
                <span>Total</span>
                <span className="text-lg text-primary">{currency}{order.amount}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CreditCard className="w-3.5 h-3.5" />
                <span>
                  {order.paymentType} {order.isPaid ? (
                    <span className="text-green-600 font-medium">(Paid)</span>
                  ) : (
                    <span className="text-amber-600 font-medium">(Pending)</span>
                  )}
                </span>
              </div>
              {order.couponCode && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 border border-green-100">
                  <Ticket className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    Coupon: {order.couponCode} (-{currency}{order.discountAmount})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm card-hover h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-800">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{order.address?.firstName} {order.address?.lastName}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p>House {order.address?.houseNumber}, Road {order.address?.roadNumber}</p>
                  <p>Floor {order.address?.floorNumber}, {order.address?.city}</p>
                  <p>{order.address?.state}, {order.address?.zipcode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{order.address?.phone}</span>
              </div>
            </div>

            {order.deliveryInstructions && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-800">Delivery Instructions</p>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">{order.deliveryInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map with Rider Location */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
        <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">Delivery Location</h3>
            </div>
            {riderLocation && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Rider live
              </span>
            )}
          </div>

          <div className="h-64 md:h-80 rounded-xl overflow-hidden border border-gray-100">
            <MapWithNoSSR address={order.address} riderLocation={riderLocation} />
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
        <div
          className={`inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border ${
            isDelivered
              ? "bg-green-50 text-green-700 border-green-200"
              : isCancelled
              ? "bg-red-50 text-red-600 border-red-200"
              : deliveryStatus === "unassigned"
              ? "bg-gray-50 text-gray-600 border-gray-200"
              : "bg-primary/10 text-primary border-primary/20"
          }`}
        >
          {isDelivered ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : isCancelled ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <CircleDot className="w-4 h-4" />
          )}
          <span>Current Status: {deliveryStatus.replace("-", " ")}</span>
        </div>
      </div>

      {/* Review Button for Delivered Orders */}
      {isDelivered && (
        <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
          <button
            onClick={() => setShowReviewModal(true)}
            className="btn-press inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg shadow-amber-500/25"
          >
            <Star className="w-4 h-4" />
            Write a Review
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to cancel this order? {order.isPaid && "The amount will be refunded to your wallet."}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none"
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-press flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Keep Order
              </button>
              <button
                onClick={cancelOrder}
                disabled={isCancelling}
                className="btn-press flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </span>
                ) : (
                  "Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Rate Your Experience</h3>
              <p className="text-sm text-gray-500 mt-2">
                Your feedback helps us improve our service
              </p>
            </div>

            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-4">How was your delivery?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-amber-100 transition-colors flex items-center justify-center"
                  >
                    <Star className="w-5 h-5 text-gray-400 hover:text-amber-500" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <textarea
                placeholder="Share your experience (optional)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="btn-press flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Skip
              </button>
              <button
                className="btn-press flex-1 bg-gradient-to-r from-primary to-primary/90 text-white py-3 rounded-xl text-sm font-semibold hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg shadow-primary/25"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
