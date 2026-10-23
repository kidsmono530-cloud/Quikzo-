import React, { useState, useEffect } from 'react';
import {
  DeliveryBoyProfile,
  Order
} from '../../types';
import {
  adminGetDeliveryBoys,
  adminCreateDeliveryBoy,
  adminUpdateDeliveryBoy,
  adminResetDeliveryBoyPassword,
  adminDeleteDeliveryBoy,
  adminAssignOrder,
  adminGetDeliveryReports,
  getOrders
} from '../../lib/api';
import { formatINR } from '../../lib/formatters';
import {
  Bike,
  Plus,
  Search,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Trash2,
  Edit2,
  X,
  Phone,
  Mail,
  UserCheck,
  MapPin,
  RefreshCw
} from 'lucide-react';

export const AdminDelivery: React.FC = () => {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoyProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState({
    totalAssigned: 0,
    awaitingPickup: 0,
    outForDelivery: 0,
    successfullyDelivered: 0,
    failedDeliveries: 0,
    totalCodCollected: 0,
    totalBoys: 0,
    activeBoys: 0
  });

  const [activeSubTab, setActiveSubTab] = useState<'boys' | 'assign' | 'tracking' | 'reports'>('assign');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBoy, setEditingBoy] = useState<DeliveryBoyProfile | null>(null);
  const [resettingBoy, setResettingBoy] = useState<DeliveryBoyProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Form states for create
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formVehicleType, setFormVehicleType] = useState('Bike');
  const [formVehicleNumber, setFormVehicleNumber] = useState('');

  const loadData = async () => {
    try {
      const [boysData, ordersData, reportsData] = await Promise.all([
        adminGetDeliveryBoys(),
        getOrders(),
        adminGetDeliveryReports()
      ]);
      setDeliveryBoys(boysData);
      setOrders(ordersData);
      setReports(reportsData);
    } catch (err: any) {
      console.error('Failed to load admin delivery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBoy = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await adminCreateDeliveryBoy({
        name: formName,
        username: formUsername,
        email: formEmail,
        phone: formPhone,
        password: formPassword,
        vehicleType: formVehicleType,
        vehicleNumber: formVehicleNumber,
        isActive: true
      });
      setFeedback({ message: res.message, isError: false });
      setShowCreateModal(false);
      // Reset form
      setFormName('');
      setFormUsername('');
      setFormEmail('');
      setFormPhone('');
      setFormPassword('');
      setFormVehicleNumber('');
      await loadData();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to create delivery boy.', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBoy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoy) return;
    setActionLoading(true);
    try {
      const res = await adminUpdateDeliveryBoy(editingBoy.id, {
        name: editingBoy.name,
        email: editingBoy.email,
        phone: editingBoy.phone,
        vehicleType: editingBoy.vehicleType,
        vehicleNumber: editingBoy.vehicleNumber,
        isActive: editingBoy.isActive
      });
      setFeedback({ message: res.message, isError: false });
      setEditingBoy(null);
      await loadData();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to update delivery boy.', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (boy: DeliveryBoyProfile) => {
    try {
      const updated = await adminUpdateDeliveryBoy(boy.id, { isActive: !boy.isActive });
      setFeedback({ message: `Account status updated for ${updated.deliveryBoy.name}`, isError: false });
      await loadData();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to toggle status', isError: true });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingBoy) return;
    setActionLoading(true);
    try {
      const res = await adminResetDeliveryBoyPassword(resettingBoy.id, newPassword);
      setFeedback({ message: res.message, isError: false });
      setResettingBoy(null);
      setNewPassword('');
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to reset password', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBoy = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove delivery boy ${name}?`)) return;
    try {
      await adminDeleteDeliveryBoy(id);
      setFeedback({ message: 'Delivery staff account removed.', isError: false });
      await loadData();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to delete delivery account', isError: true });
    }
  };

  const handleAssignOrder = async (orderId: string, deliveryBoyId: string) => {
    if (!deliveryBoyId) return;
    setActionLoading(true);
    try {
      const res = await adminAssignOrder(orderId, deliveryBoyId);
      setFeedback({ message: res.message, isError: false });
      await loadData();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Failed to assign order', isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter orders needing assignment or active
  const ordersToAssign = orders.filter(
    o => o.status !== 'Delivered' && o.status !== 'Cancelled'
  );

  const filteredBoys = deliveryBoys.filter(
    b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-gray-950 flex items-center gap-2.5">
            <Bike className="w-6 h-6 text-[#FF6B00]" />
            <span>Delivery Fleet Management</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Provision delivery staff accounts, assign active grocery orders, and monitor real-time fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8500] hover:from-[#FF5500] hover:to-[#FF7700] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Partner</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between ${
            feedback.isError
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-[11px] font-bold text-gray-500 uppercase">Active Fleet</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{reports.activeBoys} <span className="text-xs text-gray-400 font-normal">/ {reports.totalBoys}</span></div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 uppercase">Awaiting Pickup</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{reports.awaitingPickup}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase">Out for Delivery</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{reports.outForDelivery}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase">Delivered</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{reports.successfullyDelivered}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase">COD Collected</div>
          <div className="text-2xl font-black text-amber-500 mt-1">{formatINR(reports.totalCodCollected)}</div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('assign')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'assign'
              ? 'bg-[#0A192F] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Assign Orders ({ordersToAssign.length})
        </button>

        <button
          onClick={() => setActiveSubTab('boys')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'boys'
              ? 'bg-[#0A192F] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Manage Staff ({deliveryBoys.length})
        </button>

        <button
          onClick={() => setActiveSubTab('tracking')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'tracking'
              ? 'bg-[#0A192F] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Live Tracking &amp; Issues
        </button>

        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'reports'
              ? 'bg-[#0A192F] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Performance Reports
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION C: ASSIGN ORDERS                                       */}
      {/* ============================================================== */}
      {activeSubTab === 'assign' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Active Grocery Orders Queue</h3>
                <p className="text-xs text-gray-500">Select a partner to assign or reassign deliveries.</p>
              </div>
            </div>

            {ordersToAssign.length === 0 ? (
              <div className="p-10 text-center text-gray-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-gray-800 text-sm">No Pending Orders to Assign</p>
                <p className="text-xs">All placed orders have been delivered or cancelled.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {ordersToAssign.map(order => {
                  return (
                    <div key={order.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-gray-950 text-sm">#{order.id}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            order.status === 'Assigned'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'Accepted'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'Picked Up' || order.status === 'Out for Delivery'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="text-gray-700">
                          <strong>{order.customerName}</strong> • +91 {order.customerPhone}
                        </div>

                        <div className="text-gray-500 flex items-center gap-1 truncate max-w-lg">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}, {order.deliveryAddress.city}</span>
                        </div>

                        <div className="text-[11px] text-gray-500">
                          {order.items.length} items • <strong className="text-gray-900 font-mono">{formatINR(order.total)}</strong> ({order.paymentMethod})
                        </div>
                      </div>

                      {/* Assignment Control */}
                      <div className="flex items-center gap-2 self-start md:self-center">
                        <div className="text-right mr-2 hidden lg:block">
                          <div className="text-[10px] uppercase font-bold text-gray-400">Current Partner</div>
                          <div className="font-bold text-gray-800">
                            {order.deliveryBoyName ? order.deliveryBoyName : <span className="text-rose-500">Unassigned</span>}
                          </div>
                        </div>

                        <select
                          disabled={actionLoading}
                          value={order.deliveryBoyId || ''}
                          onChange={e => handleAssignOrder(order.id, e.target.value)}
                          className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-semibold focus:border-[#FF6B00] focus:outline-hidden"
                        >
                          <option value="">-- Choose Partner --</option>
                          {deliveryBoys
                            .filter(b => b.isActive)
                            .map(b => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.phone})
                              </option>
                            ))}
                        </select>

                        <button
                          type="button"
                          disabled={actionLoading || !order.deliveryBoyId}
                          onClick={() => handleAssignOrder(order.id, order.deliveryBoyId!)}
                          title="Confirm Reassign"
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION B: MANAGE DELIVERY BOYS                                */}
      {/* ============================================================== */}
      {activeSubTab === 'boys' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search delivery boys by name, username, or phone..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-[#FF6B00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoys.map(boy => {
              const boyOrders = orders.filter(o => o.deliveryBoyId === boy.id);
              const activeCount = boyOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
              const deliveredCount = boyOrders.filter(o => o.status === 'Delivered').length;

              return (
                <div key={boy.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC700] text-[#0A192F] font-black text-sm flex items-center justify-center">
                        {boy.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{boy.name}</h4>
                        <div className="text-[11px] text-gray-400 font-mono">@{boy.username}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(boy)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        boy.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {boy.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-mono">+91 {boy.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{boy.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bike className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{boy.vehicleType} • <span className="font-mono">{boy.vehicleNumber || 'Unregistered'}</span></span>
                    </div>
                  </div>

                  {/* Delivery metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Active Deliveries</div>
                      <div className="font-black text-orange-600 text-sm">{activeCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Completed</div>
                      <div className="font-black text-emerald-600 text-sm">{deliveredCount}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setEditingBoy(boy)}
                      className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResettingBoy(boy)}
                      className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset Pwd</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBoy(boy.id, boy.name)}
                      className="text-rose-600 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION D: TRACKING & ISSUES                                   */}
      {/* ============================================================== */}
      {activeSubTab === 'tracking' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Recent Delivery Status Updates &amp; Issues</h3>
                <p className="text-xs text-gray-500">Live timeline logs and reported problems from delivery fleet staff.</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 text-xs">
              {orders
                .filter(o => Boolean(o.deliveryBoyId))
                .slice(0, 10)
                .map(order => (
                  <div key={order.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">#{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                          {order.status}
                        </span>
                        {order.deliveryIssue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Issue: {order.deliveryIssue.reason}</span>
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-gray-500 text-[11px]">
                        Assigned to: <strong>{order.deliveryBoyName}</strong> (+91 {order.deliveryBoyPhone})
                      </span>
                    </div>

                    <div className="text-gray-600 text-[11px] grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono">
                      <div>Assigned: {order.assignedAt ? new Date(order.assignedAt).toLocaleTimeString() : 'N/A'}</div>
                      <div>Accepted: {order.acceptedAt ? new Date(order.acceptedAt).toLocaleTimeString() : 'N/A'}</div>
                      <div>Dispatched: {order.dispatchedAt ? new Date(order.dispatchedAt).toLocaleTimeString() : 'N/A'}</div>
                      <div>Delivered: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString() : 'N/A'}</div>
                    </div>

                    {order.deliveryIssue?.notes && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                        <strong>Driver Notes:</strong> {order.deliveryIssue.notes}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION E: REPORTS                                             */}
      {/* ============================================================== */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-base text-gray-900">Fulfillment &amp; Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-xs text-gray-500 font-bold uppercase">Total Assigned Deliveries</div>
              <div className="text-3xl font-black text-gray-900 mt-2">{reports.totalAssigned}</div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="text-xs text-emerald-700 font-bold uppercase">Successfully Delivered</div>
              <div className="text-3xl font-black text-emerald-800 mt-2">{reports.successfullyDelivered}</div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <div className="text-xs text-rose-700 font-bold uppercase">Failed or Returned</div>
              <div className="text-3xl font-black text-rose-800 mt-2">{reports.failedDeliveries}</div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="text-xs text-amber-700 font-bold uppercase">Cash on Delivery Collected</div>
              <div className="text-3xl font-black text-amber-800 mt-2">{formatINR(reports.totalCodCollected)}</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="text-xs text-blue-700 font-bold uppercase">Fleet Team Size</div>
              <div className="text-3xl font-black text-blue-800 mt-2">{reports.totalBoys}</div>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="text-xs text-orange-700 font-bold uppercase">Active Today</div>
              <div className="text-3xl font-black text-orange-800 mt-2">{reports.activeBoys}</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE DELIVERY BOY                                     */}
      {/* ============================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-gray-950 flex items-center gap-2">
                <Bike className="w-5 h-5 text-[#FF6B00]" />
                <span>Create Delivery Boy Account</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoy} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Assigned Username *</label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="ramesh_quikzo"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="9876501234"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="ramesh@quikzo.com"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Temporary Initial Password * (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vehicle Type</label>
                  <select
                    value={formVehicleType}
                    onChange={e => setFormVehicleType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-hidden focus:border-[#FF6B00]"
                  >
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Electric Vehicle">Electric Vehicle (EV)</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vehicle Plate Number</label>
                  <input
                    type="text"
                    value={formVehicleNumber}
                    onChange={e => setFormVehicleNumber(e.target.value)}
                    placeholder="KA-01-EQ-9876"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-hidden focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8500] hover:from-[#FF5500] hover:to-[#FF7700] text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT DELIVERY BOY                                       */}
      {/* ============================================================== */}
      {editingBoy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-gray-950">Edit Partner Details</h3>
              <button onClick={() => setEditingBoy(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBoy} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingBoy.name}
                  onChange={e => setEditingBoy({ ...editingBoy, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={editingBoy.phone}
                  onChange={e => setEditingBoy({ ...editingBoy, phone: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={editingBoy.email}
                  onChange={e => setEditingBoy({ ...editingBoy, email: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vehicle Type</label>
                  <select
                    value={editingBoy.vehicleType || 'Bike'}
                    onChange={e => setEditingBoy({ ...editingBoy, vehicleType: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Electric Vehicle">Electric Vehicle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Vehicle Plate</label>
                  <input
                    type="text"
                    value={editingBoy.vehicleNumber || ''}
                    onChange={e => setEditingBoy({ ...editingBoy, vehicleNumber: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBoy(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-white font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RESET PASSWORD                                          */}
      {/* ============================================================== */}
      {resettingBoy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-gray-950">Reset Password</h3>
              <button onClick={() => setResettingBoy(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Set a new secure password for <strong>{resettingBoy.name}</strong> (@{resettingBoy.username}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">New Password * (min 6 characters)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResettingBoy(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
