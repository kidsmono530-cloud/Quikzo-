import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/formatters';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboard();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Store Overview &amp; Live Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time statistics connected to the customer store and database
          </p>
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-950 font-mono tracking-tight">
            {formatINR(stats?.totalSales || 0)}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Excludes cancelled orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-950 font-mono">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {stats?.completedOrders || 0} Delivered ({Math.round(((stats?.completedOrders || 0) / Math.max(1, stats?.totalOrders || 1)) * 100)}% completed)
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Active / In-Transit
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats?.pendingOrders || 0}
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            Require packing &amp; dispatch
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Low Stock Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {stats?.lowStockCount || 0}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <span>&lt; 10 units in stock</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold">Catalog Size</div>
              <div className="text-lg font-black text-gray-900">{stats?.totalProducts || 0} Products active</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Manage Products →
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold">Customer Base</div>
              <div className="text-lg font-black text-gray-900">{stats?.totalCustomers || 0} Registered customers</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('customers')}
            className="text-xs font-bold text-purple-700 hover:underline"
          >
            View Customers →
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              Recent Live Orders
            </h3>
            <span className="text-xs text-gray-500">
              Orders placed by customers in real-time
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Placed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {stats?.recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {order.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{order.customerName}</div>
                    <div className="text-[11px] text-gray-400">{order.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-950">
                    {formatINR(order.total)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded-md">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : order.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
