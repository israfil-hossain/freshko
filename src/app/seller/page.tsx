"use client";

import Link from "next/link";
import { useGet } from "@/hooks/useGet";
import { useUIStore } from "@/stores/uiStore";
import type { DashboardStats, Order } from "@/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  UserX,
  DollarSign,
  Package,
  Users,
  CalendarCheck,
  Truck,
  TruckIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  ClipboardList,
  Box,
} from "lucide-react";

const PIE_COLORS = ["#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  unassigned: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  assigned: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
  "picked-up": { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  "in-transit": { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  cancelled: { bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getStatusStyle(status: string) {
  return statusColors[status] || statusColors.unassigned;
}

export default function AdminDashboardPage() {
  const currency = useUIStore((s) => s.currency);

  const { data: dashData, isLoading } = useGet<{
    success: boolean;
    stats: DashboardStats;
    ordersByMonth: {
      _id: { year: number; month: number };
      count: number;
      revenue: number;
    }[];
    recentOrders: Order[];
  }>(["admin-dashboard"], "/api/dashboard/stats");

  const stats = dashData?.stats;
  const ordersByMonth = dashData?.ordersByMonth || [];
  const recentOrders = dashData?.recentOrders || [];

  const chartData = ordersByMonth.map((m) => ({
    month: MONTH_NAMES[m._id.month - 1] || m._id.month,
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

  const totalItems = recentOrders.reduce((sum, o) => sum + o.items.length, 0);

  if (isLoading) {
    return (
      <div className="flex-1 h-[95vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">

        {/* ─── Welcome Banner ─── */}
        <div className="relative overflow-hidden rounded-2xl gradient-primary text-white p-6 md:p-8 animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="relative">
            <p className="text-white/60 text-sm mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin</h1>
            <p className="text-white/70 text-sm max-w-md">
              Here&apos;s what&apos;s happening with your store today. Track orders, revenue, and performance at a glance.
            </p>
          </div>
        </div>

        {/* ─── Primary Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <PrimaryStat
            icon={DollarSign}
            label="Total Revenue"
            value={`${currency}${(stats?.totalRevenue || 0).toLocaleString()}`}
            gradient="from-emerald-500 to-teal-600"
            delay={1}
          />
          <PrimaryStat
            icon={ShoppingBag}
            label="Total Orders"
            value={stats?.totalOrders || 0}
            gradient="from-blue-500 to-indigo-600"
            delay={2}
          />
          <PrimaryStat
            icon={Package}
            label="Products"
            value={stats?.totalProducts || 0}
            gradient="from-violet-500 to-purple-600"
            delay={3}
          />
          <PrimaryStat
            icon={Users}
            label="Customers"
            value={stats?.totalUsers || 0}
            gradient="from-amber-500 to-orange-600"
            delay={4}
          />
        </div>

        {/* ─── Secondary Stats ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SecondaryStat icon={CheckCircle2} label="Completed" value={stats?.completedOrders || 0} color="text-emerald-500" bg="bg-emerald-50" />
          <SecondaryStat icon={Clock} label="Pending" value={stats?.pendingOrders || 0} color="text-amber-500" bg="bg-amber-50" />
          <SecondaryStat icon={UserX} label="Unassigned" value={stats?.unassignedOrders || 0} color="text-gray-400" bg="bg-gray-50" />
          <SecondaryStat icon={CalendarCheck} label="Active Subs" value={stats?.activeSubscriptions || 0} color="text-pink-500" bg="bg-pink-50" />
          <SecondaryStat icon={Truck} label="Delivery Men" value={stats?.totalDeliveryMen || 0} color="text-cyan-500" bg="bg-cyan-50" />
          <SecondaryStat icon={TruckIcon} label="On Duty" value={stats?.onDutyDeliveryMen || 0} color="text-orange-500" bg="bg-orange-50" />
        </div>

        {/* ─── Charts ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-border-light p-5 md:p-6 animate-fade-in-up delay-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Orders Overview</h3>
                  <p className="text-xs text-muted">Last 6 months</p>
                </div>
              </div>
              {chartData.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" />
                  {chartData[chartData.length - 1]?.orders} this month
                </div>
              )}
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E8E5E0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                    cursor={{ fill: "rgba(27,48,34,0.04)" }}
                  />
                  <Bar dataKey="orders" fill="#1B3022" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No order data yet</p>
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border-light p-5 md:p-6 animate-fade-in-up delay-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Order Status</h3>
                <p className="text-xs text-muted">Distribution</p>
              </div>
            </div>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E8E5E0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted truncate">{d.name}</span>
                      <span className="font-semibold ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted">
                <PieChartIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No status data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Recent Orders + Quick Actions ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-border-light animate-fade-in-up delay-7">
            <div className="flex items-center justify-between p-5 pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Recent Orders</h3>
                  <p className="text-xs text-muted">{recentOrders.length} orders &middot; {totalItems} items total</p>
                </div>
              </div>
              <Link href="/seller/orders" className="text-xs font-medium text-primary hover:text-primary-light flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5">
              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted">
                  <Box className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-light">
                        <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">#</th>
                        <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Items</th>
                        <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Amount</th>
                        <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Status</th>
                        <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, i) => {
                        const status = getStatusStyle(order.deliveryStatus);
                        return (
                          <tr key={order._id} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                            <td className="px-5 py-3 text-muted font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[180px]">
                                  {order.items.slice(0, 2).map((item) => item.product?.name).join(", ")}
                                </span>
                                {order.items.length > 2 && (
                                  <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                                    +{order.items.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3 font-semibold">{currency}{order.amount}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {order.deliveryStatus || "unassigned"}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-muted text-xs whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-border-light p-5 animate-fade-in-up delay-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Quick Actions</h3>
                <p className="text-xs text-muted">Manage your store</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { href: "/seller/orders", icon: ClipboardList, label: "Manage Orders", desc: "View and process orders", color: "bg-blue-50 text-blue-600" },
                { href: "/seller/product-list", icon: Package, label: "Products", desc: "Add or edit products", color: "bg-violet-50 text-violet-600" },
                { href: "/seller/delivery-men", icon: Truck, label: "Delivery Men", desc: "Assign riders", color: "bg-cyan-50 text-cyan-600" },
                { href: "/seller/categories", icon: Box, label: "Categories", desc: "Organize products", color: "bg-amber-50 text-amber-600" },
                { href: "/seller/subscribers", icon: Users, label: "Subscribers", desc: "Manage subscriptions", color: "bg-pink-50 text-pink-600" },
                { href: "/seller/banners", icon: PieChartIcon, label: "Banners", desc: "Update homepage banners", color: "bg-emerald-50 text-emerald-600" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{action.label}</p>
                      <p className="text-xs text-muted truncate">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimaryStat({
  icon: Icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  gradient: string;
  delay: number;
}) {
  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-border-light p-5 card-hover animate-fade-in-up delay-${delay}`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-[0.07] rounded-full -translate-y-1/2 translate-x-1/2`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
}

function SecondaryStat({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 card-hover animate-fade-in-up">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2.5`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-[11px] text-muted leading-tight">{label}</p>
      <p className="text-lg font-bold mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}
