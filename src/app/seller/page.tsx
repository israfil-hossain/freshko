"use client";

import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import type { DashboardStats, Order } from "@/types";

const statusColors: Record<string, string> = {
  "unassigned": "bg-gray-100 text-gray-600",
  "assigned": "bg-blue-100 text-blue-700",
  "picked-up": "bg-yellow-100 text-yellow-700",
  "in-transit": "bg-purple-100 text-purple-700",
  "delivered": "bg-green-100 text-green-700",
  "cancelled": "bg-red-100 text-red-600",
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

export default function AdminDashboardPage() {
  const currency = useUIStore((s) => s.currency);

  const { data: dashData, isLoading } = useGet<{
    success: boolean;
    stats: DashboardStats;
    ordersByMonth: { _id: { year: number; month: number }; count: number; revenue: number }[];
    recentOrders: Order[];
  }>(["admin-dashboard"], "/api/dashboard/admin");

  const stats = dashData?.stats;
  const ordersByMonth = dashData?.ordersByMonth || [];
  const recentOrders = dashData?.recentOrders || [];

  const chartData = ordersByMonth.map((m) => ({
    month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`,
    orders: m.count,
    revenue: m.revenue,
  }));

  const pieData = stats
    ? [
        { name: "Delivered", value: stats.completedOrders },
        { name: "Pending", value: stats.pendingOrders },
        { name: "Unassigned", value: stats.unassignedOrders },
        { name: "Cancelled", value: stats.cancelledOrders },
      ].filter((d) => d.value > 0)
    : [];

  if (isLoading) {
    return (
      <div className="flex-1 h-[95vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total Orders" value={stats?.totalOrders || 0} color="bg-blue-500" />
          <StatCard label="Completed" value={stats?.completedOrders || 0} color="bg-green-500" />
          <StatCard label="Pending" value={stats?.pendingOrders || 0} color="bg-yellow-500" />
          <StatCard label="Unassigned" value={stats?.unassignedOrders || 0} color="bg-gray-500" />
          <StatCard label={`Revenue`} value={`${currency}${(stats?.totalRevenue || 0).toLocaleString()}`} color="bg-emerald-500" />
          <StatCard label="Products" value={stats?.totalProducts || 0} color="bg-violet-500" />
          <StatCard label="Users" value={stats?.totalUsers || 0} color="bg-indigo-500" />
          <StatCard label="Active Subs" value={stats?.activeSubscriptions || 0} color="bg-pink-500" />
          <StatCard label="Delivery Men" value={stats?.totalDeliveryMen || 0} color="bg-cyan-500" />
          <StatCard label="On Duty" value={stats?.onDutyDeliveryMen || 0} color="bg-orange-500" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Bar Chart */}
          <div className="bg-white border rounded-lg p-3 md:p-4">
            <h3 className="text-sm font-medium mb-4">Orders by Month (Last 6)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm py-10 text-center">No data yet</p>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-4">Order Status Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm py-10 text-center">No data yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <h3 className="text-sm font-medium mb-3">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <div className="overflow-x-auto max-w-6xl">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="py-2 px-3 font-medium">#</th>
                    <th className="py-2 px-3 font-medium">Items</th>
                    <th className="py-2 px-3 font-medium">Amount</th>
                    <th className="py-2 px-3 font-medium">Status</th>
                    <th className="py-2 px-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                      <td className="py-2 px-3">
                        {order.items.slice(0, 2).map((item) => item.product?.name).join(", ")}
                        {order.items.length > 2 && ` +${order.items.length - 2}`}
                      </td>
                      <td className="py-2 px-3">{currency}{order.amount}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.deliveryStatus] || statusColors["unassigned"]}`}>
                          {order.deliveryStatus || "unassigned"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const displayValue = typeof value === 'number' ? (value > 999 ? `${(value / 1000).toFixed(1)}k` : value) : value;
  return (
    <div className="bg-white border rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${color} flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0`}>
        {typeof value === 'number' && value > 99 ? "99+" : typeof value === 'number' ? value : "৳"}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] md:text-xs text-gray-500 truncate">{label}</p>
        <p className="text-sm md:text-lg font-semibold truncate">{displayValue}</p>
      </div>
    </div>
  );
}
