"use client";

import { useGet } from "@/hooks/useGet";
import { usePut } from "@/hooks/usePut";
import { useUIStore } from "@/stores/uiStore";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), { ssr: false });

const statusSteps = ["assigned", "picked-up", "in-transit", "delivered"];

const statusLabels: Record<string, string> = {
  assigned: "Order Assigned",
  "picked-up": "Order Picked Up",
  "in-transit": "Out for Delivery",
  delivered: "Delivered",
};

export default function DeliveryManDashboardPage() {
  const currency = useUIStore((s) => s.currency);

  const { data, isLoading, refetch } = useGet<{
    success: boolean;
    dashboard: {
      totalDeliveries: number;
      totalEarnings: number;
      currentOrder: any;
      queueOrders: any[];
      recentDeliveries: any[];
      deliveryMan: any;
    };
  }>(["delivery-man-dashboard"], "/api/delivery-man/dashboard", {
    refetchInterval: 15000,
  });

  const updateStatus = usePut("/api/delivery-man/update-status", {
    onSuccess: (d: any) => {
      if (d.success) { toast.success(d.message); refetch(); }
      else toast.error(d.message);
    },
    onError: (e) => toast.error(e.message),
  });

  const dash = data?.dashboard;
  const currentOrder = dash?.currentOrder;
  const queueOrders = dash?.queueOrders || [];
  const recentDeliveries = dash?.recentDeliveries || [];

  if (isLoading) {
    return (
      <div className="flex-1 h-[95vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = currentOrder ? statusSteps.indexOf(currentOrder.status) : -1;

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-8 p-4 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Delivery Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">Track your deliveries and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-xs text-muted font-medium">Total Delivered</p>
            <p className="text-2xl font-bold text-foreground mt-1">{dash?.totalDeliveries || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-xs text-muted font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-foreground mt-1">{currency}{dash?.totalEarnings || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${currentOrder ? "bg-blue-50" : "bg-surface-hover"}`}>
              <svg className={`w-5 h-5 ${currentOrder ? "text-blue-600" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-xs text-muted font-medium">Current Order</p>
            <p className={`text-2xl font-bold mt-1 ${currentOrder ? "text-blue-600" : "text-muted"}`}>{currentOrder ? "Active" : "None"}</p>
          </div>
          <div className="bg-white rounded-2xl border border-border-light p-4 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${queueOrders.length > 0 ? "bg-purple-50" : "bg-surface-hover"}`}>
              <svg className={`w-5 h-5 ${queueOrders.length > 0 ? "text-purple-600" : "text-muted"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-xs text-muted font-medium">In Queue</p>
            <p className={`text-2xl font-bold mt-1 ${queueOrders.length > 0 ? "text-purple-600" : "text-muted"}`}>{queueOrders.length}</p>
          </div>
        </div>

        {/* Current Order Progress */}
        {currentOrder && (
          <div className="bg-white rounded-2xl border border-border-light p-6 animate-fade-in">
            <h2 className="font-bold text-foreground mb-4">Current Order</h2>
            {/* Desktop horizontal progress */}
            <div className="hidden md:flex items-center justify-between mb-6">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all ${
                    i <= currentStepIndex ? "gradient-primary text-white shadow-sm shadow-primary/20" : "bg-surface-hover text-muted"
                  }`}>
                    {i < currentStepIndex ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : i + 1}
                  </div>
                  <p className={`text-xs mt-2 text-center font-medium ${i <= currentStepIndex ? "text-primary" : "text-muted"}`}>
                    {statusLabels[step]}
                  </p>
                  {i < statusSteps.length - 1 && (
                    <div className={`absolute top-5 left-[60%] w-[80%] h-0.5 -z-0 rounded-full ${
                      i < currentStepIndex ? "bg-primary" : "bg-border-light"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile vertical progress */}
            <div className="md:hidden space-y-0 mb-6">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-start gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                      i <= currentStepIndex ? "gradient-primary text-white shadow-sm shadow-primary/20" : "bg-surface-hover text-muted"
                    }`}>
                      {i < currentStepIndex ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : i + 1}
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-8 ${i < currentStepIndex ? "bg-primary" : "bg-border-light"}`} />
                    )}
                  </div>
                  <p className={`text-sm pt-1.5 font-medium ${i <= currentStepIndex ? "text-primary" : "text-muted"}`}>
                    {statusLabels[step]}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-surface-hover rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Order ID</p>
                  <p className="font-semibold text-foreground">#{currentOrder.orderId?._id?.slice(-8) || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted">Amount</p>
                  <p className="font-bold text-foreground text-lg">{currency}{currentOrder.orderId?.amount || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {currentOrder.status === "assigned" && (
                <button onClick={() => updateStatus.mutate({ assignmentId: currentOrder._id, status: "picked-up" } as any)}
                  className="flex-1 gradient-primary text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all btn-press cursor-pointer">
                  Mark as Picked Up
                </button>
              )}
              {currentOrder.status === "picked-up" && (
                <button onClick={() => updateStatus.mutate({ assignmentId: currentOrder._id, status: "in-transit" } as any)}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-xl transition-all btn-press cursor-pointer">
                  Mark as In Transit
                </button>
              )}
              {currentOrder.status === "in-transit" && (
                <button onClick={() => updateStatus.mutate({ assignmentId: currentOrder._id, status: "delivered" } as any)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-green-500/20 hover:shadow-xl transition-all btn-press cursor-pointer">
                  Mark as Delivered
                </button>
              )}
              {!["delivered", "cancelled"].includes(currentOrder.status) && (
                <button onClick={() => {
                  if (confirm("Cancel this delivery?")) {
                    updateStatus.mutate({ assignmentId: currentOrder._id, status: "cancelled" } as any);
                  }
                }}
                  className="px-4 py-3 border border-danger/30 text-danger rounded-xl text-sm font-medium hover:bg-danger/5 transition-all btn-press cursor-pointer">
                  Cancel
                </button>
              )}
            </div>

            {/* Map showing customer location */}
            {currentOrder.orderId?.address && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-foreground mb-2">Customer Location</h4>
                <div className="rounded-xl overflow-hidden border border-border-light">
                  <DeliveryMap address={currentOrder.orderId.address} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Queue Orders */}
        {queueOrders.length > 0 && (
          <div>
            <h2 className="font-bold text-foreground mb-3">Queue Orders ({queueOrders.length})</h2>
            <div className="space-y-2">
              {queueOrders.slice(0, 3).map((assignment: any) => (
                <div key={assignment._id} className="bg-white rounded-xl border border-border-light p-4 flex justify-between items-center hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center">
                      <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Order #{assignment.orderId?._id?.slice(-8) || "N/A"}</p>
                      <p className="text-xs text-muted">{currency}{assignment.orderId?.amount || 0}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">Assigned</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Deliveries */}
        {recentDeliveries.length > 0 && (
          <div>
            <h2 className="font-bold text-foreground mb-3">Recent Activity</h2>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-5xl bg-white rounded-2xl border border-border-light shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Order</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Amount</th>
                    <th className="py-3.5 px-4 font-semibold text-muted text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.slice(0, 5).map((a: any) => (
                    <tr key={a._id} className="border-b border-border-light/60 hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">#{a.orderId?._id?.slice(-8) || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                          a.status === "delivered" ? "bg-green-50 text-green-700" :
                          a.status === "cancelled" ? "bg-red-50 text-red-600" :
                          "bg-blue-50 text-blue-700"
                        }`}>{a.status}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{currency}{a.orderId?.amount || 0}</td>
                      <td className="py-3 px-4 text-muted text-xs">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {recentDeliveries.slice(0, 5).map((a: any) => (
                <div key={a._id} className="bg-white rounded-xl border border-border-light p-4 flex justify-between items-center hover:shadow-sm transition-all">
                  <div>
                    <p className="text-sm font-semibold text-foreground">#{a.orderId?._id?.slice(-8) || "N/A"}</p>
                    <p className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                      a.status === "delivered" ? "bg-green-50 text-green-700" :
                      a.status === "cancelled" ? "bg-red-50 text-red-600" :
                      "bg-blue-50 text-blue-700"
                    }`}>{a.status}</span>
                    <p className="text-sm font-bold text-foreground mt-1">{currency}{a.orderId?.amount || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!currentOrder && queueOrders.length === 0 && recentDeliveries.length === 0 && (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-hover flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No deliveries yet</h3>
            <p className="text-sm text-muted">Waiting for admin to assign orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
