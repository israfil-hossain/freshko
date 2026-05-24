"use client";

import { useGet } from "@/hooks/useGet";
import { usePost } from "@/hooks/usePost";
import { useUIStore } from "@/stores/uiStore";
import toast from "react-hot-toast";

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
      <div className="md:p-10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Subscription Orders</h2>
          <button onClick={() => generate.mutate({} as any)}
            disabled={generate.isPending}
            className="bg-primary text-white px-4 py-2 rounded text-sm cursor-pointer disabled:opacity-50">
            {generate.isPending ? "Generating..." : "Generate This Month"}
          </button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto max-w-6xl">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-300 text-gray-500">
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Month</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Order ID</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((so) => (
                  <tr key={so._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {so.subscriptionId?.userId?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{so.month}</td>
                    <td className="py-3 px-4">
                      {so.orderId ? `${currency}${so.orderId.amount}` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        so.status === "generated" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {so.orderId?._id?.slice(-8) || "—"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {new Date(so.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-gray-400">No generated orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
