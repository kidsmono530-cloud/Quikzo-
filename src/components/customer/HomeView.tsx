import React, { useState, useEffect } from 'react';
import { Category, Product, Banner, Recipe } from '../../types';
import { formatINR } from '../../lib/formatters';
import { ProductCard } from '../ProductCard';
import { useCart } from '../../context/CartContext';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Heart
} from 'lucide-react';

interface HomeViewProps {
  banners: Banner[];
  categories: Category[];
  superDeals: Product[];
  bestSellers: Product[];
  healthEssentials: Product[];
  featuredProducts: Product[];
  recipes: Recipe[];
  onSelectCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onViewAllProducts: () => void;
  onViewAllCategories: () => void;
  onDonateClick: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  banners: baseBanners,
  categories,
  superDeals,
  bestSellers,
  healthEssentials,
  featuredProducts,
  recipes,
  onSelectCategory,
  onSelectProduct,
  onSelectRecipe,
  onViewAllProducts,
  onViewAllCategories,
  onDonateClick
}) => {
  const { settings } = useCart();
  
  // Construct banner list with optional donation slide
  const banners = React.useMemo(() => {
    const list = [...baseBanners];
    if (settings?.donationPaymentLink) {
      list.push({
        id: 'donation-banner-id',
        title: 'Help a Child Build a Better Future',
        subtitle: 'Support children\'s education and help create a brighter future.',
        offerText: 'MAKE A DIFFERENCE',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
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
    if (activeBanner.id === 'donation-banner-id') {
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
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Delivery Offer Strip */}
      <div className="bg-[#DDF4EA]/80 border border-[#159F83]/30 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs font-extrabold text-[#202824] shadow-2xs gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#159F83] animate-pulse shrink-0" />
          <span>⚡ Lightning fast 10-15 minute grocery delivery at your doorstep</span>
        </div>
        <span className="text-[11px] font-black bg-[#DDF4EA] px-2.5 py-1 rounded-xl text-[#202824] shadow-2xs shrink-0">
          Free delivery on orders above ₹199
        </span>
      </div>

      {/* 1. Main Promotional Banner Slider */}
      {banners.length > 0 && activeBanner && (
        <section className="relative overflow-hidden rounded-3xl shadow-sm border border-[#E8E2D9] bg-[#202824]">
          <div className="relative h-48 sm:h-64 md:h-72 w-full">
            <img
              src={activeBanner.image}
              alt={activeBanner.title}
              className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#202824]/90 via-[#202824]/50 to-transparent flex items-center">
              <div className="p-5 sm:p-8 max-w-xl text-white space-y-2.5">
                {activeBanner.offerText && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#159F83] text-white shadow-xs">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    {activeBanner.offerText}
                  </span>
                )}
                <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                  {activeBanner.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-md">
                  {activeBanner.subtitle}
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleBannerClick}
                    className="px-5 py-2.5 bg-[#159F83] hover:bg-[#128a71] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span>{activeBanner.buttonText || 'Shop Super Deals'}</span>
                    <ArrowRight className="w-4 h-4" />
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentBannerIndex(prev => (prev + 1) % banners.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBannerIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentBannerIndex === i ? 'w-6 bg-[#159F83]' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* 2. Shop by Category */}
      <section className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E2D9] shadow-xs">
        <div className="flex items-center justify-between mb-3.5 sm:mb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-[#202824] tracking-tight flex items-center gap-2">
            <span>Shop by Category</span>
            <span className="text-xs font-semibold text-gray-400">({categories.length})</span>
          </h2>
          <button
            onClick={onViewAllCategories}
            className="text-xs font-bold text-[#159F83] hover:text-[#128a71] flex items-center gap-1 bg-[#DDF4EA] px-3 py-1.5 rounded-xl"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="group flex flex-col items-center shrink-0 w-20 sm:w-24 p-2 bg-[#FFFBF7] hover:bg-[#DDF4EA]/50 border border-[#E8E2D9] hover:border-[#159F83] rounded-2xl cursor-pointer transition-all snap-start text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white mb-1.5 p-1 flex items-center justify-center shadow-2xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-[11px] font-bold text-[#202824] line-clamp-2 leading-tight group-hover:text-[#159F83]">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers & Popular Products */}
      {bestSellers.length > 0 && (
        <section className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#159F83] text-white flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#202824] tracking-tight">
                Bestsellers &amp; Popular
              </h2>
            </div>
            <button
              onClick={onViewAllProducts}
              className="text-xs font-bold text-[#159F83] hover:text-[#128a71] flex items-center gap-1 bg-[#DDF4EA] px-3 py-1.5 rounded-xl"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {bestSellers.slice(0, 10).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Today's Super Deals */}
      {superDeals.length > 0 && (
        <section className="bg-gradient-to-br from-[#159F83]/10 via-[#DDF4EA]/40 to-transparent p-4 sm:p-6 rounded-3xl border border-[#159F83]/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#159F83] text-white flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#202824] tracking-tight">
                  Today's Super Deals
                </h2>
                <span className="text-[11px] text-[#159F83] font-medium">
                  Lowest prices of the season
                </span>
              </div>
            </div>
            <button
              onClick={onViewAllProducts}
              className="text-xs font-bold text-[#202824] bg-white hover:bg-[#DDF4EA]/50 px-3 py-1.5 rounded-xl border border-[#E8E2D9] shadow-2xs"
            >
              <span>See All Deals</span>
              <ChevronRight className="w-3.5 h-3.5 inline ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {superDeals.slice(0, 10).map(product => (
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
