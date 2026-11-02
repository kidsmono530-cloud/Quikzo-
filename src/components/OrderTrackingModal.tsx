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
  Phone,
  Shield,
  KeyRound
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated?: (order: Order) => void;
}

const statusSteps: { key: OrderStatus; label: string; icon: any }[] = [
  { key: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'Packed', label: 'Order Packed', icon: PackageCheck },
  { key: 'Ready for Pickup', label: 'Ready for Pickup', icon: Clock },
  { key: 'Assigned', label: 'Delivery Partner Assigned', icon: Bike },
  { key: 'Picked Up', label: 'Order Picked Up', icon: Bike },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCheck }
];

const statusProgressionMap: Record<OrderStatus, number> = {
  Pending: 0,
  Confirmed: 1,
  Packed: 2,
  'Ready for Pickup': 3,
  Assigned: 4,
  Accepted: 4,
  'Picked Up': 5,
  'Out for Delivery': 6,
  Delivered: 7,
  'Delivery Failed': 4,
  Returned: 4,
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

  // Generate a friendly 4-digit delivery verification OTP from order ID
  const deliveryOtp = Math.abs(
    order.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000) % 9000 + 1000
  );

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0B0B0B]">
                Order Tracking
              </h2>
              <span className="font-mono text-xs font-black bg-amber-100 text-[#0B0B0B] px-2.5 py-0.5 rounded-lg border border-amber-300">
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
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {cancelError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cancelError}</span>
            </div>
          )}

          {/* Delivery ETA banner */}
          <div className="bg-[#0B0B0B] text-white p-4 sm:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-gray-800">
            <div>
              <span className="text-[11px] text-[#FFCD00] uppercase tracking-wider font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFCD00] animate-pulse" />
                Live Status: {order.status}
              </span>
              <h3 className="text-lg font-black mt-1 flex items-center gap-2 text-white">
                {isCancelled ? (
                  <span className="text-rose-400">Order Cancelled</span>
                ) : isDelivered ? (
                  <span className="text-[#FFCD00]">Delivered Successfully! 🎉</span>
                ) : (
                  <span>Arriving in {order.estimatedDelivery || '10-15 mins'} ⚡</span>
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isCancelled
                  ? 'Your order has been cancelled and any paid amounts will be refunded.'
                  : isDelivered
                  ? 'Thank you for shopping with Quikzo!'
                  : 'Fast hyperlocal delivery in Bengaluru with fresh essentials guaranteed.'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              {isCancelled ? (
                <XCircle className="w-7 h-7 text-rose-400" />
              ) : isDelivered ? (
                <CheckCheck className="w-7 h-7 text-[#FFCD00]" />
              ) : (
                <Truck className="w-7 h-7 text-[#FFCD00] animate-bounce" />
              )}
            </div>
          </div>

          {/* Delivery Partner & OTP Card */}
          {!isCancelled && !isDelivered && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFCD00] text-[#0B0B0B] flex items-center justify-center font-black shadow-xs shrink-0">
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#0B0B0B]">
                      {order.deliveryBoyName || 'Assigning Delivery Partner...'}
                    </h4>
                    {order.deliveryBoyName && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Assigned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {order.deliveryBoyPhone ? (
                      <span>Phone: <a href={`tel:${order.deliveryBoyPhone}`} className="font-mono font-bold text-[#0B0B0B] underline">{order.deliveryBoyPhone}</a></span>
                    ) : (
                      'Nearby rider is being dispatched'
                    )}
                  </p>
                </div>
              </div>

              {/* Delivery OTP Badge */}
              <div className="bg-white border border-amber-300 rounded-xl px-3.5 py-2 flex items-center gap-2.5 shadow-2xs self-start sm:self-auto">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                    Delivery OTP
                  </span>
                  <span className="font-mono text-base font-black text-[#0B0B0B] tracking-widest">
                    {deliveryOtp}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="py-2 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-black text-[#0B0B0B] uppercase tracking-wider mb-4">
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
                            state === 'completed' ? 'bg-[#FFCD00]' : 'bg-gray-200'
                          }`}
                        />
                      )}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                          state === 'completed'
                            ? 'bg-[#0B0B0B] text-[#FFCD00] shadow-xs'
                            : state === 'current'
                            ? 'bg-[#FFCD00] text-[#0B0B0B] ring-4 ring-amber-100 font-black shadow-xs'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              state === 'current'
                                ? 'text-[#0B0B0B] font-black'
                                : state === 'completed'
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          {state === 'current' && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FFCD00] text-[#0B0B0B] rounded-full border border-amber-300">
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
            <h4 className="text-xs font-black text-[#0B0B0B] uppercase tracking-wider mb-2">
              Ordered Items ({order.items.length})
            </h4>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50">
              {order.items.map((item, i) => (
                <div key={i} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-white shrink-0 border border-gray-100" />
                    <div>
                      <p className="font-bold text-[#0B0B0B]">{item.productName}</p>
                      <p className="text-[11px] text-gray-500">{item.brand} • {item.weight} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-[#0B0B0B] font-mono">
                    {formatINR(item.itemTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <h5 className="font-black text-[#0B0B0B] mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Delivery Address
              </h5>
              <p className="text-gray-800 font-bold">{order.deliveryAddress.fullName}</p>
              <p className="text-gray-600 text-[11px]">
                {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
              </p>
              <p className="text-gray-500 text-[11px] mt-0.5">Phone: {order.deliveryAddress.phone}</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
              <h5 className="font-black text-[#0B0B0B] mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Payment &amp; Bill
              </h5>
              <p className="text-gray-800 font-bold">{order.paymentMethod}</p>
              <p className="text-gray-500 text-[11px]">
                Status: <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </p>
              <p className="text-[#0B0B0B] font-black text-sm mt-1 font-mono">
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
            className="px-6 py-2.5 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95 ml-auto border border-amber-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reorder All Items</span>
          </button>
        </div>
      </div>
    </div>
  );
};
