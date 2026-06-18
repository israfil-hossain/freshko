"use client";

import { useState } from "react";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUIStore } from "@/stores/uiStore";
import toast from "react-hot-toast";
import { Users, Filter, Pause, Play, XCircle, Calendar, Package, Search } from "lucide-react";

export default function SellerSubscribersPage() {
  const currency = useUIStore((s) => s.currency);
  const [filter, setFilter] = useState("all");

  const { data, isLoading, refetch } = useGet<{ success: boolean; subscriptions: any[] }>(
    ["all-subscriptions", filter],
    `/api/subscription/all${filter === "all" ? "" : `?planType=${filter}`}`
  );

  const updateStatus = usePost(
    "/api/subscription/:id/status",
    {
      onSuccess: (d: any) => {
        if (d.success) { toast.success(d.message); refetch(); }
        else toast.error(d.message);
      },
      onError: (e) => toast.error(e.message),
    }
  );

  const subs = data?.subscriptions || [];

  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700 border border-green-200",
    paused: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    cancelled: "bg-gray-50 text-gray-500 border border-gray-200",
    expired: "bg-red-50 text-red-600 border border-red-200",
  };

  const renderItems = (sub: any) => {
    if (sub.schedule === "weekly") {
      return (sub.weeklyItems || []).map((w: any) => (
        <div key={w.week} className="mb-1">
          <span className="text-purple-600 text-xs font-semibold">W{w.week}: </span>
          <span className="text-xs text-muted">{(w.items || []).length} items</span>
        </div>
      ));
    }
    return <span className="text-xs text-muted">{sub.items?.length || 0} items</span>;
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "free", label: "Free" },
    { key: "premium", label: "Premium" },
  ];

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Subscribers</h2>
              <p className="text-sm text-muted">{subs.length} total subscribers</p>
            </div>
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-sm px-4 py-2 rounded-xl font-medium transition-all btn-press cursor-pointer ${
                  filter === f.key
                    ? "gradient-primary text-white shadow-md shadow-primary/20"
                    : "bg-surface-hover text-muted hover:text-foreground border border-border-light hover:border-primary/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        ) : subs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <Users className="w-8 h-8 text-muted" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No subscribers found</h3>
            <p className="text-sm text-muted">Subscribers will appear here when customers sign up</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-6xl bg-white rounded-2xl border border-border-light shadow-sm animate-fade-in">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border-light bg-surface-hover/50">
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted">Customer</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted">Type</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted">Price</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted">Items</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted">Next Delivery</th>
                    <th className="py-3.5 px-4 font-semibold text-xs uppercase tracking-wider text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => (
                    <tr key={sub._id} className="border-b border-border-light/60 last:border-0 hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm shadow-primary/20 flex-shrink-0">
                            {getInitials(sub.userId?.name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{sub.userId?.name || "Unknown"}</p>
                            <p className="text-xs text-muted">{sub.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground capitalize">{sub.type.replace("-", " ")}</span>
                          {sub.schedule === "weekly" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
                              Weekly
                            </span>
                          )}
                          {sub.isFree && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                              Free
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {sub.isFree ? (
                          <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-lg border border-green-200">Free</span>
                        ) : (
                          <span className="text-sm">{currency}{sub.price}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-muted" />
                          <div>{renderItems(sub)}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${statusColors[sub.status] || ""}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(sub.nextDeliveryDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1.5">
                          {sub.status === "active" && (
                            <button
                              onClick={() => updateStatus.mutate({ id: sub._id, status: "paused" } as any)}
                              className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium hover:bg-amber-100 transition-all btn-press cursor-pointer"
                            >
                              <Pause className="w-3 h-3" />
                              Pause
                            </button>
                          )}
                          {sub.status === "paused" && (
                            <button
                              onClick={() => updateStatus.mutate({ id: sub._id, status: "active" } as any)}
                              className="flex items-center gap-1 text-xs gradient-primary text-white px-2.5 py-1.5 rounded-lg font-medium shadow-sm shadow-primary/20 hover:shadow-md transition-all btn-press cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              Resume
                            </button>
                          )}
                          {sub.status !== "cancelled" && (
                            <button
                              onClick={() => updateStatus.mutate({ id: sub._id, status: "cancelled" } as any)}
                              className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-lg font-medium hover:bg-red-100 transition-all btn-press cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {subs.map((sub) => (
                <div key={sub._id} className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all animate-fade-in">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-sm shadow-primary/20 flex-shrink-0">
                        {getInitials(sub.userId?.name)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{sub.userId?.name || "Unknown"}</p>
                        <p className="text-xs text-muted">{sub.userId?.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${statusColors[sub.status] || ""}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted mb-3">
                    <div className="bg-surface-hover rounded-xl px-3 py-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted/70 block mb-0.5">Type</span>
                      <span className="text-foreground font-medium capitalize">{sub.type.replace("-", " ")}{sub.isFree ? " (Free)" : ""}</span>
                    </div>
                    <div className="bg-surface-hover rounded-xl px-3 py-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted/70 block mb-0.5">Price</span>
                      <span className="text-foreground font-medium">{sub.isFree ? "Free" : `${currency}${sub.price}`}</span>
                    </div>
                    <div className="bg-surface-hover rounded-xl px-3 py-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted/70 block mb-0.5">Items</span>
                      <span className="text-foreground font-medium">{sub.items?.length || 0} items</span>
                    </div>
                    <div className="bg-surface-hover rounded-xl px-3 py-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted/70 block mb-0.5">Next Delivery</span>
                      <span className="text-foreground font-medium">{new Date(sub.nextDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {sub.status === "active" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: sub._id, status: "paused" } as any)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-xl font-medium hover:bg-amber-100 transition-all btn-press cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </button>
                    )}
                    {sub.status === "paused" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: sub._id, status: "active" } as any)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs gradient-primary text-white px-3 py-2 rounded-xl font-medium shadow-sm shadow-primary/20 hover:shadow-md transition-all btn-press cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Resume
                      </button>
                    )}
                    {sub.status !== "cancelled" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: sub._id, status: "cancelled" } as any)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl font-medium hover:bg-red-100 transition-all btn-press cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
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
