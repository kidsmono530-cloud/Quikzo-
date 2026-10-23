import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Coupon, StoreSettings } from '../types';
import { getSettings, validateCoupon } from '../lib/api';

export interface CartItemEntry {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItemEntry[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  itemCount: number;
  subtotal: number;
  mrpTotal: number;
  totalSavings: number;
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  couponMessage: string | null;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  tax: number;
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  settings: StoreSettings | null;
  refreshSettings: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemEntry[]>(() => {
    try {
      const stored = localStorage.getItem('grocejo_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const refreshSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load store settings', err);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('grocejo_cart', JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) return;
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty, product } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const validQty = Math.min(item.product.stock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const getItemQuantity = (productId: string): number => {
    const found = items.find(i => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const baseSavings = Math.max(0, mrpTotal - subtotal);
  const totalSavings = baseSavings + couponDiscount;

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? 499;
  const standardDeliveryCharge = settings?.deliveryCharge ?? 25;
  const deliveryCharge = subtotal >= freeDeliveryThreshold || items.length === 0 ? 0 : standardDeliveryCharge;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const taxPercentage = settings?.taxPercentage ?? 5;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = items.length === 0 ? 0 : Math.round((taxableAmount * taxPercentage) / 100);

  const finalTotal = items.length === 0 ? 0 : taxableAmount + deliveryCharge + tax;

  // Re-verify coupon if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.minOrderValue) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage(`Coupon removed: requires min order of ₹${appliedCoupon.minOrderValue}`);
      } else {
        let disc = 0;
        if (appliedCoupon.discountType === 'fixed') {
          disc = Math.min(appliedCoupon.discountValue, subtotal);
        } else {
          disc = Math.round((subtotal * appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maxDiscount > 0) {
            disc = Math.min(disc, appliedCoupon.maxDiscount);
          }
        }
        setCouponDiscount(disc);
      }
    }
  }, [subtotal, appliedCoupon]);

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponDiscount(res.discount);
        setCouponMessage(res.message);
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message || 'Invalid coupon code.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
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
        setIsCartOpen,
        settings,
        refreshSettings
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
