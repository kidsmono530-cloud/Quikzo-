import React, { useState } from 'react';
import { adminLogout } from '../../lib/api';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  Image,
  TicketPercent,
  ChefHat,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bike
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'delivery'
  | 'inventory'
  | 'banners'
  | 'coupons'
  | 'recipes'
  | 'customers'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onExitToStore: () => void;
  onLogoutAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onExitToStore,
  onLogoutAdmin,
  children
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleAdminSignOut = async () => {
    await adminLogout();
    onLogoutAdmin();
  };

  const menuItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'orders', label: 'Live Orders', icon: ShoppingBag },
    { id: 'delivery', label: 'Delivery Staff', icon: Bike },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'banners', label: 'Home Banners', icon: Image },
    { id: 'coupons', label: 'Coupons & Offers', icon: TicketPercent },
    { id: 'recipes', label: 'Recipes & Discovery', icon: ChefHat },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Store Settings', icon: Settings }
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-30 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#159F83] text-white font-black text-sm flex items-center justify-center">
                QZ
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Quikzo
                </span>
                <span className="text-[10px] text-[#DDF4EA] font-bold ml-2 uppercase tracking-wider bg-[#159F83]/30 px-2 py-0.5 rounded-md">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onExitToStore}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Back to Customer Store</span>
              <span className="sm:hidden">Store</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 border-l border-gray-700 pl-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database Connected</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="text-xs text-gray-500">Access Role</div>
            <div className="font-bold text-gray-900 text-sm truncate">
              Store Owner
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold font-mono">
              Authorized Session Active
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleAdminSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-gray-950/60 backdrop-blur-xs"
          />
        )}

        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-extrabold text-gray-900 text-sm">Navigation</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-emerald-700 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
