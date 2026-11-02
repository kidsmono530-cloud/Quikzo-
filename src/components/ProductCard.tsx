import React, { useState } from 'react';
import { Product } from '../types';
import { formatINR } from '../lib/formatters';
import { useCart } from '../context/CartContext';
import { Zap, Plus, Minus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const currentQty = getItemQuantity ? getItemQuantity(product.id) : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.card-btn-container')) return;
    if (onSelectProduct) onSelectProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 800);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    window.dispatchEvent(new CustomEvent('quikzo-buy-now', { detail: product }));
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between bg-white border border-gray-200/90 rounded-2xl p-2 sm:p-2.5 hover:shadow-md hover:border-[#FFCC00] transition-all duration-200 cursor-pointer text-left shadow-2xs w-full"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1 mb-1 min-h-[1.15rem]">
          {product.discountPercentage > 0 ? (
            <span className="inline-flex items-center text-[9px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80">
              {product.discountPercentage}% OFF
            </span>
          ) : (
            <span />
          )}

          {product.isSuperDeal && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
              <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-600" /> Deal
            </span>
          )}
        </div>

        {/* Stylish Modern Product Image Shape (Softly Rounded 12px container, centered, subtle background) */}
        <div className="relative aspect-square w-full rounded-[12px] overflow-hidden bg-[#F9FAFB] mb-1.5 flex items-center justify-center p-2 border border-gray-100 shadow-2xs">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
            }}
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-2xs ${
              isOutOfStock ? 'opacity-35 grayscale' : ''
            }`}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex items-center justify-center p-1">
              <span className="bg-[#0B0B0B] text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs text-center">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Brand & Weight */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-0.5 font-medium truncate">
          <span className="text-gray-700 font-semibold truncate">{product.brand || 'Quikzo'}</span>
          <span>•</span>
          <span className="text-gray-500 shrink-0">{product.weight}</span>
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-[#0B0B0B] text-xs leading-tight line-clamp-2 h-[2rem] mb-1 group-hover:text-black transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Price & Dual Side-by-Side Action Buttons */}
      <div className="pt-1 border-t border-gray-100 mt-auto space-y-1">
        <div className="flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-sm font-black text-[#0B0B0B] font-mono tracking-tight">
              {formatINR(product.sellingPrice)}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-[10px] text-gray-400 line-through font-mono">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 ? (
            <span className="text-[8px] text-amber-800 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
              {product.stock} left
            </span>
          ) : !isOutOfStock ? (
            <span className="text-[8px] text-emerald-700 font-bold">
              In Stock
            </span>
          ) : null}
        </div>

        {/* Side-by-Side Single-Row Buttons Container */}
        <div className="card-btn-container pt-0.5">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full h-7 text-[10px] font-bold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed uppercase tracking-wider"
            >
              Unavailable
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {/* Action 1: Add to Cart (White with subtle gray border) */}
              {currentQty > 0 ? (
                <div className="h-7 flex items-center justify-between bg-amber-50/80 border border-amber-300 rounded-lg px-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(product.id, currentQty - 1);
                    }}
                    className="p-0.5 rounded text-gray-800 hover:bg-amber-200 transition-colors"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <span className="text-[11px] font-black text-[#0B0B0B] font-mono">
                    {currentQty}
                  </span>
                  <button
                    type="button"
                    disabled={currentQty >= product.stock}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQuantity(product.id, currentQty + 1);
                    }}
                    className="p-0.5 rounded text-gray-800 hover:bg-amber-200 transition-colors disabled:opacity-40"
                    title="Increase quantity"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-7 px-1 bg-white hover:bg-gray-50 text-[#0B0B0B] border border-gray-300 hover:border-black font-black text-[10px] sm:text-[11px] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-0.5 shadow-2xs"
                  title="Add to Cart"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700">Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 text-[#0B0B0B] shrink-0" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              )}

              {/* Action 2: Buy Now (Yellow #FFCC00 with black text & lightning icon) */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="h-7 px-1 bg-[#FFCC00] hover:bg-[#E6B800] text-[#0B0B0B] font-black text-[10px] sm:text-[11px] rounded-lg transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-0.5 border border-amber-300 truncate"
                title="Instant Checkout"
              >
                <Zap className="w-3 h-3 shrink-0 fill-[#0B0B0B] text-[#0B0B0B]" />
                <span className="truncate">Buy Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
