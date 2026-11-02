import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { formatINR } from '../lib/formatters';
import { useCart } from '../context/CartContext';
import { getProducts } from '../lib/api';
import { X, Plus, Minus, Zap, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct
}) => {
  const { getItemQuantity, addToCart, updateQuantity, setIsCartOpen } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!product) return;
    setActiveImageIndex(0);
    // Load similar products in the same category
    getProducts({ categoryId: product.categoryId })
      .then(prods => {
        setRelatedProducts(prods.filter(p => p.id !== product.id).slice(0, 4));
      })
      .catch(console.error);
  }, [product?.id]);

  if (!product) return null;

  const quantity = getItemQuantity(product.id);
  const isOutOfStock = product.stock <= 0;
  const allImages = [product.image, ...(product.additionalImages || [])];

  const handleBuyNow = () => {
    if (quantity === 0) {
      addToCart(product, 1);
    }
    onClose();
    // Dispatch buy now custom event so instant checkout opens
    window.dispatchEvent(new CustomEvent('quikzo-buy-now', { detail: product }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors shadow-2xs"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {/* Left: Gallery */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center shadow-2xs">
                <img
                  src={allImages[activeImageIndex] || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-xs">
                    {product.discountPercentage}% OFF
                  </span>
                )}
                {product.isSuperDeal && (
                  <span className="absolute top-3 right-14 bg-[#FFCD00] text-[#0B0B0B] font-black text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs border border-amber-300">
                    <Zap className="w-3.5 h-3.5 fill-[#0B0B0B]" /> Super Deal
                  </span>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden ${
                        activeImageIndex === i ? 'border-[#FFCD00] ring-2 ring-amber-200' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center gap-2 text-xs">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold text-gray-800">10-15 Min Delivery</span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold text-gray-800">100% Quality Assured</span>
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block mb-2">
                  {product.brand || 'Quikzo Fresh'}
                </span>

                <h1 className="text-xl sm:text-2xl font-black text-[#0B0B0B] tracking-tight mb-1">
                  {product.name}
                </h1>

                <div className="text-xs text-gray-500 font-bold mb-4">
                  Unit: {product.weight}
                </div>

                {/* Pricing Box */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[#0B0B0B] font-mono">
                      {formatINR(product.sellingPrice)}
                    </span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-base text-gray-400 line-through">
                        {formatINR(product.mrp)}
                      </span>
                    )}
                    {product.mrp > product.sellingPrice && (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Save {formatINR(product.mrp - product.sellingPrice)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Inclusive of all applicable taxes
                  </div>

                  {/* Stock Availability */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-700">Stock Status:</span>
                    {isOutOfStock ? (
                      <span className="text-rose-600 font-black">Currently Out of Stock</span>
                    ) : product.stock <= 5 ? (
                      <span className="text-amber-700 font-black">Hurry! Only {product.stock} units left</span>
                    ) : (
                      <span className="text-emerald-700 font-black">In Stock ({product.stock} units available)</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3 mb-6">
                  <div>
                    <h4 className="text-xs font-black text-[#0B0B0B] uppercase tracking-wider mb-1">
                      Product Description
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {product.description || 'Premium quality grocery staple carefully sourced and handled with the highest standards of safety and freshness.'}
                    </p>
                  </div>

                  {product.ingredients && (
                    <div className="pt-2">
                      <h4 className="text-xs font-black text-[#0B0B0B] uppercase tracking-wider mb-1">
                        Ingredients &amp; Specifications
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                        {product.ingredients}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper / Add to Cart */}
                  <div className="shrink-0">
                    {isOutOfStock ? (
                      <button disabled className="px-4 py-3 bg-gray-100 text-gray-400 font-bold text-sm rounded-xl cursor-not-allowed">
                        Out of Stock
                      </button>
                    ) : quantity === 0 ? (
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="px-6 py-3.5 bg-[#0B0B0B] hover:bg-gray-800 text-white font-black text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-2 active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center bg-[#0B0B0B] text-white rounded-2xl overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-3.5 py-3 hover:bg-gray-800 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-black text-sm min-w-[2.5rem] text-center font-mono text-[#FFCD00]">
                          {quantity}
                        </span>
                        <button
                          disabled={quantity >= product.stock}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className={`px-3.5 py-3 transition-colors ${
                            quantity >= product.stock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-800'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Buy Now Button */}
                  {!isOutOfStock && (
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3.5 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-300"
                    >
                      <Zap className="w-4 h-4 fill-[#0B0B0B]" /> Buy Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related / Similar Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <h3 className="text-base font-black text-[#0B0B0B] mb-4">
                You May Also Need
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="p-3 border border-gray-200 rounded-2xl hover:border-amber-400 cursor-pointer transition-all bg-white hover:shadow-xs"
                  >
                    <img src={rel.image} alt={rel.name} className="w-full aspect-square object-cover rounded-xl mb-2 bg-gray-50 border border-gray-100" />
                    <p className="text-[11px] text-amber-700 font-bold truncate">{rel.brand}</p>
                    <p className="text-xs font-bold text-[#0B0B0B] truncate">{rel.name}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-xs font-black font-mono text-[#0B0B0B]">{formatINR(rel.sellingPrice)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(rel, 1);
                        }}
                        className="text-[11px] font-black text-[#0B0B0B] bg-[#FFCD00] hover:bg-[#E5B800] px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
