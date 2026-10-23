import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { getOrders, updateOrderStatus } from '../../lib/api';
import { formatINR, formatDate } from '../../lib/formatters';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Clock,
  CheckCheck,
  RefreshCw,
  X,
  MapPin,
  CreditCard,
  User
} from 'lucide-react';

const statuses: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
      if (selectedOrder) {
        const fresh = data.find(o => o.id === selectedOrder.id);
        if (fresh) setSelectedOrder(fresh);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll orders periodically in admin
    const timer = setInterval(() => {
      getOrders().then(data => setOrders(data)).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(orderId, newStatus, `Status updated by administrator to ${newStatus}`);
      await loadData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            Order Fulfillment &amp; Dispatch
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time grocery orders, advance delivery stages, and manage cancellations
          </p>
        </div>
        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID (GJ-ORD-...), customer name, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-hidden font-medium"
          >
            <option value="">All Statuses ({orders.length})</option>
            {statuses.map(st => (
              <option key={st} value={st}>
                {st} ({orders.filter(o => o.status === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Delivery Area</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total (₹)</th>
                <th className="py-3 px-4">Status &amp; Transition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      <div>{order.id}</div>
                      <span className="text-[10px] text-gray-400 block font-sans">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{order.customerName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">+91 {order.customerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="text-gray-900 font-semibold truncate">
                        {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">
                        {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-900">{order.items.length} items</span>
                      <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
                        {order.items.map(i => i.productName).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-950 font-mono text-sm">
                        {formatINR(order.total)}
                      </div>
                      <span className="text-[10px] text-gray-400 block">
                        {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Paid Online'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        disabled={updatingStatus}
                        value={order.status}
                        onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : order.status === 'Out for Delivery'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {statuses.map(st => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-950">
                    Order Details
                  </h2>
                  <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                    {selectedOrder.id}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* Status Update Control */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-gray-700 block">
                    Current Fulfillment Status
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Changing status immediately syncs to customer's live tracking view.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="px-3 py-2 bg-white border border-gray-300 font-bold rounded-xl text-xs"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" /> Customer Information
                  </h4>
                  <p className="text-gray-800 font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-gray-500">Phone: {selectedOrder.customerPhone}</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">User ID: {selectedOrder.userId}</p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Delivery Address
                  </h4>
                  <p className="text-gray-800 font-semibold">{selectedOrder.deliveryAddress.fullName}</p>
                  <p className="text-gray-600">
                    {selectedOrder.deliveryAddress.houseNumber}, {selectedOrder.deliveryAddress.street}
                  </p>
                  <p className="text-gray-500">{selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
                  Packaged Items ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={it.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-50 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">{it.productName}</p>
                          <p className="text-[11px] text-gray-500">
                            {it.brand} • {it.weight} • Qty: <strong>{it.quantity}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-950 font-mono">
                        {formatINR(it.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials Breakdown */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 font-medium">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({selectedOrder.couponCode || 'Promo'})</span>
                    <span className="font-mono">-{formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-mono">{formatINR(selectedOrder.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (GST)</span>
                  <span className="font-mono">{formatINR(selectedOrder.tax)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-950">
                  <span>Total Amount</span>
                  <span className="font-mono text-emerald-700">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
