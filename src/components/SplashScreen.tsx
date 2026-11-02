import React, { useEffect, useState } from 'react';
import quikzoAppIcon from '../assets/quikzo-app-icon.svg';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2000
}) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [stage, setStage] = useState<'initial' | 'animated'>('initial');

  useEffect(() => {
    // Trigger smooth entrance animation right after mount
    const animTimer = setTimeout(() => {
      setStage('animated');
    }, 50);

    // Fade out smoothly right before completion
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, Math.max(durationMs - 350, 1000));

    // Finish splash and navigate to Home or Login
    const completeTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-300 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#FFCD00' }}
      aria-label="Quikzo Loading Screen"
    >
      {/* Centered vertical brand group */}
      <div className="flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* 1. Quikzo App Icon */}
        <div
          className={`relative transition-all duration-700 ease-out transform ${
            stage === 'animated'
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-[0.82] translate-y-2'
          }`}
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-black/15 bg-[#FFCD00] flex items-center justify-center p-1 border-4 border-[#0B0B0B]">
            <img
              src={quikzoAppIcon}
              alt="Quikzo Icon"
              className="w-full h-full object-contain pointer-events-none"
              loading="eager"
            />
          </div>
        </div>

        {/* 2. Bold modern typography for Quikzo */}
        <div
          className={`mt-6 flex items-center justify-center transition-all duration-700 ease-out delay-200 transform ${
            stage === 'animated'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="flex items-center font-black tracking-tight text-4xl sm:text-5xl text-[#0B0B0B] leading-none">
            <span>Quik</span>
            <span className="bg-[#0B0B0B] text-[#FFCD00] px-2 py-0.5 rounded-lg ml-1 transform -skew-x-6 text-3xl sm:text-4xl inline-block shadow-xs">
              zo
            </span>
          </div>
        </div>

        {/* 3. Tagline */}
        <div
          className={`mt-3 transition-all duration-700 ease-out delay-300 transform ${
            stage === 'animated'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-[11px] sm:text-xs font-black tracking-[0.22em] text-[#0B0B0B]/85 uppercase">
            FAST SHOPPING, FASTER DELIVERY
          </p>
        </div>

        {/* Minimal loading dot indicator */}
        <div
          className={`mt-8 flex items-center gap-1.5 transition-opacity duration-500 delay-500 ${
            stage === 'animated' ? 'opacity-80' : 'opacity-0'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#0B0B0B] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#0B0B0B] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#0B0B0B] animate-bounce" />
        </div>
      </div>

      {/* Bottom subtle safety badge */}
      <div className="absolute bottom-6 text-center text-[10px] font-extrabold tracking-widest text-[#0B0B0B]/70 uppercase">
        ⚡ 10-15 Min Grocery Delivery
      </div>
    </div>
  );
};

