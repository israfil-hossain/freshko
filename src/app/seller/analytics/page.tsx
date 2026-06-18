"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Truck,
  Clock,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  UserCheck,
  Star,
  Package,
  Zap,
} from "lucide-react";

interface OverviewData {
  todayOrders: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  activeRiders: number;
  pendingOrders: number;
  totalCustomers: number;
}

const COLORS = ["#1B3022", "#2D5A3F", "#FF8A00", "#3b82f6", "#8b5cf6", "#ec4899"];
const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "sales", label: "Sales", icon: DollarSign },
  { id: "customers", label: "Customers", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "riders", label: "Riders", icon: Truck },
] as const;

export default function AnalyticsDashboard() {
  const router = useRouter();
  const isSeller = useAuthStore((s) => s.isSeller);
  const currency = useUIStore((s) => s.currency);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [riderData, setRiderData] = useState<any>(null);

  useEffect(() => {
    if (!isSeller) router.push("/seller");
  }, [isSeller, router]);

  useEffect(() => {
    if (isSeller) {
      setIsLoading(true);
      Promise.all([
        fetchOverview(),
        fetchSalesData(),
        fetchCustomerData(),
        fetchProductData(),
        fetchRiderData(),
      ]).finally(() => setIsLoading(false));
    }
  }, [isSeller, dateRange]);

  const fetchOverview = async () => {
    try {
      const { data } = await api.get("/api/analytics/overview");
      if (data.success) setOverview(data.overview);
    } catch (e) { console.error(e); }
  };

  const fetchSalesData = async () => {
    try {
      const end = new Date().toISOString();
      const start = new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString();
      const { data } = await api.get(`/api/analytics/sales?startDate=${start}&endDate=${end}`);
      if (data.success) setSalesData(data);
    } catch (e) { console.error(e); }
  };

  const fetchCustomerData = async () => {
    try {
      const end = new Date().toISOString();
      const start = new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString();
      const { data } = await api.get(`/api/analytics/customers?startDate=${start}&endDate=${end}`);
      if (data.success) setCustomerData(data);
    } catch (e) { console.error(e); }
  };

  const fetchProductData = async () => {
    try {
      const end = new Date().toISOString();
      const start = new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString();
      const { data } = await api.get(`/api/analytics/products?startDate=${start}&endDate=${end}`);
      if (data.success) setProductData(data);
    } catch (e) { console.error(e); }
  };

  const fetchRiderData = async () => {
    try {
      const end = new Date().toISOString();
      const start = new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString();
      const { data } = await api.get(`/api/analytics/riders?startDate=${start}&endDate=${end}`);
      if (data.success) setRiderData(data);
    } catch (e) { console.error(e); }
  };

  if (!isSeller) return null;

  const revenueChange = overview
    ? ((overview.thisMonthRevenue - overview.lastMonthRevenue) / (overview.lastMonthRevenue || 1) * 100)
    : 0;
  const revenueUp = revenueChange >= 0;

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="w-9 h-9 rounded-xl bg-white border border-border-light flex items-center justify-center hover:bg-surface-hover transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Analytics</h1>
              <p className="text-xs text-muted">Detailed insights and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["7", "30", "90", "365"].map((val) => (
              <button
                key={val}
                onClick={() => setDateRange(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-press cursor-pointer ${
                  dateRange === val
                    ? "gradient-primary text-white shadow-sm"
                    : "bg-white border border-border-light text-muted hover:text-foreground hover:border-border"
                }`}
              >
                {val === "7" ? "7D" : val === "30" ? "30D" : val === "90" ? "90D" : "1Y"}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Overview Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingBag}
            label="Today's Orders"
            value={overview?.todayOrders || 0}
            gradient="from-blue-500 to-indigo-600"
            delay={1}
          />
          <StatCard
            icon={DollarSign}
            label="Today's Revenue"
            value={`${currency}${(overview?.todayRevenue || 0).toFixed(0)}`}
            gradient="from-emerald-500 to-teal-600"
            delay={2}
          />
          <div className="relative overflow-hidden bg-white rounded-2xl border border-border-light p-5 card-hover animate-fade-in-up delay-3">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 opacity-[0.07] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs text-muted mb-0.5">Monthly Revenue</p>
            <p className="text-xl md:text-2xl font-bold">{currency}{(overview?.thisMonthRevenue || 0).toFixed(0)}</p>
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${revenueUp ? "text-emerald-600" : "text-red-500"}`}>
              {revenueUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(revenueChange).toFixed(1)}% vs last month
            </div>
          </div>
          <StatCard
            icon={Users}
            label="Total Customers"
            value={overview?.totalCustomers || 0}
            gradient="from-amber-500 to-orange-600"
            delay={4}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <MiniStat icon={Truck} label="Active Riders" value={overview?.activeRiders || 0} color="text-cyan-500" bg="bg-cyan-50" />
          <MiniStat icon={Clock} label="Pending Orders" value={overview?.pendingOrders || 0} color="text-amber-500" bg="bg-amber-50" />
          <MiniStat icon={Activity} label="Date Range" value={`${dateRange} days`} color="text-primary" bg="bg-primary/5" />
        </div>

        {/* ─── Tabs ─── */}
        <div className="bg-white rounded-2xl border border-border-light animate-fade-in-up delay-5">
          <div className="flex border-b border-border-light overflow-x-auto no-scrollbar p-1.5 gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "gradient-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-5 md:p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-muted animate-pulse">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* ─── Overview Tab ─── */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-border-light p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Sales Trend</h3>
                          <p className="text-xs text-muted">Revenue & orders over time</p>
                        </div>
                      </div>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesData?.dailySales || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: "12px", border: "1px solid #E8E5E0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                              cursor={{ stroke: "#1B3022", strokeDasharray: "4 4", strokeOpacity: 0.2 }}
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                            <Line type="monotone" dataKey="revenue" stroke="#1B3022" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#1B3022", stroke: "#fff", strokeWidth: 2 }} name="Revenue" />
                            <Line type="monotone" dataKey="orders" stroke="#FF8A00" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#FF8A00", stroke: "#fff", strokeWidth: 2 }} name="Orders" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Payment Methods */}
                      <div className="bg-white rounded-2xl border border-border-light p-5">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">Payment Methods</h3>
                            <p className="text-xs text-muted">COD vs Online split</p>
                          </div>
                        </div>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={salesData?.paymentMethods || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="count"
                                strokeWidth={0}
                              >
                                {(salesData?.paymentMethods || []).map((_: any, i: number) => (
                                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid #E8E5E0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                          {(salesData?.paymentMethods || []).map((m: any, i: number) => (
                            <div key={m._id} className="flex items-center gap-1.5 text-xs">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-muted capitalize">{m._id}</span>
                              <span className="font-semibold">{m.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Status */}
                      <div className="bg-white rounded-2xl border border-border-light p-5">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                            <PieChartIcon className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">Order Status</h3>
                            <p className="text-xs text-muted">Status distribution</p>
                          </div>
                        </div>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={salesData?.orderStatus || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="count"
                                strokeWidth={0}
                              >
                                {(salesData?.orderStatus || []).map((_: any, i: number) => (
                                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid #E8E5E0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                          {(salesData?.orderStatus || []).map((s: any, i: number) => (
                            <div key={s._id} className="flex items-center gap-1.5 text-xs">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-muted capitalize">{s._id}</span>
                              <span className="font-semibold">{s.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Sales Tab ─── */}
                {activeTab === "sales" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <MetricCard label="Total Orders" value={salesData?.totalMetrics?.totalOrders || 0} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" />
                      <MetricCard label="Total Revenue" value={`${currency}${(salesData?.totalMetrics?.totalRevenue || 0).toFixed(0)}`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
                      <MetricCard label="Avg Order Value" value={`${currency}${(salesData?.totalMetrics?.avgOrderValue || 0).toFixed(0)}`} icon={TrendingUp} color="text-violet-600" bg="bg-violet-50" />
                    </div>

                    <div className="bg-white rounded-2xl border border-border-light p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Daily Sales</h3>
                          <p className="text-xs text-muted">Revenue & orders per day</p>
                        </div>
                      </div>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesData?.dailySales || []} barCategoryGap="15%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: "12px", border: "1px solid #E8E5E0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                              cursor={{ fill: "rgba(27,48,34,0.04)" }}
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                            <Bar dataKey="revenue" fill="#1B3022" radius={[4, 4, 0, 0]} name="Revenue" />
                            <Bar dataKey="orders" fill="#FF8A00" radius={[4, 4, 0, 0]} name="Orders" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Customers Tab ─── */}
                {activeTab === "customers" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <MetricCard label="Total Customers" value={customerData?.totalCustomers || 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
                      <MetricCard label="Active Customers" value={customerData?.activeCustomers || 0} icon={UserCheck} color="text-emerald-600" bg="bg-emerald-50" />
                      <MetricCard
                        label="Retention Rate"
                        value={
                          customerData?.retention?.returningCustomers && customerData?.retention?.totalCustomers
                            ? `${((customerData.retention.returningCustomers / customerData.retention.totalCustomers) * 100).toFixed(1)}%`
                            : "0%"
                        }
                        icon={Star}
                        color="text-amber-600"
                        bg="bg-amber-50"
                      />
                    </div>

                    <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
                      <div className="flex items-center gap-3 p-5 pb-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Top Customers</h3>
                          <p className="text-xs text-muted">By spending</p>
                        </div>
                      </div>
                      <div className="p-5">
                        {(customerData?.topCustomers || []).length === 0 ? (
                          <div className="flex flex-col items-center py-12 text-muted">
                            <Users className="w-10 h-10 mb-3 opacity-30" />
                            <p className="text-sm">No customer data yet</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto -mx-5">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border-light">
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Customer</th>
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Orders</th>
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Total Spent</th>
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Avg Order</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(customerData?.topCustomers || []).map((c: any, i: number) => (
                                  <tr key={c._id} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                                    <td className="px-5 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                          {String(i + 1).padStart(2, "0")}
                                        </div>
                                        <span className="font-medium truncate">{c.user?.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-3 font-medium">{c.totalOrders}</td>
                                    <td className="px-5 py-3 font-semibold">{currency}{c.totalSpent?.toFixed(0)}</td>
                                    <td className="px-5 py-3 text-muted">{currency}{c.avgOrderValue?.toFixed(0)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Products Tab ─── */}
                {activeTab === "products" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-border-light p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Top Selling Products</h3>
                          <p className="text-xs text-muted">By units sold</p>
                        </div>
                      </div>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={productData?.topProducts || []} layout="vertical" barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis dataKey="product.name" type="category" width={140} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: "12px", border: "1px solid #E8E5E0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
                              cursor={{ fill: "rgba(27,48,34,0.04)" }}
                            />
                            <Bar dataKey="totalSold" fill="#1B3022" radius={[0, 6, 6, 0]} name="Units Sold" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-white rounded-2xl border border-border-light p-5">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Low Stock Alert</h3>
                          <p className="text-xs text-muted">Products running low</p>
                        </div>
                      </div>
                      {(productData?.lowStock || []).length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-muted">
                          <Package className="w-10 h-10 mb-3 opacity-30" />
                          <p className="text-sm">All products are well stocked</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {(productData?.lowStock || []).map((p: any) => (
                            <div key={p._id} className="bg-red-50/80 border border-red-200/60 rounded-xl p-3.5 card-hover">
                              <p className="text-sm font-medium text-red-900 truncate">{p.name}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Zap className="w-3 h-3 text-red-500" />
                                <p className="text-xs font-semibold text-red-600">{p.quantity} left</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── Riders Tab ─── */}
                {activeTab === "riders" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <MetricCard label="Active Riders" value={riderData?.activeRiders || 0} icon={Truck} color="text-cyan-600" bg="bg-cyan-50" />
                      <MetricCard label="Total Riders" value={riderData?.totalRiders || 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
                      <MetricCard
                        label="Avg Delivery Time"
                        value={riderData?.avgDeliveryTime ? `${(riderData.avgDeliveryTime / 60000).toFixed(0)} min` : "—"}
                        icon={Clock}
                        color="text-amber-600"
                        bg="bg-amber-50"
                      />
                    </div>

                    <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
                      <div className="flex items-center gap-3 p-5 pb-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Truck className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">Top Performing Riders</h3>
                          <p className="text-xs text-muted">By delivery success rate</p>
                        </div>
                      </div>
                      <div className="p-5">
                        {(riderData?.topRiders || []).length === 0 ? (
                          <div className="flex flex-col items-center py-12 text-muted">
                            <Truck className="w-10 h-10 mb-3 opacity-30" />
                            <p className="text-sm">No rider data yet</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto -mx-5">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border-light">
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Rider</th>
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Deliveries</th>
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Completed</th>
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Cancelled</th>
                                  <th className="text-left text-xs font-medium text-muted px-5 py-2.5 uppercase tracking-wider">Success Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(riderData?.topRiders || []).map((r: any) => {
                                  const rate = r.totalDeliveries > 0 ? (r.completedDeliveries / r.totalDeliveries) * 100 : 0;
                                  return (
                                    <tr key={r._id} className="border-b border-border-light last:border-0 hover:bg-surface-hover transition-colors">
                                      <td className="px-5 py-3 font-medium">{r.rider?.name}</td>
                                      <td className="px-5 py-3">{r.totalDeliveries}</td>
                                      <td className="px-5 py-3 text-emerald-600 font-medium">{r.completedDeliveries}</td>
                                      <td className="px-5 py-3 text-red-500 font-medium">{r.cancelledDeliveries}</td>
                                      <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full transition-all"
                                              style={{
                                                width: `${rate}%`,
                                                background: rate >= 80 ? "#22c55e" : rate >= 50 ? "#f59e0b" : "#ef4444",
                                              }}
                                            />
                                          </div>
                                          <span className="text-xs font-semibold">{rate.toFixed(0)}%</span>
                                        </div>
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
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

function MiniStat({
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
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className="text-lg font-bold mt-0.5">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border-light p-4 card-hover">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-lg font-bold truncate">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </div>
      </div>
    </div>
  );
}
