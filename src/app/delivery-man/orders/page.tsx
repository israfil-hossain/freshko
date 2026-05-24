"use client";

import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import { assets } from "@/assets/assets";

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
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4">
        <h1 className="text-xl font-semibold mb-6">My Orders</h1>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : assignments.length === 0 ? (
          <p className="text-gray-400">No orders assigned yet</p>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment: any) => {
              const order = assignment.orderId;
              return (
                <div key={assignment._id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">Order #{order?._id?.slice(-8) || "N/A"}</p>
                      <p className="text-xs text-gray-500">
                        Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[assignment.status] || ""}`}>
                      {assignment.status}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm">
                    {order?.items?.slice(0, 3).map((item: any) => (
                      <span key={item._id} className="bg-gray-100 px-2 py-1 rounded">
                        {item.product?.name} x{item.quantity}
                      </span>
                    ))}
                    {order?.items?.length > 3 && (
                      <span className="text-gray-400">+{order.items.length - 3} more</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-3 text-sm">
                    <div className="text-gray-600">
                      <p>{order?.address?.firstName} {order?.address?.lastName}</p>
                      <p className="text-xs">{order?.address?.phone}</p>
                      <p className="text-xs">House {order?.address?.houseNumber}, Road {order?.address?.roadNumber}, {order?.address?.city}</p>
                    </div>
                    <p className="font-medium text-lg">{currency}{order?.amount || 0}</p>
                  </div>

                  {assignment.deliveredAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Delivered: {new Date(assignment.deliveredAt).toLocaleString()}
                    </p>
                  )}
                  {assignment.notes && (
                    <p className="text-xs text-gray-400 mt-1">Notes: {assignment.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
