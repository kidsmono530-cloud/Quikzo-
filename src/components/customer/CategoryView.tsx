import React, { useState, useMemo } from 'react';
import { Category, Product } from '../../types';
import { ProductCard } from '../ProductCard';
import { formatINR } from '../../lib/formatters';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Zap } from 'lucide-react';

interface CategoryViewProps {
  categories: Category[];
  products: Product[];
  selectedCategory: Category | null;
  onSelectCategory: (cat: Category | null) => void;
  onSelectProduct: (product: Product) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct
}) => {
  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [hasDiscountOnly, setHasDiscountOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [sortBy, setSortBy] = useState<'popularity' | 'price_asc' | 'price_desc' | 'newest'>('popularity');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Available brands in the active category / product list
  const availableBrands = useMemo(() => {
    const list = selectedCategory
      ? products.filter(p => p.categoryId === selectedCategory.id)
      : products;
    const brandsSet = new Set<string>();
    list.forEach(p => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products, selectedCategory]);

  // Filtered & sorted products
  const displayProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory) {
      list = list.filter(p => p.categoryId === selectedCategory.id);
    }
    if (selectedBrand) {
      list = list.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }
    if (hasDiscountOnly) {
      list = list.filter(p => p.discountPercentage > 0);
    }
    if (maxPrice) {
      list = list.filter(p => p.sellingPrice <= maxPrice);
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popularity') {
      list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return list;
  }, [products, selectedCategory, selectedBrand, inStockOnly, hasDiscountOnly, maxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedBrand('');
    setInStockOnly(false);
    setHasDiscountOnly(false);
    setMaxPrice(600);
    setSortBy('popularity');
  };

  const hasActiveFilters = selectedBrand || inStockOnly || hasDiscountOnly || maxPrice < 600 || sortBy !== 'popularity';

  return (
    <div className="space-y-6 pb-20">
      {/* Category Header */}
      <div className="bg-[#0B0B0B] text-white p-5 sm:p-7 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-800">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#FFCD00] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-[#FFCD00]" /> Quikzo Grocery Aisles
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">
            {selectedCategory ? selectedCategory.name : 'All Grocery Categories'}
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Showing {displayProducts.length} items with lightning 10-15 min delivery in Bengaluru
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="self-start sm:self-auto px-4 py-2 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-xs rounded-xl transition-all shadow-2xs border border-amber-300 active:scale-95"
          >
            Show All Aisles
          </button>
        )}
      </div>

      {/* Horizontal Category Pill Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
            !selectedCategory
              ? 'bg-[#FFCD00] text-[#0B0B0B] shadow-2xs border border-amber-300'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Aisles ({products.length})
        </button>
        {categories.map(cat => {
          const isSelected = selectedCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FFCD00] text-[#0B0B0B] shadow-2xs border border-amber-300'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <img src={cat.image} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sort & Quick Filter Ribbon */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#FFCD00]" />
            )}
          </button>

          {/* Quick Filters */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors border ${
                inStockOnly
                  ? 'bg-amber-100 border-[#FFCD00] text-[#0B0B0B] font-black'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {inStockOnly && '✓ '}In Stock Only
            </button>

            <button
              onClick={() => setHasDiscountOnly(!hasDiscountOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors border ${
                hasDiscountOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-black'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {hasDiscountOnly && '✓ '}Super Deals &amp; Discounts
            </button>
          </div>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold hidden sm:inline">Sort By:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:bg-white focus:border-[#FFCD00] focus:outline-hidden"
          >
            <option value="popularity">Popularity (Best Sellers)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block bg-white p-5 rounded-3xl border border-gray-200 shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="font-black text-sm text-[#0B0B0B] flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-amber-600" /> Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Brands Filter */}
          <div>
            <label className="font-black text-gray-800 block mb-2 uppercase tracking-wider text-[10px]">
              Brand
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === ''}
                  onChange={() => setSelectedBrand('')}
                  className="accent-[#FFCD00]"
                />
                <span>All Brands</span>
              </label>
              {availableBrands.map(b => (
                <label key={b} className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand.toLowerCase() === b.toLowerCase()}
                    onChange={() => setSelectedBrand(b)}
                    className="accent-[#FFCD00]"
                  />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-black text-gray-800 uppercase tracking-wider text-[10px]">
                Max Price
              </label>
              <span className="font-mono font-black text-[#0B0B0B]">{formatINR(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="20"
              max="600"
              step="10"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#FFCD00] cursor-pointer"
            />
          </div>

          {/* Availability */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <label className="font-black text-gray-800 uppercase tracking-wider text-[10px] block mb-2">
              Availability &amp; Offers
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="rounded accent-[#FFCD00]"
              />
              <span>In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={hasDiscountOnly}
                onChange={e => setHasDiscountOnly(e.target.checked)}
                className="rounded accent-[#FFCD00]"
              />
              <span>Discounted Items</span>
            </label>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {displayProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-2xs">
              <p className="text-gray-400 font-bold text-base mb-1">
                No grocery products found matching your criteria.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Try loosening your filters or explore other categories.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-xs rounded-xl shadow-xs border border-amber-300"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {displayProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto border border-gray-200 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-black text-sm text-[#0B0B0B]">Filters &amp; Sorting</span>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Brands */}
            <div>
              <label className="font-black text-gray-800 block mb-2 uppercase text-[10px]">Brand</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="mobile-brand"
                    checked={selectedBrand === ''}
                    onChange={() => setSelectedBrand('')}
                    className="accent-[#FFCD00]"
                  />
                  <span>All Brands</span>
                </label>
                {availableBrands.map(b => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="mobile-brand"
                      checked={selectedBrand.toLowerCase() === b.toLowerCase()}
                      onChange={() => setSelectedBrand(b)}
                      className="accent-[#FFCD00]"
                    />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between mb-1">
                <span className="font-black text-[10px] uppercase">Max Price</span>
                <span className="font-mono font-black">{formatINR(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="20"
                max="600"
                step="10"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#FFCD00]"
              />
            </div>

            {/* Toggles */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="accent-[#FFCD00]"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={hasDiscountOnly}
                  onChange={e => setHasDiscountOnly(e.target.checked)}
                  className="accent-[#FFCD00]"
                />
                <span>Discounted Items</span>
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  resetFilters();
                  setIsFilterDrawerOpen(false);
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black rounded-xl border border-amber-300"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
