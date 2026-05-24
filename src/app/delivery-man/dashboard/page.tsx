"use client";

import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
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

  const updateStatus = usePost("/api/delivery-man/update-status", {
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
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStepIndex = currentOrder ? statusSteps.indexOf(currentOrder.status) : -1;

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-6">
        <h1 className="text-xl font-semibold">Delivery Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Delivered</p>
            <p className="text-2xl font-bold text-green-600">{dash?.totalDeliveries || 0}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-primary">{currency}{dash?.totalEarnings || 0}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">Current Order</p>
            <p className="text-2xl font-bold text-blue-600">{currentOrder ? "Active" : "None"}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">In Queue</p>
            <p className="text-2xl font-bold text-purple-600">{queueOrders.length}</p>
          </div>
        </div>

        {/* Current Order Progress */}
        {currentOrder && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-medium mb-4">Current Order</h2>
            {/* Desktop horizontal progress */}
            <div className="hidden md:flex items-center justify-between mb-6">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 ${
                    i <= currentStepIndex ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {i < currentStepIndex ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs mt-2 text-center ${i <= currentStepIndex ? "text-primary font-medium" : "text-gray-400"}`}>
                    {statusLabels[step]}
                  </p>
                  {i < statusSteps.length - 1 && (
                    <div className={`absolute top-5 left-[60%] w-[80%] h-0.5 -z-0 ${
                      i < currentStepIndex ? "bg-primary" : "bg-gray-200"
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                      i <= currentStepIndex ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {i < currentStepIndex ? "✓" : i + 1}
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`w-0.5 h-8 ${i < currentStepIndex ? "bg-primary" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <p className={`text-sm pt-1.5 ${i <= currentStepIndex ? "text-primary font-medium" : "text-gray-400"}`}>
                    {statusLabels[step]}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>Order ID: {currentOrder.orderId?._id?.slice(-8) || "N/A"}</p>
              <p>Amount: {currency}{currentOrder.orderId?.amount || 0}</p>
            </div>

            <div className="flex gap-3">
              {currentOrder.status === "assigned" && (
                <button onClick={() => updateStatus.mutate({ assignmentId: currentOrder._id, status: "picked-up" } as any)}
                  className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer">
                  Mark as Picked Up
                </button>
              )}
              {currentOrder.status === "picked-up" && (
                <button onClick={() => updateStatus.mutate({ assignmentId: currentOrder._id, status: "in-transit" } as any)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded text-sm cursor-pointer">
                  Mark as In Transit
                </button>
              )}
              {currentOrder.status === "in-transit" && (
                <button onClick={() => updateStatus.mutate({ assignmentId: currentOrder._id, status: "delivered" } as any)}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm cursor-pointer">
                  Mark as Delivered
                </button>
              )}
              {!["delivered", "cancelled"].includes(currentOrder.status) && (
                <button onClick={() => {
                  if (confirm("Cancel this delivery?")) {
                    updateStatus.mutate({ assignmentId: currentOrder._id, status: "cancelled" } as any);
                  }
                }}
                  className="border border-red-300 text-red-500 px-4 py-2 rounded text-sm cursor-pointer">
                  Cancel
                </button>
              )}
            </div>

            {/* Map showing customer location */}
            {currentOrder.orderId?.address && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Customer Location</h4>
                <DeliveryMap address={currentOrder.orderId.address} />
              </div>
            )}
          </div>
        )}

        {/* Queue Orders */}
        {queueOrders.length > 0 && (
          <div>
            <h2 className="font-medium mb-3">Queue Orders ({queueOrders.length})</h2>
            <div className="space-y-2">
              {queueOrders.slice(0, 3).map((assignment: any) => (
                <div key={assignment._id} className="border rounded-lg p-3 flex justify-between items-center bg-white">
                  <div className="text-sm">
                    <p className="font-medium">Order #{assignment.orderId?._id?.slice(-8) || "N/A"}</p>
                    <p className="text-gray-500">{currency}{assignment.orderId?.amount || 0}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Assigned</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Deliveries */}
        {recentDeliveries.length > 0 && (
          <div>
            <h2 className="font-medium mb-3">Recent Activity</h2>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-5xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="py-2 px-3 font-medium">Order</th>
                    <th className="py-2 px-3 font-medium">Status</th>
                    <th className="py-2 px-3 font-medium">Amount</th>
                    <th className="py-2 px-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.slice(0, 5).map((a: any) => (
                    <tr key={a._id} className="border-b border-gray-200">
                      <td className="py-2 px-3">#{a.orderId?._id?.slice(-8) || "N/A"}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.status === "delivered" ? "bg-green-100 text-green-700" :
                          a.status === "cancelled" ? "bg-red-100 text-red-600" :
                          "bg-blue-100 text-blue-700"
                        }`}>{a.status}</span>
                      </td>
                      <td className="py-2 px-3">{currency}{a.orderId?.amount || 0}</td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
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
                <div key={a._id} className="border rounded-lg p-3 bg-white flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">#{a.orderId?._id?.slice(-8) || "N/A"}</p>
                    <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "delivered" ? "bg-green-100 text-green-700" :
                      a.status === "cancelled" ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-700"
                    }`}>{a.status}</span>
                    <p className="text-sm font-medium mt-1">{currency}{a.orderId?.amount || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!currentOrder && queueOrders.length === 0 && recentDeliveries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No deliveries yet. Waiting for admin to assign orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
