"use client";

import { useState } from "react";
import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUIStore } from "@/stores/uiStore";
import toast from "react-hot-toast";

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
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-gray-100 text-gray-500",
    expired: "bg-red-100 text-red-600",
  };

  const renderItems = (sub: any) => {
    if (sub.schedule === "weekly") {
      return (sub.weeklyItems || []).map((w: any) => (
        <div key={w.week} className="mb-1">
          <span className="text-purple-700 text-xs font-medium">W{w.week}: </span>
          <span className="text-xs text-gray-500">{(w.items || []).length} items</span>
        </div>
      ));
    }
    return <span className="text-xs text-gray-500">{sub.items?.length || 0} items</span>;
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "free", label: "Free" },
    { key: "premium", label: "Premium" },
  ];

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Subscribers</h2>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`text-sm px-3 py-1.5 rounded cursor-pointer ${
                  filter === f.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto max-w-6xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Price</th>
                    <th className="py-3 px-4 font-medium">Items</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Next Delivery</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => (
                    <tr key={sub._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{sub.userId?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-400">{sub.userId?.email}</p>
                      </td>
                      <td className="py-3 px-4 capitalize text-xs">
                        {sub.type.replace("-", " ")}
                        {sub.schedule === "weekly" && <span className="ml-1 text-purple-600">(Weekly)</span>}
                        {sub.isFree && <span className="ml-1 text-blue-600">(Free)</span>}
                      </td>
                      <td className="py-3 px-4">{sub.isFree ? "Free" : `${currency}${sub.price}`}</td>
                      <td className="py-3 px-4 text-xs">
                        {renderItems(sub)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[sub.status] || ""}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 flex gap-1">
                        {sub.status === "active" && (
                          <button onClick={() => updateStatus.mutate({ id: sub._id, status: "paused" } as any)}
                            className="text-xs border px-2 py-1 rounded cursor-pointer">Pause</button>
                        )}
                        {sub.status === "paused" && (
                          <button onClick={() => updateStatus.mutate({ id: sub._id, status: "active" } as any)}
                            className="text-xs border border-primary text-primary px-2 py-1 rounded cursor-pointer">Resume</button>
                        )}
                        {sub.status !== "cancelled" && (
                          <button onClick={() => updateStatus.mutate({ id: sub._id, status: "cancelled" } as any)}
                            className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded cursor-pointer">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {subs.map((sub) => (
                <div key={sub._id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{sub.userId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-400">{sub.userId?.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[sub.status] || ""}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-2">
                    <span>Type: {sub.type.replace("-", " ")}{sub.isFree ? " (Free)" : ""}</span>
                    <span>Price: {sub.isFree ? "Free" : `${currency}${sub.price}`}</span>
                    <span>Items: {sub.items?.length || 0}</span>
                    <span>Next: {new Date(sub.nextDeliveryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {sub.status === "active" && (
                      <button onClick={() => updateStatus.mutate({ id: sub._id, status: "paused" } as any)}
                        className="text-xs border px-3 py-1.5 rounded cursor-pointer flex-1">Pause</button>
                    )}
                    {sub.status === "paused" && (
                      <button onClick={() => updateStatus.mutate({ id: sub._id, status: "active" } as any)}
                        className="text-xs border border-primary text-primary px-3 py-1.5 rounded cursor-pointer flex-1">Resume</button>
                    )}
                    {sub.status !== "cancelled" && (
                      <button onClick={() => updateStatus.mutate({ id: sub._id, status: "cancelled" } as any)}
                        className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded cursor-pointer flex-1">Cancel</button>
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
