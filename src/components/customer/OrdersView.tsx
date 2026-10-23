import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { getOrders } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatINR, formatDate } from '../../lib/formatters';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  ArrowRight,
  RefreshCw,
  XCircle,
  PackageCheck
} from 'lucide-react';

interface OrdersViewProps {
  onTrackOrder: (order: Order) => void;
  onContinueShopping: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onTrackOrder,
  onContinueShopping
}) => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getOrders(user?.id);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll orders
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleReorder = (order: Order) => {
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
    setIsCartOpen(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track live deliveries and view order invoices
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">
            No orders placed yet
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mb-5">
            Browse our wide selection of groceries and get delivery at your doorstep in 10-15 mins!
          </p>
          <button
            onClick={onContinueShopping}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isLive = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery'].includes(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:border-emerald-500 transition-all"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gray-950 bg-white border border-gray-200 px-2 py-1 rounded-md">
                      {order.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : order.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'Out for Delivery' ? <Truck className="w-3.5 h-3.5" /> : null}
                      {order.status === 'Packed' ? <PackageCheck className="w-3.5 h-3.5" /> : null}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <img
                          src={item.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg bg-white shrink-0"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-gray-900 truncate max-w-[120px]">{item.productName}</p>
                          <p className="text-[10px] text-gray-500 font-mono">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Total Paid ({order.paymentMethod})</span>
                      <span className="text-base font-black text-gray-950 font-mono">
                        {formatINR(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-2 border border-gray-200 hover:border-emerald-600 text-gray-700 font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>

                      <button
                        onClick={() => onTrackOrder(order)}
                        className={`px-4 py-2 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs ${
                          isLive
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                      >
                        <span>{isLive ? 'Track Live Order' : 'Order Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
