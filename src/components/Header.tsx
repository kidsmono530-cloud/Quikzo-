import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/formatters';
import { getProducts } from '../lib/api';
import { Product } from '../types';
import {
  ShoppingBag,
  Search,
  MapPin,
  ChevronDown,
  Clock,
  X,
  Package
} from 'lucide-react';
import { QuikzoLogo } from './QuikzoLogo';

interface HeaderProps {
  onOpenLocationModal: () => void;
  onOpenAuthModal: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
  onNavigateAccount: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLocationModal,
  onOpenAuthModal,
  onSelectProduct,
  onNavigateHome,
  onNavigateOrders,
  onNavigateAccount
}) => {
  const { user, selectedAddress } = useAuth();
  const { itemCount, subtotal, setIsCartOpen, settings } = useCart();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchRefMobile = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getProducts({ search: searchQuery.trim() });
        setSearchResults(results.slice(0, 6));
        setShowDropdown(true);
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside and Escape to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (searchRef.current && !searchRef.current.contains(target)) &&
        (searchRefMobile.current && !searchRefMobile.current.contains(target))
      ) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayLocation = selectedAddress
    ? `${selectedAddress.houseNumber}, ${selectedAddress.city} - ${selectedAddress.pincode}`
    : 'Indiranagar, Bengaluru - 560001';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200/90 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-2 sm:py-3">
        {/* ============================================================== */}
        {/* DESKTOP HEADER (MD & ABOVE)                                   */}
        {/* ============================================================== */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Quikzo Logo & Delivery Location Picker */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-left cursor-pointer focus:outline-hidden"
              title="Quikzo Home"
            >
              <QuikzoLogo size="sm" showTagline={false} />
            </button>

            {/* Delivery Location Picker */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-2 text-left px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-[#FFCD00] hover:bg-amber-50/40 transition-all text-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-[#FFCD00] text-[#0B0B0B] flex items-center justify-center shrink-0 font-black shadow-2xs">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[170px]">
                <div className="flex items-center gap-1 font-black text-[#0B0B0B]">
                  <Clock className="w-3 h-3 text-[#0B0B0B]" />
                  <span>{settings?.estimatedDeliveryMinutes || '10-15 mins'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </div>
                <div className="text-gray-500 truncate text-[11px] font-medium">
                  {displayLocation}
                </div>
              </div>
            </button>
          </div>

          {/* Center: Wide Rounded Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Search for milk, atta, oil, biscuits, snacks..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-2xl focus:outline-hidden focus:border-[#FFCD00] focus:ring-2 focus:ring-[#FFCD00]/20 transition-all placeholder:text-gray-400 text-[#0B0B0B] font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold px-3 bg-gray-50">
                  <span>Search Suggestions</span>
                  {isSearching && <span className="text-[#0B0B0B] font-bold">Searching...</span>}
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-5 text-center text-xs text-gray-500">
                    No grocery items found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                          onSelectProduct(product);
                        }}
                        className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-amber-50/50 cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-11 h-11 object-cover rounded-xl bg-gray-50 shrink-0 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-medium">{product.brand} • {product.weight}</p>
                          <p className="text-xs font-bold text-[#0B0B0B] truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[#0B0B0B] font-mono">
                              {formatINR(product.sellingPrice)}
                            </span>
                            {product.mrp > product.sellingPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatINR(product.mrp)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#0B0B0B] px-2.5 py-1 bg-[#FFCD00] rounded-lg shrink-0 shadow-2xs">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action: My Orders, Yellow Cart Button (Icon only with item count badge) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* My Orders Button */}
            <button
              type="button"
              onClick={onNavigateOrders}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
            >
              <Package className="w-3.5 h-3.5 text-gray-600" />
              <span>My Orders</span>
            </button>

            {/* Bright Yellow Shopping Cart Button - Icon only with badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 rounded-xl bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] flex items-center justify-center shadow-xs transition-all active:scale-95 border border-amber-300"
              aria-label="View Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#0B0B0B] stroke-[2.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0B0B0B] text-[#FFCD00] text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs border border-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE HEADER (SM & BELOW) - NEVER CRUSHED OR OVERFLOWING     */}
        {/* ============================================================== */}
        <div className="md:hidden space-y-2">
          {/* Row 1: Logo (Left) and Yellow Cart Button (Right) */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-left cursor-pointer focus:outline-hidden"
              title="Quikzo Home"
            >
              <QuikzoLogo size="sm" showTagline={false} />
            </button>

            {/* Yellow Cart Button (Icon only with item count badge) */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 rounded-xl bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] flex items-center justify-center shadow-2xs transition-all active:scale-95 border border-amber-300"
              aria-label="View Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-[#0B0B0B] stroke-[2.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0B0B0B] text-[#FFCD00] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Row 2: Full-Width Search Bar */}
          <div ref={searchRefMobile} className="relative w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Search for milk, atta, oil, biscuits, snacks..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#FFCD00] focus:ring-2 focus:ring-[#FFCD00]/20 transition-all placeholder:text-gray-400 text-[#0B0B0B] font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Suggestions Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-2 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold px-3 bg-gray-50">
                  <span>Search Suggestions</span>
                  {isSearching && <span className="text-[#0B0B0B] font-bold">Searching...</span>}
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No items found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[260px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                          onSelectProduct(product);
                        }}
                        className="flex items-center gap-2.5 p-2.5 hover:bg-amber-50/50 cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-50 shrink-0 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400">{product.brand} • {product.weight}</p>
                          <p className="text-xs font-bold text-[#0B0B0B] truncate">{product.name}</p>
                          <span className="text-xs font-black text-[#0B0B0B] font-mono">
                            {formatINR(product.sellingPrice)}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-[#0B0B0B] px-2 py-1 bg-[#FFCD00] rounded-md shrink-0">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Row 3: Location ETA Strip & My Orders Shortcut */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 text-gray-800 truncate max-w-[70%] active:opacity-75"
            >
              <div className="w-5 h-5 rounded-md bg-[#FFCD00] text-[#0B0B0B] flex items-center justify-center shrink-0">
                <MapPin className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span className="font-black text-[#0B0B0B] shrink-0 text-[11px]">
                {settings?.estimatedDeliveryMinutes || '10-15 mins'}:
              </span>
              <span className="text-gray-500 truncate text-[11px] font-medium">{displayLocation}</span>
              <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onNavigateOrders}
              className="text-[#0B0B0B] font-bold shrink-0 text-[11px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg flex items-center gap-1 border border-gray-200 transition-colors"
            >
              <Package className="w-3 h-3 text-gray-600" />
              <span>My Orders</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
