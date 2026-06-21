"use client";

import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUIStore } from "@/stores/uiStore";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Zap,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Hash,
  User,
  Loader2,
} from "lucide-react";

export default function SellerSubscriptionOrdersPage() {
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading, refetch } = useGet<{ success: boolean; orders: any[] }>(
    ["subscription-orders"],
    "/api/subscription/orders"
  );

  const generate = usePost("/api/subscription/generate", {
    onSuccess: (d: any) => {
      if (d.success) { toast.success(d.message); refetch(); }
      else toast.error(d.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const orders = data?.orders || [];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                Subscription Orders
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                {orders.length} order{orders.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
          <button
            onClick={() => generate.mutate({} as any)}
            disabled={generate.isPending}
            className="gradient-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 btn-press flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            {generate.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {generate.isPending ? "Generating..." : "Generate This Month"}
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-text-muted">Loading subscription orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="p-4 rounded-2xl bg-surface border border-border-light">
              <ClipboardList className="w-10 h-10 text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">No orders yet</p>
              <p className="text-xs text-text-muted mt-1">
                Generate this month&apos;s subscription orders to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto max-w-6xl">
              <div className="rounded-2xl border border-border-light bg-surface overflow-hidden card-hover">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border-light bg-surface-secondary">
                      <th className="py-3.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          Customer
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          Month
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3 h-3" />
                          Amount
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        Status
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3" />
                          Order ID
                        </span>
                      </th>
                      <th className="py-3.5 px-4 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          Date
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((so) => (
                      <tr
                        key={so._id}
                        className="border-b border-border-light last:border-b-0 hover:bg-surface-hover transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-text-primary">
                          {so.subscriptionId?.userId?.name || "N/A"}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                          {so.month}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-text-primary">
                          {so.orderId ? `${currency}${so.orderId.amount}` : "-"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                              so.status === "generated"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}
                          >
                            {so.status === "generated" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {so.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border-light">
                            {so.orderId?._id?.slice(-8) || "—"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          {new Date(so.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {orders.map((so) => (
                <div
                  key={so._id}
                  className="rounded-2xl border border-border-light bg-surface p-4 card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {so.subscriptionId?.userId?.name || "N/A"}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{so.month}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        so.status === "generated"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}
                    >
                      {so.status === "generated" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {so.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-sm font-semibold text-text-primary">
                        {so.orderId ? `${currency}${so.orderId.amount}` : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      <span className="text-xs text-text-secondary">
                        {new Date(so.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border-light flex items-center gap-2">
                    <Hash className="w-3 h-3 text-text-muted" />
                    <span className="font-mono text-xs text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border-light">
                      {so.orderId?._id?.slice(-8) || "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
