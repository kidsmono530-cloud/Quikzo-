import React, { useState, useEffect, useMemo } from 'react';
import { Banner, Category, Product, Recipe } from '../../types';
import { ProductCard } from '../ProductCard';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface HomeViewProps {
  banners: Banner[];
  categories: Category[];
  superDeals: Product[];
  bestSellers: Product[];
  healthEssentials: Product[];
  featuredProducts: Product[];
  recipes: Recipe[];
  onSelectCategory: (cat: Category) => void;
  onSelectProduct: (prod: Product) => void;
  onSelectRecipe: (rec: Recipe) => void;
  onViewAllProducts: () => void;
  onViewAllCategories: () => void;
  onDonateClick: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  banners: baseBanners,
  categories,
  superDeals,
  bestSellers,
  onSelectCategory,
  onSelectProduct,
  onViewAllProducts,
  onViewAllCategories
}) => {
  const { settings } = useCart();

  // Combine base banners with any custom configured banners
  const banners = useMemo(() => {
    const list = [...baseBanners];
    if (settings?.donationPaymentLink) {
      list.push({
        id: 'donation-banner-id',
        title: 'Support Daily Essentials Drive',
        subtitle: '100% of donations deliver fresh food kits to families in need',
        offerText: 'COMMUNITY INITIATIVE',
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80',
        buttonText: 'Donate Now ❤️',
        linkUrl: 'donate',
        isActive: true,
        displayOrder: 999
      });
    }
    return list;
  }, [baseBanners, settings?.donationPaymentLink]);

  // Banner slider state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[currentBannerIndex] || banners[0];

  const handleBannerClick = () => {
    if (activeBanner?.id === 'donation-banner-id') {
      if (settings?.donationPaymentLink) {
        window.open(settings.donationPaymentLink, '_blank');
      } else {
        alert('Donation payment link is not configured yet. Please try again later.');
      }
    } else {
      onViewAllProducts();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* 1. Slim Promotional Announcement Bar */}
      <div className="bg-[#FFCD00]/20 border border-[#FFCD00]/70 rounded-xl px-3 py-2 flex flex-col sm:flex-row items-center justify-between text-xs font-black text-[#0B0B0B] shadow-2xs gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0B0B0B] animate-pulse shrink-0" />
          <span>⚡ Lightning Fast 10-15 Minute Grocery Delivery in Bengaluru</span>
        </div>
        <span className="text-[10px] font-black bg-[#FFCD00] px-2 py-0.5 rounded-lg text-[#0B0B0B] shadow-2xs shrink-0 border border-amber-300">
          FREE Delivery on orders above ₹199
        </span>
      </div>

      {/* 2. Compact Promotional Banner Carousel */}
      {banners.length > 0 && activeBanner && (
        <section className="relative overflow-hidden rounded-2xl shadow-xs border border-gray-200 bg-[#0B0B0B]">
          <div className="relative h-36 sm:h-48 md:h-56 w-full">
            <img
              src={activeBanner.image}
              alt={activeBanner.title}
              className="w-full h-full object-cover opacity-80 transition-opacity duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex items-center">
              <div className="p-4 sm:p-6 max-w-lg text-white space-y-1.5 sm:space-y-2">
                {activeBanner.offerText && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#FFCD00] text-[#0B0B0B] shadow-2xs">
                    <Zap className="w-3 h-3 fill-[#0B0B0B]" />
                    {activeBanner.offerText}
                  </span>
                )}
                <h2 className="text-base sm:text-2xl font-black tracking-tight leading-tight text-white line-clamp-2">
                  {activeBanner.title}
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-200 line-clamp-1 sm:line-clamp-2 max-w-md">
                  {activeBanner.subtitle}
                </p>
                <div className="pt-0.5">
                  <button
                    onClick={handleBannerClick}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#FFCD00] hover:bg-[#E5B800] text-[#0B0B0B] font-black text-[11px] sm:text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 border border-amber-300"
                  >
                    <span>{activeBanner.buttonText || 'Shop Deals'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setCurrentBannerIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentBannerIndex(prev => (prev + 1) % banners.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
                aria-label="Next banner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBannerIndex(i)}
                    className={`h-1 rounded-full transition-all ${
                      currentBannerIndex === i ? 'w-4 bg-[#FFCD00]' : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* 3. Shop by Category (Horizontally Scrollable Small Circular Category Cards) */}
      <section className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm sm:text-base font-black text-[#0B0B0B] tracking-tight flex items-center gap-1.5">
            <span>Shop by Category</span>
            <span className="text-[11px] font-semibold text-gray-500">({categories.length})</span>
          </h2>
          <button
            onClick={onViewAllCategories}
            className="text-[11px] font-bold text-[#0B0B0B] hover:text-black flex items-center gap-0.5 bg-[#FFCD00] px-2.5 py-1 rounded-lg border border-amber-300"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="group flex flex-col items-center shrink-0 w-18 sm:w-22 p-1.5 bg-gray-50/70 hover:bg-amber-50/60 border border-gray-200/90 hover:border-[#FFCD00] rounded-xl cursor-pointer transition-all snap-start text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white mb-1 p-0.5 flex items-center justify-center border border-gray-200 shadow-2xs group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#0B0B0B] line-clamp-2 leading-tight group-hover:text-black">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Three Compact Service-Benefit Cards */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 text-center flex flex-col items-center gap-0.5 shadow-2xs">
          <Clock className="w-4 h-4 text-[#0B0B0B]" />
          <h4 className="text-[11px] font-black text-[#0B0B0B]">Fast Delivery</h4>
          <p className="text-[9px] text-gray-500">10-15 Mins doorstep</p>
        </div>
        <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 text-center flex flex-col items-center gap-0.5 shadow-2xs">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h4 className="text-[11px] font-black text-[#0B0B0B]">Best Prices</h4>
          <p className="text-[9px] text-gray-500">Big savings & deals</p>
        </div>
        <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 text-center flex flex-col items-center gap-0.5 shadow-2xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h4 className="text-[11px] font-black text-[#0B0B0B]">100% Fresh</h4>
          <p className="text-[9px] text-gray-500">Quality assured</p>
        </div>
      </section>

      {/* 5. Bestsellers & Popular Grocery Products (TWO-COLUMN on Mobile) */}
      {bestSellers.length > 0 && (
        <section className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FFCD00] text-[#0B0B0B] flex items-center justify-center font-black shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <h2 className="text-sm sm:text-base font-black text-[#0B0B0B] tracking-tight">
                Bestsellers &amp; Popular
              </h2>
            </div>
            <button
              onClick={onViewAllProducts}
              className="text-[11px] font-bold text-[#0B0B0B] hover:text-black flex items-center gap-0.5 bg-[#FFCD00] px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* TWO-COLUMN on mobile (320px-767px), 3-col on tablet, 4-6 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {bestSellers.slice(0, 12).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Today's Super Deals */}
      {superDeals.length > 0 && (
        <section className="bg-amber-50/40 p-3.5 sm:p-4 rounded-2xl border border-amber-200/80 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FFCD00] text-[#0B0B0B] flex items-center justify-center font-black shadow-2xs">
                <Zap className="w-3.5 h-3.5 fill-[#0B0B0B]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#0B0B0B] tracking-tight">
                  Today's Super Deals
                </h2>
                <span className="text-[10px] text-amber-900 font-bold">
                  Lowest prices on daily grocery essentials
                </span>
              </div>
            </div>
            <button
              onClick={onViewAllProducts}
              className="text-[11px] font-bold text-[#0B0B0B] bg-white hover:bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-300 shadow-2xs"
            >
              <span>See Deals</span>
              <ChevronRight className="w-3 h-3 inline ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {superDeals.slice(0, 12).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
