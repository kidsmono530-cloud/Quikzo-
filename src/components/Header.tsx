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
  User,
  Clock,
  X,
  Plus
} from 'lucide-react';

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
        setSearchResults(results.slice(0, 8));
        setShowDropdown(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside and Escape to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
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

  const userAvatar = user?.avatar || user?.profileImage;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E2D9] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Circular Customer Profile Photo (Replaces Logo & Name) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (user) {
                  onNavigateAccount();
                } else {
                  onOpenAuthModal();
                }
              }}
              className="relative group focus:outline-hidden cursor-pointer active:scale-95 transition-transform"
              title={user ? `${user.name} - View Account / Profile` : 'Sign In / Account'}
              aria-label="Customer Profile"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#159F83] bg-[#DDF4EA] shadow-xs flex items-center justify-center transition-all group-hover:border-[#128a71]">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : user ? (
                  <span className="text-sm sm:text-base font-black text-[#202824] uppercase">
                    {user.name.slice(0, 1)}
                  </span>
                ) : (
                  <User className="w-5 h-5 text-[#202824]" />
                )}
              </div>

              {/* Add Photo / Status indicator badge */}
              {!userAvatar && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#159F83] text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-2xs"
                  title="Add Profile Photo"
                >
                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>

            {/* Delivery Location Picker (Beside profile photo on desktop) */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="hidden md:flex items-center gap-2 text-left px-2.5 py-1.5 rounded-xl border border-[#E8E2D9] hover:border-[#159F83] hover:bg-[#DDF4EA]/40 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-[#DDF4EA] text-[#159F83] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[170px]">
                <div className="flex items-center gap-1 font-bold text-[#202824]">
                  <Clock className="w-3 h-3 text-[#159F83]" />
                  <span>{settings?.estimatedDeliveryMinutes || '10-15 mins'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </div>
                <div className="text-gray-500 truncate text-[11px]">
                  {displayLocation}
                </div>
              </div>
            </button>
          </div>

          {/* Center: Wide Rounded Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-1 sm:mx-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowDropdown(true);
                }}
                placeholder="Search for milk, oil, biscuits, atta, chips..."
                className="w-full pl-10 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm bg-[#FFFBF7] hover:bg-gray-100/70 focus:bg-white border border-[#E8E2D9] rounded-2xl focus:outline-hidden focus:border-[#159F83] focus:ring-2 focus:ring-[#DDF4EA] transition-all placeholder:text-gray-400 shadow-2xs"
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
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-[#E8E2D9] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-gray-50 flex items-center justify-between text-xs text-gray-500 font-semibold px-3 bg-[#FFF8EF]">
                  <span>Search Suggestions</span>
                  {isSearching && <span className="text-[#159F83]">Searching...</span>}
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-5 text-center text-xs text-gray-500">
                    No grocery items found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery('');
                          onSelectProduct(product);
                        }}
                        className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-[#DDF4EA]/50 cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-11 h-11 object-cover rounded-xl bg-gray-50 shrink-0 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-medium">{product.brand} • {product.weight}</p>
                          <p className="text-xs font-bold text-[#202824] truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[#202824] font-mono">
                              {formatINR(product.sellingPrice)}
                            </span>
                            {product.mrp > product.sellingPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                {formatINR(product.mrp)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#159F83] px-2.5 py-1 bg-[#DDF4EA] rounded-lg shrink-0">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action: Shopping Cart Button & Orders */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onNavigateOrders}
              className="hidden sm:inline-flex items-center px-2.5 py-2 text-xs font-bold text-gray-700 hover:text-[#159F83] hover:bg-[#DDF4EA]/50 rounded-xl transition-colors"
            >
              My Orders
            </button>

            {/* Shopping Cart Icon */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 bg-[#159F83] hover:bg-[#128a71] text-white rounded-xl shadow-xs transition-all active:scale-95 font-black text-xs"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#159F83] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="font-mono font-black text-xs">
                {itemCount > 0 ? formatINR(subtotal) : 'Cart'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Location & Orders Quick Bar */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs md:hidden">
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 text-gray-700 truncate max-w-[75%]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#159F83] shrink-0" />
            <span className="font-bold text-[#202824] shrink-0">10-15 mins:</span>
            <span className="text-gray-500 truncate">{displayLocation}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>
          <button
            type="button"
            onClick={onNavigateOrders}
            className="text-[#159F83] font-extrabold shrink-0 text-[11px] bg-[#DDF4EA] px-2.5 py-1 rounded-lg"
          >
            My Orders
          </button>
        </div>
      </div>
    </header>
  );
};
