import React, { useState, useEffect } from 'react';
import {
  DeliveryBoyProfile,
  Order,
  OrderStatus
} from '../../types';
import {
  getAssignedDeliveryOrders,
  updateDeliveryOrderStatus,
  collectDeliveryCash,
  reportDeliveryIssue,
  getDeliveryStaffStats,
  changeDeliveryPassword,
  deliveryLogout
} from '../../lib/api';
import { formatINR } from '../../lib/formatters';
import { QuikzoLogo } from '../QuikzoLogo';
import {
  LayoutDashboard,
  Package,
  CheckCircle2,
  User,
  LogOut,
  Bike,
  Phone,
  Navigation,
  Clock,
  MapPin,
  AlertTriangle,
  Banknote,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  X
} from 'lucide-react';

interface DeliveryDashboardProps {
  deliveryBoy: DeliveryBoyProfile;
  onLogout: () => void;
  onExitToStore: () => void;
}

type DeliveryNavTab = 'dashboard' | 'assigned' | 'completed' | 'profile';

export const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({
  deliveryBoy,
  onLogout,
  onExitToStore
}) => {
  const [currentTab, setCurrentTab] = useState<DeliveryNavTab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    newAssigned: 0,
    toPickUp: 0,
    outForDelivery: 0,
    completed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Issue reporting modal
  const [selectedIssueOrder, setSelectedIssueOrder] = useState<Order | null>(null);
  const [issueReason, setIssueReason] = useState('Customer Unavailable');
  const [issueNotes, setIssueNotes] = useState('');

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const loadData = async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        getAssignedDeliveryOrders(),
        getDeliveryStaffStats()
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (e: any) {
      console.error('Failed to load delivery orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh orders every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    setActionLoadingId(orderId);
    setStatusMessage(null);
    try {
      const res = await updateDeliveryOrderStatus(orderId, newStatus, note);
      if (res.success) {
        setStatusMessage({ text: `Order #${orderId} marked as ${newStatus}!`, type: 'success' });
        await loadData();
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to update order status.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCollectCash = async (orderId: string) => {
    if (!window.confirm('Confirm that you have collected cash payment from the customer?')) {
      return;
    }
    setActionLoadingId(orderId);
    setStatusMessage(null);
    try {
      const res = await collectDeliveryCash(orderId);
      if (res.success) {
        setStatusMessage({ text: 'Cash payment marked as collected!', type: 'success' });
        await loadData();
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to record cash collection.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueOrder) return;
    setActionLoadingId(selectedIssueOrder.id);
    try {
      const res = await reportDeliveryIssue(selectedIssueOrder.id, issueReason, issueNotes);
      if (res.success) {
        setStatusMessage({ text: 'Delivery issue recorded and reported to store admin.', type: 'success' });
        setSelectedIssueOrder(null);
        setIssueNotes('');
        await loadData();
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to report issue.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await changeDeliveryPassword(currentPassword, newPassword);
      setPasswordMsg({ text: res.message, isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Failed to change password.', isError: true });
    }
  };

  const handleLogout = async () => {
    await deliveryLogout();
    onLogout();
  };

  // Slices for tabs
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const completedOrders = orders.filter(o => o.status === 'Delivered');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-20 sm:pb-6 select-none">
      
      {/* Top Mobile & Desktop Navbar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC700] text-[#0A192F] flex items-center justify-center font-black text-sm shadow-md">
              <Bike className="w-5 h-5 text-[#0A192F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  Quikzo Fleet
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  Partner
                </span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{deliveryBoy.name}</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 font-mono text-[10px]">@{deliveryBoy.username}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              title="Refresh Orders"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onExitToStore}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Store</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Toast Status Message */}
      {statusMessage && (
        <div className="max-w-5xl mx-auto w-full px-4 pt-3">
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 flex-1 space-y-6">

        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW                                      */}
        {/* ============================================================== */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: New Assigned */}
              <div
                onClick={() => setCurrentTab('assigned')}
                className="bg-slate-950 border border-slate-800 hover:border-orange-500/50 p-4 rounded-2xl shadow-sm cursor-pointer transition-all hover:scale-101"
              >
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">New Assigned</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.newAssigned}</div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">Ready to accept</div>
              </div>

              {/* Card 2: To Pick Up */}
              <div
                onClick={() => setCurrentTab('assigned')}
                className="bg-slate-950 border border-slate-800 hover:border-orange-500/50 p-4 rounded-2xl shadow-sm cursor-pointer transition-all hover:scale-101"
              >
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">To Pick Up</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.toPickUp}</div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">At store / ready</div>
              </div>

              {/* Card 3: Out for Delivery */}
              <div
                onClick={() => setCurrentTab('assigned')}
                className="bg-slate-950 border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl shadow-sm cursor-pointer transition-all hover:scale-101"
              >
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">On The Way</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Bike className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.outForDelivery}</div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">In transit to customer</div>
              </div>

              {/* Card 4: Completed Deliveries */}
              <div
                onClick={() => setCurrentTab('completed')}
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl shadow-sm cursor-pointer transition-all hover:scale-101"
              >
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stats.completed}</div>
                <div className="text-[11px] text-gray-500 mt-1 font-medium">Successfully delivered</div>
              </div>
            </div>

            {/* Quick Actions & Urgent Active Orders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <span>Active Deliveries ({activeOrders.length})</span>
                </h2>
                {activeOrders.length > 0 && (
                  <button
                    onClick={() => setCurrentTab('assigned')}
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    View All →
                  </button>
                )}
              </div>

              {activeOrders.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-gray-500 flex items-center justify-center mx-auto">
                    <Bike className="w-7 h-7 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-white text-sm">No Active Deliveries Right Now</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    You have no active orders in your queue. When the store administrator assigns you a new grocery order, it will appear here immediately.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.slice(0, 3).map(order => (
                    <OrderDeliveryCard
                      key={order.id}
                      order={order}
                      loadingId={actionLoadingId}
                      onUpdateStatus={handleUpdateStatus}
                      onCollectCash={handleCollectCash}
                      onOpenIssueModal={setSelectedIssueOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ASSIGNED ORDERS                                         */}
        {/* ============================================================== */}
        {currentTab === 'assigned' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-lg text-white tracking-tight">
                  Assigned Deliveries ({activeOrders.length})
                </h2>
                <p className="text-xs text-gray-400">
                  Accept orders, confirm pickup, navigate to customer, and collect payments.
                </p>
              </div>
            </div>

            {activeOrders.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-white text-sm">All caught up!</h3>
                <p className="text-xs text-gray-400">No pending orders to deliver right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <OrderDeliveryCard
                    key={order.id}
                    order={order}
                    loadingId={actionLoadingId}
                    onUpdateStatus={handleUpdateStatus}
                    onCollectCash={handleCollectCash}
                    onOpenIssueModal={setSelectedIssueOrder}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: COMPLETED DELIVERIES                                    */}
        {/* ============================================================== */}
        {currentTab === 'completed' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-extrabold text-lg text-white tracking-tight">
                Delivery History ({completedOrders.length})
              </h2>
              <p className="text-xs text-gray-400">
                Orders successfully delivered to customers.
              </p>
            </div>

            {completedOrders.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 text-center space-y-2">
                <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto" />
                <h3 className="font-bold text-white text-sm">No completed deliveries yet</h3>
                <p className="text-xs text-gray-400">Your completed deliveries will be archived here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          Delivered
                        </span>
                      </div>
                      <span className="font-mono font-black text-amber-400 text-sm">
                        {formatINR(order.total)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 flex flex-col gap-1">
                      <div className="text-gray-300 font-semibold">{order.customerName}</div>
                      <div className="truncate text-gray-500">
                        {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-1">
                        Completed at: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString() : new Date(order.updatedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PROFILE & SECURITY                                      */}
        {/* ============================================================== */}
        {currentTab === 'profile' && (
          <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Delivery Boy Identity Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC700] text-[#0A192F] font-black text-2xl flex items-center justify-center mx-auto shadow-xl">
                {deliveryBoy.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <h2 className="text-lg font-black text-white">{deliveryBoy.name}</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">@{deliveryBoy.username}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold mt-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Delivery Partner</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-left text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Contact Phone</div>
                  <div className="font-mono text-gray-200 mt-0.5">+91 {deliveryBoy.phone}</div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Official Email</div>
                  <div className="truncate text-gray-200 mt-0.5">{deliveryBoy.email}</div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Vehicle Type</div>
                  <div className="text-gray-200 mt-0.5">{deliveryBoy.vehicleType || 'Motorcycle / Bike'}</div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Vehicle Number</div>
                  <div className="font-mono text-gray-200 mt-0.5">{deliveryBoy.vehicleNumber || 'KA-01-EQ-9876'}</div>
                </div>
              </div>
            </div>

            {/* Actions: Change Password & Sign Out */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden text-xs font-bold">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900 text-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-950/40 text-rose-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Fleet App</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-500/50" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR                                   */}
      {/* ============================================================== */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-950 border-t border-slate-800 z-40 px-2 py-1.5 flex items-center justify-around sm:hidden">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            currentTab === 'dashboard' ? 'text-[#FF6B00]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('assigned')}
          className={`relative flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            currentTab === 'assigned' ? 'text-[#FF6B00]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Assigned</span>
          {activeOrders.length > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[9px] font-black flex items-center justify-center">
              {activeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('completed')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            currentTab === 'completed' ? 'text-[#FF6B00]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span>Completed</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-colors ${
            currentTab === 'profile' ? 'text-[#FF6B00]' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* MODAL: REPORT DELIVERY ISSUE                                   */}
      {/* ============================================================== */}
      {selectedIssueOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Report Delivery Problem</span>
              </div>
              <button
                onClick={() => setSelectedIssueOrder(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Reporting a problem will flag order <strong className="text-white font-mono">#{selectedIssueOrder.id}</strong> and notify the store administrator.
            </p>

            <form onSubmit={handleSubmitIssue} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Issue Category *</label>
                <select
                  value={issueReason}
                  onChange={e => setIssueReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-hidden focus:border-[#FF6B00]"
                >
                  <option value="Customer Unavailable">Customer Unavailable / Phone Not Reachable</option>
                  <option value="Incorrect Address">Incorrect or Incomplete Address</option>
                  <option value="Customer Requested Cancellation">Customer Requested Cancellation</option>
                  <option value="Payment Issue">Customer Refused Payment</option>
                  <option value="Other Problem">Other Problem</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Detailed Notes</label>
                <textarea
                  rows={3}
                  value={issueNotes}
                  onChange={e => setIssueNotes(e.target.value)}
                  placeholder="Explain what happened at the delivery location..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-hidden focus:border-[#FF6B00] placeholder:text-gray-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIssueOrder(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === selectedIssueOrder.id}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {actionLoadingId === selectedIssueOrder.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Submit Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CHANGE PASSWORD                                         */}
      {/* ============================================================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Change Account Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordMsg.isError
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">New Password * (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-hidden focus:border-[#FF6B00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8500] hover:from-[#FF5500] hover:to-[#FF7700] text-white font-bold rounded-xl"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==============================================================
// SUBCOMPONENT: ORDER DELIVERY CARD
// ==============================================================
interface OrderDeliveryCardProps {
  order: Order;
  loadingId: string | null;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onCollectCash: (orderId: string) => void;
  onOpenIssueModal: (order: Order) => void;
}

const OrderDeliveryCard: React.FC<OrderDeliveryCardProps> = ({
  order,
  loadingId,
  onUpdateStatus,
  onCollectCash,
  onOpenIssueModal
}) => {
  const isLoading = loadingId === order.id;
  const isCOD = order.paymentMethod === 'Cash on Delivery';
  const isCODPending = isCOD && order.paymentStatus === 'Pending';

  const fullAddress = `${order.deliveryAddress.houseNumber}, ${order.deliveryAddress.street}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-md transition-all">
      {/* Top Header: Order ID, Amount, Status Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-white text-sm">#{order.id}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                order.status === 'Assigned'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : order.status === 'Accepted'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : order.status === 'Picked Up' || order.status === 'Out for Delivery'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/30 animate-pulse'
                  : 'bg-slate-800 text-gray-300 border-slate-700'
              }`}
            >
              {order.status}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
            Assigned: {order.assignedAt ? new Date(order.assignedAt).toLocaleTimeString() : 'Recently'}
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono font-black text-amber-400 text-base sm:text-lg">
            {formatINR(order.total)}
          </div>
          <div
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isCODPending ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isCOD ? (isCODPending ? '⚠️ Collect COD' : '✓ Cash Paid') : '✓ Prepaid Online'}
          </div>
        </div>
      </div>

      {/* Customer Info & Direct Action Triggers */}
      <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-white">{order.customerName}</div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">+91 {order.customerPhone}</div>
          </div>

          <div className="flex items-center gap-2">
            {/* Call Customer Button */}
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>

            {/* Navigate Google Maps Button */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Map</span>
            </a>
          </div>
        </div>

        {/* Address */}
        <div className="pt-2 border-t border-slate-800/60 flex items-start gap-2 text-xs text-gray-300">
          <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{fullAddress}</span>
        </div>
      </div>

      {/* Items Summary Accordion Preview */}
      <div className="text-xs space-y-1.5">
        <div className="text-gray-400 font-semibold flex items-center justify-between">
          <span>Items to deliver ({order.items.reduce((sum, i) => sum + i.quantity, 0)})</span>
          <span className="text-[11px] text-gray-500">{order.items.length} products</span>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-2.5 divide-y divide-slate-800/60 text-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between">
              <span className="text-gray-200">
                <strong className="text-white font-mono">{item.quantity}x</strong> {item.productName} ({item.weight})
              </span>
              <span className="text-gray-400 font-mono">{formatINR(item.itemTotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cash on Delivery Collection Toggle */}
      {isCODPending && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <Banknote className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold">Collect Cash on Delivery: {formatINR(order.total)}</div>
              <div className="text-[10px] text-amber-400/80">Pending payment collection</div>
            </div>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onCollectCash(order.id)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            Mark Paid
          </button>
        </div>
      )}

      {/* Action Workflow Buttons */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {order.status === 'Assigned' && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onUpdateStatus(order.id, 'Accepted', 'Order delivery accepted by partner')}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>1. ACCEPT ORDER</span>}
          </button>
        )}

        {order.status === 'Accepted' && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onUpdateStatus(order.id, 'Picked Up', 'Order collected and packed by partner')}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>2. CONFIRM PICKED UP</span>}
          </button>
        )}

        {order.status === 'Picked Up' && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onUpdateStatus(order.id, 'Out for Delivery', 'Partner on the way to delivery address')}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8500] hover:from-[#FF5500] hover:to-[#FF7700] text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>3. START DELIVERY (ON THE WAY)</span>}
          </button>
        )}

        {order.status === 'Out for Delivery' && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onUpdateStatus(order.id, 'Delivered', 'Delivered to customer')}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-950 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>✓ MARK AS DELIVERED</span>}
          </button>
        )}

        {/* Report Issue Button */}
        <button
          type="button"
          onClick={() => onOpenIssueModal(order)}
          className="py-3 px-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Report Issue
        </button>
      </div>
    </div>
  );
};
