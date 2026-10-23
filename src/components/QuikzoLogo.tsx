import React from 'react';
import quikzoAppIcon from '../assets/quikzo-app-icon.svg';

interface QuikzoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'full' | 'icon' | 'white-text';
  className?: string;
}

export const QuikzoLogo: React.FC<QuikzoLogoProps> = ({
  size = 'md',
  showTagline = false,
  variant = 'full',
  className = ''
}) => {
  const iconDimensions = {
    xs: { box: 28, text: 'text-base', tagline: 'text-[8px]', gap: 'gap-1.5' },
    sm: { box: 36, text: 'text-lg sm:text-xl', tagline: 'text-[9px]', gap: 'gap-2' },
    md: { box: 46, text: 'text-2xl', tagline: 'text-[11px]', gap: 'gap-2.5' },
    lg: { box: 64, text: 'text-3xl', tagline: 'text-xs', gap: 'gap-3' },
    xl: { box: 84, text: 'text-4xl sm:text-5xl', tagline: 'text-xs sm:text-sm', gap: 'gap-3.5' }
  }[size];

  const textColor = variant === 'white-text' ? 'text-white' : 'text-[#0B0B0B]';
  const taglineColor = variant === 'white-text' ? 'text-amber-300' : 'text-gray-600';

  return (
    <div className={`flex items-center ${iconDimensions.gap} ${className}`}>
      {/* Official Quikzo Speed 'Q' App Icon */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-[22%] overflow-hidden shadow-xs transition-transform group-hover:scale-105"
        style={{
          width: iconDimensions.box,
          height: iconDimensions.box,
          backgroundColor: '#FFCD00'
        }}
      >
        <img
          src={quikzoAppIcon}
          alt="Quikzo"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Typography: Quikzo with distinctive black 'zo' badge */}
      {variant !== 'icon' && (
        <div className="flex flex-col text-left leading-none">
          <div className={`font-black tracking-tight ${iconDimensions.text} ${textColor} flex items-center`}>
            <span>Quik</span>
            <span className="bg-[#0B0B0B] text-[#FFCD00] px-1.5 py-0.5 rounded-md ml-0.5 transform -skew-x-6 text-[85%] inline-block">
              zo
            </span>
          </div>

          {showTagline && (
            <span className={`font-black tracking-[0.18em] uppercase mt-1 ${iconDimensions.tagline} ${taglineColor}`}>
              FAST SHOPPING, FASTER DELIVERY
            </span>
          )}
        </div>
      )}
    </div>
  );
};
