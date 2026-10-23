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
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            {/* Left: Gallery */}
            <div className="flex flex-col gap-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                <img
                  src={allImages[activeImageIndex] || product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                {product.discountPercentage > 0 && (
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs">
                    {product.discountPercentage}% OFF
                  </span>
                )}
                {product.isSuperDeal && (
                  <span className="absolute top-3 right-12 bg-amber-400 text-gray-950 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Super Deal
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
                        activeImageIndex === i ? 'border-emerald-600' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center gap-1 text-[11px] text-gray-600">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">10-15 Min Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[11px] text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">100% Genuine</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[11px] text-gray-600">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">Instant Replacement</span>
                </div>
              </div>
            </div>

            {/* Right: Product Info & Actions */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {product.brand}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {product.categoryName || 'Grocery'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight mb-2">
                  {product.name}
                </h1>

                <div className="text-sm font-semibold text-gray-600 mb-4">
                  Net Quantity: <span className="text-gray-900 font-bold">{product.weight}</span>
                </div>

                {/* Pricing Box */}
                <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-gray-950 font-mono">
                      {formatINR(product.sellingPrice)}
                    </span>
                    {product.mrp > product.sellingPrice && (
                      <span className="text-base text-gray-400 line-through">
                        {formatINR(product.mrp)}
                      </span>
                    )}
                    {product.mrp > product.sellingPrice && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        Save {formatINR(product.mrp - product.sellingPrice)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Inclusive of all applicable taxes
                  </div>

                  {/* Stock Availability */}
                  <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold">
                    <span>Stock Status:</span>
                    {isOutOfStock ? (
                      <span className="text-rose-600 font-bold">Currently Out of Stock</span>
                    ) : product.stock <= 5 ? (
                      <span className="text-amber-600 font-bold">Hurry! Only {product.stock} units left</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">In Stock ({product.stock} units available)</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3 mb-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                      Product Description
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.description || 'Premium quality grocery staple carefully sourced and handled with the highest standards of safety and freshness.'}
                    </p>
                  </div>

                  {product.ingredients && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                        Ingredients &amp; Specifications
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        {product.ingredients}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="shrink-0">
                    {isOutOfStock ? (
                      <button disabled className="px-4 py-3 bg-gray-100 text-gray-400 font-bold text-sm rounded-xl cursor-not-allowed">
                        Out of Stock
                      </button>
                    ) : quantity === 0 ? (
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center bg-emerald-700 text-white rounded-xl overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-3.5 py-3 hover:bg-emerald-800 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-bold text-sm min-w-[2.5rem] text-center font-mono">
                          {quantity}
                        </span>
                        <button
                          disabled={quantity >= product.stock}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className={`px-3.5 py-3 transition-colors ${
                            quantity >= product.stock ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-800'
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
                      className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-extrabold text-sm rounded-xl shadow-xs transition-colors active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-current" /> Buy Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related / Similar Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                You May Also Need
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="p-3 border border-gray-100 rounded-xl hover:border-emerald-500 cursor-pointer transition-all bg-gray-50/40 hover:bg-white"
                  >
                    <img src={rel.image} alt={rel.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                    <p className="text-xs text-gray-500 font-medium truncate">{rel.brand}</p>
                    <p className="text-xs font-semibold text-gray-900 truncate">{rel.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold font-mono">{formatINR(rel.sellingPrice)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(rel, 1);
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-700 hover:text-white transition-colors"
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
