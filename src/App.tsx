import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Category, Product, Banner, Recipe, Order, DeliveryBoyProfile } from './types';
import {
  getCategories,
  getProducts,
  getBanners,
  getRecipes,
  verifyAdminSession,
  getAdminToken,
  verifyDeliverySession,
  getCurrentDeliveryBoy,
  deliveryLogout
} from './lib/api';

// Branding & Splash
import { QuikzoLogo } from './components/QuikzoLogo';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';

// Customer Components
import { Header } from './components/Header';
import { MobileBottomNav, TabType } from './components/MobileBottomNav';
import { HomeView } from './components/customer/HomeView';
import { CategoryView } from './components/customer/CategoryView';
import { OrdersView } from './components/customer/OrdersView';
import { AccountView } from './components/customer/AccountView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AddressModal } from './components/AddressModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { AuthModal } from './components/AuthModal';
import { RecipeModal } from './components/RecipeModal';
import { QuikzoAssistant } from './components/QuikzoAssistant';
// DonationModal import removed

// Admin Components
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminDelivery } from './components/admin/AdminDelivery';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminBanners } from './components/admin/AdminBanners';
import { AdminCoupons } from './components/admin/AdminCoupons';
import { AdminRecipes } from './components/admin/AdminRecipes';
import { AdminCustomers } from './components/admin/AdminCustomers';
import { AdminSettings } from './components/admin/AdminSettings';

// Delivery Boy Components
import { DeliveryLoginPage } from './components/delivery/DeliveryLoginPage';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard';

import { Loader2 } from 'lucide-react';

function checkIsAdminRoute(): boolean {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path.startsWith('/admin') ||
    hash.startsWith('#admin') ||
    hash.startsWith('#/admin')
  );
}

function checkIsDeliveryRoute(): boolean {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path.startsWith('/delivery') ||
    hash.startsWith('#delivery') ||
    hash.startsWith('#/delivery')
  );
}

function MainAppContent() {
  const { user } = useAuth();
  const { isCartOpen, setIsCartOpen, addToCart } = useCart();

  useEffect(() => {
    const handleBuyNow = (e: Event) => {
      const customEvent = e as CustomEvent<Product>;
      const product = customEvent.detail;
      if (product) {
        addToCart(product, 1);
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener('quikzo-buy-now', handleBuyNow as EventListener);
    return () => {
      window.removeEventListener('quikzo-buy-now', handleBuyNow as EventListener);
    };
  }, [addToCart]);

  // 1. Splash Screen State (shown for ~2 seconds on start)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('quikzo_splash_viewed');
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('quikzo_splash_viewed', 'true');
    } catch {}
    setShowSplash(false);
  };

  // Guest browsing flag for customers who wish to browse catalog first
  const [guestBrowsing, setGuestBrowsing] = useState<boolean>(false);

  // Route State: Customer Storefront vs Private Admin Portal vs Private Delivery Portal
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminRoute);
  const [isDeliveryRoute, setIsDeliveryRoute] = useState<boolean>(checkIsDeliveryRoute);

  // Admin Session Verification
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState<boolean>(() => {
    return checkIsAdminRoute() && Boolean(getAdminToken());
  });

  // Delivery Boy Session Verification
  const [currentDeliveryBoy, setCurrentDeliveryBoy] = useState<DeliveryBoyProfile | null>(null);
  const [isVerifyingDelivery, setIsVerifyingDelivery] = useState<boolean>(() => {
    return checkIsDeliveryRoute();
  });

  // Customer Navigation Tabs: 'home' | 'categories' | 'search' | 'orders' | 'account'
  const [customerTab, setCustomerTab] = useState<TabType>('home');
  // Admin Tabs
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Customer Catalog Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // DonationModal state removed

  // Selected Category filter for category tab
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Sync route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const onAdmin = checkIsAdminRoute();
      const onDelivery = checkIsDeliveryRoute();
      setIsAdminRoute(onAdmin);
      setIsDeliveryRoute(onDelivery);
      if (onAdmin) {
        checkAdminAuth();
      }
      if (onDelivery) {
        checkDeliveryAuth();
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret owner shortcut: Ctrl + Shift + A or Alt + A
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) ||
        (e.altKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        window.location.hash = '#/admin';
      }
      // Delivery staff shortcut: Ctrl + Shift + D or Alt + D
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) ||
        (e.altKey && (e.key === 'd' || e.key === 'D'))
      ) {
        e.preventDefault();
        window.location.hash = '#/delivery';
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const checkAdminAuth = async () => {
    setIsVerifyingAdmin(true);
    try {
      const res = await verifyAdminSession();
      setIsAdminAuthenticated(res.valid);
    } catch {
      setIsAdminAuthenticated(false);
    } finally {
      setIsVerifyingAdmin(false);
    }
  };

  const checkDeliveryAuth = async () => {
    setIsVerifyingDelivery(true);
    try {
      const res = await verifyDeliverySession();
      setCurrentDeliveryBoy(res.deliveryBoy || null);
    } catch {
      setCurrentDeliveryBoy(null);
    } finally {
      setIsVerifyingDelivery(false);
    }
  };

  useEffect(() => {
    if (isAdminRoute) {
      checkAdminAuth();
    }
  }, [isAdminRoute]);

  useEffect(() => {
    if (isDeliveryRoute) {
      checkDeliveryAuth();
    }
  }, [isDeliveryRoute]);

  const loadInitialData = async () => {
    try {
      const [cats, prods, bans, recs] = await Promise.all([
        getCategories(),
        getProducts(),
        getBanners(),
        getRecipes()
      ]);
      setCategories(cats);
      setProducts(prods);
      setBanners(bans);
      setRecipes(recs);
    } catch (e) {
      console.error('Failed to load initial customer data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter product slices for customer homepage
  const superDeals = products.filter(p => p.isSuperDeal || p.discountPercentage >= 15);
  const bestSellers = products.filter(p => p.isBestSeller);
  const healthEssentials = products.filter(p => p.isHealthEssential || p.categoryId === 'cat-21');
  const featuredProducts = products.filter(p => p.isFeatured);

  const handleExitAdminToStore = () => {
    setIsAdminRoute(false);
    if (window.location.hash.startsWith('#admin') || window.location.hash.startsWith('#/admin')) {
      window.location.hash = '';
    }
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
    loadInitialData();
  };

  const handleExitDeliveryToStore = () => {
    setIsDeliveryRoute(false);
    if (window.location.hash.startsWith('#delivery') || window.location.hash.startsWith('#/delivery')) {
      window.location.hash = '';
    }
    if (window.location.pathname.startsWith('/delivery')) {
      window.history.pushState(null, '', '/');
    }
    loadInitialData();
  };

  // ---------------------------------------------------------------------------
  // STEP 2: PRIVATE ADMIN PORTAL (Accessible ONLY at /admin, #/admin)
  // ---------------------------------------------------------------------------
  if (isAdminRoute) {
    if (isVerifyingAdmin) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
          <p className="text-xs text-gray-400">Verifying administrator authorization...</p>
        </div>
      );
    }

    // If not authenticated, render dedicated Private Admin Login Page
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
          }}
          onBackToStore={handleExitAdminToStore}
        />
      );
    }

    // Authorized Administrator Dashboard
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={setAdminTab}
        onExitToStore={handleExitAdminToStore}
        onLogoutAdmin={() => {
          setIsAdminAuthenticated(false);
          handleExitAdminToStore();
        }}
      >
        {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'delivery' && <AdminDelivery />}
        {adminTab === 'inventory' && <AdminInventory />}
        {adminTab === 'banners' && <AdminBanners />}
        {adminTab === 'coupons' && <AdminCoupons />}
        {adminTab === 'recipes' && <AdminRecipes />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'settings' && <AdminSettings />}
      </AdminLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 3: PRIVATE DELIVERY BOY PORTAL (Accessible ONLY at /delivery, #/delivery)
  // ---------------------------------------------------------------------------
  if (isDeliveryRoute) {
    if (isVerifyingDelivery) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400 mb-3" />
          <p className="text-xs text-gray-400">Verifying delivery staff session...</p>
        </div>
      );
    }

    if (!currentDeliveryBoy) {
      return (
        <DeliveryLoginPage
          onLoginSuccess={boy => setCurrentDeliveryBoy(boy)}
          onBackToStore={handleExitDeliveryToStore}
        />
      );
    }

    return (
      <DeliveryDashboard
        deliveryBoy={currentDeliveryBoy}
        onLogout={() => setCurrentDeliveryBoy(null)}
        onExitToStore={handleExitDeliveryToStore}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 1: SPLASH SCREEN (Runs on app open for ~2 seconds)
  // ---------------------------------------------------------------------------
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} durationMs={2000} />;
  }

  // ---------------------------------------------------------------------------
  // STEP 3: CUSTOMER LOGIN SCREEN (If not logged in and not guest browsing)
  // User Flow: App opens → Splash screen → Login screen → User logs in → Homepage
  // ---------------------------------------------------------------------------
  if (!user && !guestBrowsing) {
    return (
      <LoginScreen
        onSuccess={() => {
          // Handled via context: user state updates and renders store
        }}
        onContinueAsGuest={() => setGuestBrowsing(true)}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // STEP 4: CUSTOMER STORE PANEL (Public - Zero Admin Traces)
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#0A192F]">
        <QuikzoLogo size="xl" showTagline />
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-6">
          <Loader2 className="w-4 h-4 animate-spin text-[#FF6B00]" />
          <span className="font-semibold">Loading fresh groceries &amp; super deals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8F9FA] text-[#111827] flex flex-col antialiased font-sans">
      {/* Customer Header - No admin buttons */}
      <Header
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenAuthModal={() => {
          if (!user) {
            setGuestBrowsing(false);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onSelectProduct={setSelectedProduct}
        onNavigateHome={() => setCustomerTab('home')}
        onNavigateOrders={() => setCustomerTab('orders')}
        onNavigateAccount={() => setCustomerTab('account')}
      />

      {/* Main Customer Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-2.5 sm:py-4 pb-24">
        {customerTab === 'home' && (
          <HomeView
            banners={banners}
            categories={categories}
            superDeals={superDeals}
            bestSellers={bestSellers}
            healthEssentials={healthEssentials}
            featuredProducts={featuredProducts}
            recipes={recipes}
            onSelectCategory={cat => {
              setSelectedCategory(cat);
              setCustomerTab('categories');
            }}
            onSelectProduct={setSelectedProduct}
            onSelectRecipe={setSelectedRecipe}
            onViewAllProducts={() => {
              setSelectedCategory(null);
              setCustomerTab('categories');
            }}
            onViewAllCategories={() => {
              setSelectedCategory(null);
              setCustomerTab('categories');
            }}
            onDonateClick={() => {}}
          />
        )}

        {(customerTab === 'categories' || customerTab === 'search') && (
          <CategoryView
            categories={categories}
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectProduct={setSelectedProduct}
          />
        )}

        {customerTab === 'orders' && (
          <OrdersView
            onTrackOrder={setActiveTrackingOrder}
            onContinueShopping={() => setCustomerTab('home')}
          />
        )}

        {customerTab === 'account' && (
          <AccountView
            onOpenAddresses={() => setIsAddressModalOpen(true)}
            onNavigateOrders={() => setCustomerTab('orders')}
            onOpenAuth={() => {
              if (!user) {
                setGuestBrowsing(false);
              } else {
                setIsAuthModalOpen(true);
              }
            }}
          />
        )}
      </main>

      {/* Customer Fixed Bottom Nav for Android/Mobile */}
      <MobileBottomNav
        currentTab={customerTab}
        onTabChange={tab => {
          setCustomerTab(tab);
          if (tab === 'home') {
            setSelectedCategory(null);
          }
        }}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          if (!user) {
            setGuestBrowsing(false);
          } else {
            setIsCheckoutOpen(true);
          }
        }}
        onContinueShopping={() => setIsCartOpen(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onAddNewAddress={() => setIsAddressModalOpen(true)}
        onOrderSuccess={order => {
          setActiveTrackingOrder(order);
          setCustomerTab('orders');
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={setSelectedProduct}
      />

      {/* Recipe Detail Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        order={activeTrackingOrder}
        onClose={() => setActiveTrackingOrder(null)}
        onOrderUpdated={updated => setActiveTrackingOrder(updated)}
      />

      {/* Address Management Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onOpenAddressManager={() => setIsAddressModalOpen(true)}
      />

      {/* Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Quikzo Assistant AI Chatbot */}
      <QuikzoAssistant
        onSelectProduct={prod => setSelectedProduct(prod)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* DonationModal removed */}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
