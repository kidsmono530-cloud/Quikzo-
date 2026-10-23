import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/formatters';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onContinueShopping
}) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount,
    subtotal,
    mrpTotal,
    totalSavings,
    appliedCoupon,
    couponDiscount,
    couponMessage,
    applyCouponCode,
    removeCoupon,
    deliveryCharge,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    tax,
    finalTotal,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput.trim();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponError(null);
    setIsApplyingCoupon(true);
    const res = await applyCouponCode(code);
    setIsApplyingCoupon(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
      setShowCouponList(false);
    }
  };

  const sampleCoupons = [
    { code: 'GROCE100', desc: 'Flat ₹100 OFF on orders above ₹499' },
    { code: 'WELCOME50', desc: '15% instant discount (up to ₹75) on min ₹299' },
    { code: 'FREESHIP', desc: 'Free delivery waiver on min ₹199' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  My Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </h2>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  ⚡ Delivery in 10-15 mins
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {items.length === 0 ? (
              /* Empty Cart State */
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
                  <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Fill your basket with fresh vegetables, cooking oil, dairy, snacks, and daily groceries!
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onContinueShopping();
                  }}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors shadow-xs active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Free delivery progress bar */}
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-1.5">
                    {amountNeededForFreeDelivery > 0 ? (
                      <span>
                        Add <strong>{formatINR(amountNeededForFreeDelivery)}</strong> more for <strong>FREE Delivery</strong>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-800 font-bold">
                        <Check className="w-4 h-4" /> Yay! You've unlocked FREE Delivery
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-100">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="py-3.5 flex gap-3.5 items-center">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                        }}
                        className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {product.weight}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-sm font-bold text-gray-950 font-mono">
                            {formatINR(product.sellingPrice * quantity)}
                          </span>
                          {quantity > 1 && (
                            <span className="text-[10px] text-gray-400">
                              ({formatINR(product.sellingPrice)} each)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="shrink-0 flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 hover:bg-gray-200 text-gray-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          {quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-900 min-w-[1.25rem] text-center font-mono">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= product.stock}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className={`p-1.5 text-gray-700 transition-colors ${
                            quantity >= product.stock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-200'
                          }`}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupons Section */}
                <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" /> Coupons &amp; Offers
                    </span>
                    <button
                      onClick={() => setShowCouponList(!showCouponList)}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      {showCouponList ? 'Hide' : 'View All'}
                    </button>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-white border border-emerald-300 rounded-xl p-2.5 text-xs">
                      <div>
                        <span className="font-extrabold text-emerald-800 tracking-wider">
                          '{appliedCoupon.code}' APPLIED
                        </span>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          You saved {formatINR(couponDiscount)} with this code
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={e => {
                            setCouponInput(e.target.value);
                            setCouponError(null);
                          }}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl uppercase tracking-wider font-semibold focus:outline-hidden focus:border-emerald-600"
                        />
                        <button
                          disabled={isApplyingCoupon}
                          onClick={() => handleApplyCoupon()}
                          className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          {isApplyingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>

                      {couponError && (
                        <div className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" /> {couponError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available coupons drawer */}
                  {showCouponList && !appliedCoupon && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2">
                      {sampleCoupons.map(c => (
                        <div
                          key={c.code}
                          className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-100 text-xs"
                        >
                          <div>
                            <span className="font-black text-gray-900 tracking-wider bg-amber-100 px-1.5 py-0.5 rounded-sm">
                              {c.code}
                            </span>
                            <p className="text-[11px] text-gray-500 mt-0.5">{c.desc}</p>
                          </div>
                          <button
                            onClick={() => handleApplyCoupon(c.code)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-emerald-50 rounded-lg shrink-0 ml-2"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs space-y-2.5">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Bill Details</h4>

                  <div className="flex justify-between text-gray-600">
                    <span>Items Total (MRP)</span>
                    <span className="font-mono">{formatINR(mrpTotal)}</span>
                  </div>

                  {mrpTotal > subtotal && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Product Discount</span>
                      <span className="font-mono">-{formatINR(mrpTotal - subtotal)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Savings</span>
                      <span className="font-mono">-{formatINR(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-mono">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase">FREE</span>
                      ) : (
                        formatINR(deliveryCharge)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Taxes &amp; Packaging</span>
                    <span className="font-mono">{formatINR(tax)}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-950">
                    <span>To Pay</span>
                    <span className="font-mono text-base">{formatINR(finalTotal)}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 p-2 rounded-xl text-center">
                      🎉 Total Savings on this order: {formatINR(totalSavings)}!
                    </div>
                  )}
                </div>

                {/* Cancellation & Trust Notice */}
                <div className="text-[11px] text-gray-500 flex items-center gap-1.5 p-2 bg-gray-50 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Orders are hygienically packed and delivered under safety guidelines.</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-2 sticky bottom-0 z-10">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-between"
              >
                <div className="text-left font-mono">
                  <span className="text-xs text-emerald-200 block font-sans font-medium">Total</span>
                  <span className="text-base font-extrabold">{formatINR(finalTotal)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
