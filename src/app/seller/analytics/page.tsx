"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
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
  Cell
} from "recharts";

interface OverviewData {
  todayOrders: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  activeRiders: number;
  pendingOrders: number;
  totalCustomers: number;
}

const COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const router = useRouter();
  const isSeller = useAuthStore((s) => s.isSeller);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [riderData, setRiderData] = useState<any>(null);

  useEffect(() => {
    if (!isSeller) {
      router.push("/seller");
    }
  }, [isSeller, router]);

  useEffect(() => {
    if (isSeller) {
      fetchOverview();
      fetchSalesData();
      fetchCustomerData();
      fetchProductData();
      fetchRiderData();
    }
  }, [isSeller, dateRange]);

  const fetchOverview = async () => {
    try {
      const { data } = await api.get("/api/analytics/overview");
      if (data.success) {
        setOverview(data.overview);
      }
    } catch (error) {
      console.error("Failed to fetch overview:", error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const { data } = await api.get(`/api/analytics/sales?startDate=${startDate}&endDate=${endDate}`);
      if (data.success) {
        setSalesData(data);
      }
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const { data } = await api.get(`/api/analytics/customers?startDate=${startDate}&endDate=${endDate}`);
      if (data.success) {
        setCustomerData(data);
      }
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
    }
  };

  const fetchProductData = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const { data } = await api.get(`/api/analytics/products?startDate=${startDate}&endDate=${endDate}`);
      if (data.success) {
        setProductData(data);
      }
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    }
  };

  const fetchRiderData = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const { data } = await api.get(`/api/analytics/riders?startDate=${startDate}&endDate=${endDate}`);
      if (data.success) {
        setRiderData(data);
      }
    } catch (error) {
      console.error("Failed to fetch rider data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSeller) return null;

  const revenueChange = overview 
    ? ((overview.thisMonthRevenue - overview.lastMonthRevenue) / (overview.lastMonthRevenue || 1) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Detailed insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-600"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Link
              href="/seller"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Today's Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.todayOrders || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Today's Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">৳{overview?.todayRevenue?.toFixed(0) || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">৳{overview?.thisMonthRevenue?.toFixed(0) || 0}</p>
            <p className={`text-xs mt-1 ${parseFloat(revenueChange as string) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(revenueChange as string) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(revenueChange as string))}% vs last month
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Active Riders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.activeRiders || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.pendingOrders || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.totalCustomers || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "sales", label: "Sales" },
              { id: "customers", label: "Customers" },
              { id: "products", label: "Products" },
              { id: "riders", label: "Riders" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Sales Trend */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={salesData?.dailySales || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#16a34a" name="Revenue" />
                            <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Orders" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={salesData?.paymentMethods || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ payload, percent }: any) => `${payload._id}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {(salesData?.paymentMethods || []).map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Order Status */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={salesData?.orderStatus || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ payload, percent }: any) => `${payload._id}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {(salesData?.orderStatus || []).map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sales Tab */}
                {activeTab === "sales" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600">Total Orders</p>
                        <p className="text-2xl font-bold text-green-900">{salesData?.totalMetrics?.totalOrders || 0}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">৳{salesData?.totalMetrics?.totalRevenue?.toFixed(0) || 0}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600">Avg Order Value</p>
                        <p className="text-2xl font-bold text-green-900">৳{salesData?.totalMetrics?.avgOrderValue?.toFixed(0) || 0}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Daily Sales</h3>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesData?.dailySales || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#16a34a" name="Revenue" />
                            <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customers Tab */}
                {activeTab === "customers" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600">Total Customers</p>
                        <p className="text-2xl font-bold text-blue-900">{customerData?.totalCustomers || 0}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600">Active Customers</p>
                        <p className="text-2xl font-bold text-blue-900">{customerData?.activeCustomers || 0}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600">Retention Rate</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {customerData?.retention?.returningCustomers && customerData?.retention?.totalCustomers
                            ? ((customerData.retention.returningCustomers / customerData.retention.totalCustomers) * 100).toFixed(1)
                            : 0}%
                        </p>
                      </div>
                    </div>

                    {/* Top Customers */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-2">Customer</th>
                              <th className="text-left px-4 py-2">Orders</th>
                              <th className="text-left px-4 py-2">Total Spent</th>
                              <th className="text-left px-4 py-2">Avg Order</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(customerData?.topCustomers || []).map((customer: any) => (
                              <tr key={customer._id} className="border-b border-gray-100">
                                <td className="px-4 py-3">{customer.user?.name}</td>
                                <td className="px-4 py-3">{customer.totalOrders}</td>
                                <td className="px-4 py-3">৳{customer.totalSpent?.toFixed(0)}</td>
                                <td className="px-4 py-3">৳{customer.avgOrderValue?.toFixed(0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                  <div className="space-y-6">
                    {/* Top Products */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={productData?.topProducts || []} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="product.name" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalSold" fill="#16a34a" name="Units Sold" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-600">Low Stock Alert</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {(productData?.lowStock || []).map((product: any) => (
                          <div key={product._id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-red-900">{product.name}</p>
                            <p className="text-xs text-red-600 mt-1">Only {product.quantity} left</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Riders Tab */}
                {activeTab === "riders" && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-600">Active Riders</p>
                        <p className="text-2xl font-bold text-yellow-900">{riderData?.activeRiders || 0}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-600">Total Riders</p>
                        <p className="text-2xl font-bold text-yellow-900">{riderData?.totalRiders || 0}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-600">Avg Delivery Time</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {riderData?.avgDeliveryTime ? (riderData.avgDeliveryTime / 60000).toFixed(0) : 0} min
                        </p>
                      </div>
                    </div>

                    {/* Top Riders */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Top Performing Riders</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-2">Rider</th>
                              <th className="text-left px-4 py-2">Total Deliveries</th>
                              <th className="text-left px-4 py-2">Completed</th>
                              <th className="text-left px-4 py-2">Cancelled</th>
                              <th className="text-left px-4 py-2">Success Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(riderData?.topRiders || []).map((rider: any) => (
                              <tr key={rider._id} className="border-b border-gray-100">
                                <td className="px-4 py-3">{rider.rider?.name}</td>
                                <td className="px-4 py-3">{rider.totalDeliveries}</td>
                                <td className="px-4 py-3 text-green-600">{rider.completedDeliveries}</td>
                                <td className="px-4 py-3 text-red-600">{rider.cancelledDeliveries}</td>
                                <td className="px-4 py-3">
                                  {((rider.completedDeliveries / rider.totalDeliveries) * 100).toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
