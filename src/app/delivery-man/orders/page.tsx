"use client";

import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import { assets } from "@/assets/assets";
import {
  Package,
  MapPin,
  Clock,
  Phone,
  User,
  CheckCircle,
  Truck,
  Navigation,
  DollarSign,
  MessageSquare,
  Loader2,
} from "lucide-react";

const statusColors: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-700",
  "picked-up": "bg-yellow-100 text-yellow-700",
  "in-transit": "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function DeliveryManOrdersPage() {
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading } = useGet<{
    success: boolean;
    assignments: any[];
  }>(["delivery-man-orders"], "/api/delivery-man/orders");

  const assignments = data?.assignments || [];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-background">
      <div className="md:p-10 p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Orders</h1>
            <p className="text-xs text-muted mt-0.5">
              {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted font-medium">Loading orders...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-16 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <Package className="w-8 h-8 text-muted" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No orders assigned yet</p>
            <p className="text-xs text-muted">Your delivery assignments will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment: any, index: number) => {
              const order = assignment.orderId;
              const customerName = `${order?.address?.firstName || ""} ${order?.address?.lastName || ""}`.trim();
              const customerInitial = customerName ? customerName.charAt(0).toUpperCase() : "?";

              return (
                <div
                  key={assignment._id}
                  className={`bg-white rounded-2xl border border-border-light overflow-hidden card-hover animate-fade-in-up delay-${Math.min(index + 1, 10)}`}
                >
                  {/* Top Section: Order ID + Status + Time */}
                  <div className="px-5 pt-5 pb-4 border-b border-border-light">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/15">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold text-foreground">
                            #{order?._id?.slice(-8) || "N/A"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3 h-3 text-muted" />
                            <p className="text-[11px] text-muted">
                              {new Date(assignment.assignedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[assignment.status] || ""}`}
                      >
                        {assignment.status}
                      </span>
                    </div>
                  </div>

                  {/* Items Section */}
                  {order?.items?.length > 0 && (
                    <div className="px-5 py-3.5 border-b border-border-light">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center">
                          <Truck className="w-3 h-3 text-primary" />
                        </div>
                        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                          Items
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.slice(0, 3).map((item: any) => (
                          <span
                            key={item._id}
                            className="bg-primary/5 text-primary-light text-[11px] font-medium px-2.5 py-1.5 rounded-xl"
                          >
                            {item.product?.name} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="bg-surface-hover text-muted text-[11px] font-medium px-2.5 py-1.5 rounded-xl">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Section */}
                  <div className="px-5 py-4 border-b border-border-light">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-accent" />
                      </div>
                      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                        Customer
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm shadow-primary/15">
                        {customerInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {customerName || "Unknown"}
                        </p>
                        {order?.address?.phone && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Phone className="w-3 h-3 text-muted shrink-0" />
                            <p className="text-xs text-muted">{order.address.phone}</p>
                          </div>
                        )}
                        {order?.address && (
                          <div className="flex items-start gap-1.5 mt-1.5">
                            <MapPin className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                            <p className="text-xs text-muted leading-relaxed">
                              House {order.address.houseNumber}, Road {order.address.roadNumber},{" "}
                              {order.address.city}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Amount, Delivered Time, Notes */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted uppercase tracking-wider font-medium">
                            Amount
                          </p>
                          <p className="text-base font-bold text-foreground">
                            {currency}
                            {order?.amount || 0}
                          </p>
                        </div>
                      </div>

                      {assignment.deliveredAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted uppercase tracking-wider font-medium">
                              Delivered
                            </p>
                            <p className="text-xs text-green-600 font-medium">
                              {new Date(assignment.deliveredAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {assignment.notes && (
                      <div className="mt-3 pt-3 border-t border-border-light">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                          <p className="text-xs text-muted leading-relaxed">{assignment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
