import React from 'react';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/formatters';

export type TabType = 'home' | 'categories' | 'search' | 'orders' | 'account';

interface MobileBottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenSearchFocus?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenSearchFocus
}) => {
  const { itemCount, subtotal, setIsCartOpen } = useCart();

  return (
    <>
{/* Floating mini cart bar removed as per user request */}

      {/* Fixed bottom navigation with teal green accent */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E2D9] px-2 py-1.5 safe-area-bottom shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'home'
                ? 'text-[#202824] font-extrabold bg-[#DDF4EA]'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <Home className={`w-5 h-5 mb-0.5 ${currentTab === 'home' ? 'text-[#159F83]' : ''}`} />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => onTabChange('categories')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'categories'
                ? 'text-[#202824] font-extrabold bg-[#DDF4EA]'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <Grid className={`w-5 h-5 mb-0.5 ${currentTab === 'categories' ? 'text-[#159F83]' : ''}`} />
            <span className="text-[10px]">Categories</span>
          </button>

          <button
            onClick={() => {
              onTabChange('search');
              if (onOpenSearchFocus) onOpenSearchFocus();
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'search'
                ? 'text-[#202824] font-extrabold bg-[#DDF4EA]'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <Search className={`w-5 h-5 mb-0.5 ${currentTab === 'search' ? 'text-[#159F83]' : ''}`} />
            <span className="text-[10px]">Search</span>
          </button>

          <button
            onClick={() => onTabChange('orders')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'orders'
                ? 'text-[#202824] font-extrabold bg-[#DDF4EA]'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 mb-0.5 ${currentTab === 'orders' ? 'text-[#159F83]' : ''}`} />
            <span className="text-[10px]">My Orders</span>
          </button>

          <button
            onClick={() => onTabChange('account')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'account'
                ? 'text-[#202824] font-extrabold bg-[#DDF4EA]'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <User className={`w-5 h-5 mb-0.5 ${currentTab === 'account' ? 'text-[#159F83]' : ''}`} />
            <span className="text-[10px]">Account</span>
          </button>
        </div>
      </nav>
    </>
  );
};
