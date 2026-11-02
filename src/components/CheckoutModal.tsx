import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/formatters';
import { createOrder } from '../lib/api';
import { Order, Address } from '../types';
import {
  X,
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewAddress: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onAddNewAddress,
  onOrderSuccess
}) => {
  const { user, addresses, selectedAddress, setSelectedAddress } = useAuth();
  const {
    items,
    subtotal,
    appliedCoupon,
    couponDiscount,
    deliveryCharge,
    tax,
    finalTotal,
    clearCart,
    settings
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment'>('Cash on Delivery');
  const [onlineOption, setOnlineOption] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setErrorMessage('Please select or add a delivery address to proceed.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setErrorMessage(null);
    setIsPlacingOrder(true);

    try {
      const orderPayload = {
        userId: user?.id || 'guest-' + Date.now(),
        customerName: selectedAddress.fullName || user?.name || 'Customer',
        customerPhone: selectedAddress.phone || user?.phone || '9876543210',
        items: items.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          brand: i.product.brand || 'Quikzo',
          weight: i.product.weight || '1 unit',
          price: i.product.sellingPrice,
          mrp: i.product.mrp || i.product.sellingPrice,
          quantity: i.quantity,
          image: i.product.image || '',
          itemTotal: i.product.sellingPrice * i.quantity
        })),
        subtotal,
        discount: couponDiscount,
        deliveryCharge,
        tax,
        total: finalTotal,
        couponCode: appliedCoupon?.code,
        deliveryAddress: selectedAddress,
        paymentMethod
      };

      const created = await createOrder(orderPayload);
      clearCart();
      setIsPlacingOrder(false);
      onClose();
      onOrderSuccess(created);
    } catch (err: any) {
      setIsPlacingOrder(false);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-[#0B0B0B]">
              Confirm &amp; Place Order
            </h2>
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
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Delivery Address Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#0B0B0B] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                1. Delivery Address
              </h3>
              <button
                onClick={onAddNewAddress}
                className="text-xs font-bold text-[#0B0B0B] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-center">
                <p className="text-xs text-amber-900 mb-2 font-medium">
                  No saved delivery addresses found.
                </p>
                <button
                  onClick={onAddNewAddress}
                  className="px-4 py-2 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-xs rounded-xl shadow-xs border border-amber-300"
                >
                  + Add Address Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {addresses.map(addr => {
                  const isSelected = selectedAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#FFCD00] bg-amber-50/60 shadow-xs ring-2 ring-[#FFCD00]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-[#0B0B0B] flex items-center gap-1.5">
                          {addr.fullName}
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-700">
                            {addr.type}
                          </span>
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0B0B0B]" />}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {addr.houseNumber}, {addr.street}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">Phone: {addr.phone}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Order Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-[#0B0B0B] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              2. Order Summary ({items.length} items)
            </h3>
            <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 bg-gray-50 rounded-2xl p-3 border border-gray-200/80">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                      }}
                      className="w-9 h-9 object-cover rounded-lg bg-white shrink-0 border border-gray-100"
                    />
                    <div className="truncate">
                      <p className="font-bold text-[#0B0B0B] truncate">{product.name}</p>
                      <p className="text-[11px] text-gray-500">{product.weight} × {quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-[#0B0B0B] font-mono shrink-0 ml-2">
                    {formatINR(product.sellingPrice * quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-[#0B0B0B] flex items-center gap-2">
              <Banknote className="w-4 h-4 text-amber-600" />
              3. Payment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-[#FFCD00] bg-amber-50/60 ring-2 ring-[#FFCD00]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#0B0B0B] flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0B0B0B]">Cash on Delivery</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Pay via cash or UPI to delivery partner</p>
                </div>
              </div>

              {/* Online Payment */}
              <div
                onClick={() => setPaymentMethod('Online Payment')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'Online Payment'
                    ? 'border-[#FFCD00] bg-amber-50/60 ring-2 ring-[#FFCD00]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#0B0B0B] text-[#FFCD00] flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0B0B0B]">Online Payment</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">UPI, Debit/Credit Card, NetBanking</p>
                </div>
              </div>
            </div>

            {/* Sub-options for Online Payment */}
            {paymentMethod === 'Online Payment' && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOnlineOption('upi')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      onlineOption === 'upi' ? 'bg-[#0B0B0B] text-white' : 'bg-white border text-gray-700'
                    }`}
                  >
                    UPI (Google Pay, PhonePe, Paytm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineOption('card')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      onlineOption === 'card' ? 'bg-[#0B0B0B] text-white' : 'bg-white border text-gray-700'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineOption('netbanking')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      onlineOption === 'netbanking' ? 'bg-[#0B0B0B] text-white' : 'bg-white border text-gray-700'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>

                {onlineOption === 'upi' && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okicici"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#FFCD00] focus:outline-hidden text-gray-900"
                    />
                    <div className="flex gap-2 mt-2">
                      {['9876543210@paytm', 'rahul@okhdfcbank'].map(demo => (
                        <button
                          key={demo}
                          type="button"
                          onClick={() => setUpiId(demo)}
                          className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-600 hover:border-black font-mono"
                        >
                          Use {demo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {onlineOption === 'card' && (
                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Card Number (4532 •••• •••• ••••)"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl"
                      defaultValue="4532 8920 1192 3840"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-3 py-2 bg-white border border-gray-300 rounded-xl"
                        defaultValue="12/28"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        className="px-3 py-2 bg-white border border-gray-300 rounded-xl"
                        defaultValue="892"
                      />
                    </div>
                  </div>
                )}

                {onlineOption === 'netbanking' && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-left font-bold text-gray-800 hover:border-black"
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Bill Summary Details */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Items Total</span>
              <span className="font-mono text-gray-900">{formatINR(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Savings ({appliedCoupon?.code})</span>
                <span className="font-mono">-{formatINR(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-mono text-gray-900">
                {deliveryCharge === 0 ? <span className="text-emerald-700 font-bold uppercase">FREE</span> : formatINR(deliveryCharge)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST &amp; Handling</span>
              <span className="font-mono text-gray-900">{formatINR(tax)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-black text-[#0B0B0B]">
              <span>Final Payable</span>
              <span className="font-mono text-base font-black text-[#0B0B0B]">{formatINR(finalTotal)}</span>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 p-2.5 bg-amber-50/50 rounded-xl border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Guaranteed 10-15 minute delivery with contact-free option available.</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 block">Total Payable</span>
            <span className="text-xl font-black text-[#0B0B0B] font-mono">
              {formatINR(finalTotal)}
            </span>
          </div>

          <button
            disabled={isPlacingOrder || !selectedAddress}
            onClick={handlePlaceOrder}
            className="px-8 py-3.5 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-amber-300"
          >
            {isPlacingOrder ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0B0B0B]" />
                <span>Verifying &amp; Placing Order...</span>
              </>
            ) : (
              <span>Place Order ({paymentMethod === 'Cash on Delivery' ? 'COD' : 'Pay Now'})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
