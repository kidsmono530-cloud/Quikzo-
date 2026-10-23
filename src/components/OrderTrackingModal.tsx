import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { formatINR, formatDate } from '../lib/formatters';
import { cancelOrder } from '../lib/api';
import { useCart } from '../context/CartContext';
import {
  X,
  Clock,
  CheckCircle,
  PackageCheck,
  Truck,
  CheckCheck,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Loader2,
  MapPin,
  CreditCard,
  Bike,
  Phone
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated?: (order: Order) => void;
}

const statusSteps: { key: OrderStatus; label: string; icon: any }[] = [
  { key: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'Packed', label: 'Order Packed', icon: PackageCheck },
  { key: 'Assigned', label: 'Delivery Boy Assigned', icon: Bike },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCheck }
];

const statusProgressionMap: Record<OrderStatus, number> = {
  Pending: 0,
  Confirmed: 1,
  Packed: 2,
  'Ready for Pickup': 2,
  Assigned: 3,
  Accepted: 3,
  'Picked Up': 4,
  'Out for Delivery': 4,
  Delivered: 5,
  'Delivery Failed': 3,
  Returned: 3,
  Cancelled: -1
};

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onOrderUpdated
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!order) return null;

  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';
  const canCancel = ['Pending', 'Confirmed'].includes(order.status);

  const getStepStatus = (stepKey: OrderStatus) => {
    if (isCancelled) return 'cancelled';
    const currentProgression = statusProgressionMap[order.status] ?? 0;
    const stepProgression = statusProgressionMap[stepKey] ?? 0;

    if (stepProgression < currentProgression) return 'completed';
    if (stepProgression === currentProgression) return 'current';
    return 'upcoming';
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored immediately.')) {
      return;
    }
    setIsCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelOrder(order.id);
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReorder = () => {
    order.items.forEach(item => {
      // Reconstruct minimal product item
      addToCart({
        id: item.productId,
        name: item.productName,
        brand: item.brand,
        categoryId: 'cat-1',
        weight: item.weight,
        mrp: item.mrp,
        sellingPrice: item.price,
        discountPercentage: 0,
        stock: 50,
        image: item.image,
        description: '',
        isFeatured: false,
        isBestSeller: false,
        isActive: true,
        createdAt: '',
        updatedAt: ''
      }, item.quantity);
    });
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-950">
                Order Tracking
              </h2>
              <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                {order.id}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {cancelError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cancelError}</span>
            </div>
          )}

          {/* Delivery ETA banner */}
          <div className="bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#1E3A8A] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-slate-800">
            <div>
              <span className="text-xs text-[#FFC700] uppercase tracking-wider font-extrabold">
                Live Status
              </span>
              <h3 className="text-lg font-black mt-0.5 flex items-center gap-2">
                {isCancelled ? (
                  <span className="text-rose-300">Order Cancelled</span>
                ) : isDelivered ? (
                  <span className="text-emerald-300">Delivered Successfully! 🎉</span>
                ) : (
                  <span>Arriving in {order.estimatedDelivery} ⚡</span>
                )}
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                {isCancelled
                  ? 'Your order has been cancelled and any paid amounts will be refunded.'
                  : isDelivered
                  ? 'Thank you for shopping with Quikzo!'
                  : 'Our delivery partner is packing fresh groceries for you.'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              {isCancelled ? (
                <XCircle className="w-7 h-7 text-rose-300" />
              ) : isDelivered ? (
                <CheckCheck className="w-7 h-7 text-emerald-300" />
              ) : (
                <Truck className="w-7 h-7 text-[#FFC700] animate-bounce" />
              )}
            </div>
          </div>

          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="py-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                Delivery Timeline
              </h4>
              <div className="space-y-4">
                {statusSteps.map((step, idx) => {
                  const state = getStepStatus(step.key);
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex items-start gap-3 relative">
                      {/* Connecting Line */}
                      {idx < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 bottom-0 w-0.5 -mb-4 ${
                            state === 'completed' ? 'bg-emerald-600' : 'bg-gray-200'
                          }`}
                        />
                      )}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                          state === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : state === 'current'
                            ? 'bg-amber-400 text-gray-950 ring-4 ring-amber-100 font-bold'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              state === 'current'
                                ? 'text-emerald-800'
                                : state === 'completed'
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          {state === 'current' && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
              <strong>Order Status: Cancelled</strong>
              <p className="mt-1">Items have been returned to inventory.</p>
            </div>
          )}

          {/* Items in Order */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Ordered Items ({order.items.length})
            </h4>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
              {order.items.map((item, i) => (
                <div key={i} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-white shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-[11px] text-gray-500">{item.brand} • {item.weight} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-950 font-mono">
                    {formatINR(item.itemTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Delivery Address
              </h5>
              <p className="text-gray-700 font-semibold">{order.deliveryAddress.fullName}</p>
              <p className="text-gray-500 text-[11px]">
                {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
              </p>
              <p className="text-gray-400 text-[11px] mt-0.5">Phone: {order.deliveryAddress.phone}</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <h5 className="font-bold text-gray-900 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" /> Payment &amp; Bill
              </h5>
              <p className="text-gray-700 font-semibold">{order.paymentMethod}</p>
              <p className="text-gray-500 text-[11px]">
                Status: <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </p>
              <p className="text-gray-950 font-bold text-sm mt-1 font-mono">
                Total Paid: {formatINR(order.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
          {canCancel ? (
            <button
              disabled={isCancelling}
              onClick={handleCancelOrder}
              className="px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>Cancel Order</span>
            </button>
          ) : <div />}

          <button
            onClick={handleReorder}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95 ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reorder All Items</span>
          </button>
        </div>
      </div>
    </div>
  );
};
