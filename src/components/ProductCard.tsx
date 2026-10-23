import React, { useState } from 'react';
import { Product } from '../types';
import { formatINR } from '../lib/formatters';
import { useCart } from '../context/CartContext';
import { Zap, ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.card-btn-container')) return;
    if (onSelectProduct) onSelectProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
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
      className="group relative flex flex-col justify-between bg-white border border-[#E8E2D9] rounded-3xl p-3 sm:p-3.5 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1 mb-2">
          {product.discountPercentage > 0 ? (
            <span className="inline-flex items-center text-[10px] font-bold text-[#159F83] bg-[#DDF4EA] px-2 py-0.5 rounded-md border border-[#159F83]/20">
              {product.discountPercentage}% OFF
            </span>
          ) : <span />}

          {product.isSuperDeal && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#159F83] bg-[#DDF4EA] px-1.5 py-0.5 rounded-md border border-[#159F83]/20">
              <Zap className="w-2.5 h-2.5 fill-[#159F83] text-[#159F83]" /> Deal
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FFF8EF] mb-3 flex items-center justify-center">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'opacity-40 grayscale' : ''
            }`}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-[#202824] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Brand & Weight */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1 font-medium">
          <span className="text-gray-600 truncate">{product.brand}</span>
          <span>•</span>
          <span className="text-gray-500">{product.weight}</span>
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-[#202824] text-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-2 group-hover:text-[#159F83] transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Price & Side-by-Side Teal Buttons */}
      <div className="pt-2.5 border-t border-[#E8E2D9] mt-auto space-y-2.5">
        <div className="flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[#202824] font-mono tracking-tight">
              {formatINR(product.sellingPrice)}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-[10px] text-[#159F83] font-semibold">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Side-by-side Add to Cart & Buy Now buttons (#159F83) */}
        <div className="card-btn-container grid grid-cols-2 gap-1.5 pt-0.5">
          {isOutOfStock ? (
            <button
              disabled
              className="col-span-2 py-2 px-2 text-xs font-bold rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed uppercase tracking-wider"
            >
              Out of Stock
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className="py-2 px-1.5 sm:px-2 bg-[#159F83] hover:bg-[#128a71] text-white font-extrabold text-[11px] sm:text-xs rounded-xl transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1 truncate"
                title="Add to Cart"
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="truncate">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="py-2 px-1.5 sm:px-2 bg-[#159F83] hover:bg-[#128a71] text-white font-extrabold text-[11px] sm:text-xs rounded-xl transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1 truncate"
                title="Buy Now"
              >
                <Zap className="w-3.5 h-3.5 shrink-0 fill-white" />
                <span className="truncate">Buy Now</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
