import React, { useState, useEffect, useMemo, memo } from 'react';
import type { Card, CardColor } from '@shared/models';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Heart, Brain, Utensils, Bone, Zap, Shield, Skull, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { useImageManager } from '../core/useImageManager';
import type { CardImageMap } from '../core/useImageManager';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardUIProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  className?: string;
}

export const colorMap: Record<CardColor, string> = {
  red: 'from-red-500 to-red-700 border-red-800',
  blue: 'from-blue-500 to-blue-700 border-blue-800',
  green: 'from-green-500 to-green-700 border-green-800',
  yellow: 'from-yellow-400 to-yellow-600 border-yellow-700',
  multicolor: 'from-purple-500 via-pink-500 to-red-500 border-purple-800'
};

const organTheme: Record<string, { icon: any; color: string; label: string }> = {
  heart: { icon: Heart, color: 'from-red-400 to-red-600', label: 'CORAZÓN' },
  brain: { icon: Brain, color: 'from-blue-400 to-blue-600', label: 'CEREBRO' },
  stomach: { icon: Utensils, color: 'from-yellow-400 to-yellow-600', label: 'ESTÓMAGO' },
  bone: { icon: Bone, color: 'from-slate-400 to-slate-600', label: 'HUESOS' },
  default: { icon: Layers, color: 'from-slate-500 to-slate-700', label: 'ÓRGANO' }
};

type ImageStatus = 'loading' | 'loaded' | 'error' | 'none';

// Skeleton Component
const CardSkeleton = () => (
  <div className="absolute inset-0 z-40 bg-slate-800 animate-pulse flex flex-col items-center justify-center gap-3">
    <div className="w-16 h-16 bg-slate-700 rounded-full" />
    <div className="w-24 h-4 bg-slate-700 rounded-full" />
  </div>
);

const CardUIBase: React.FC<CardUIProps> = ({ card, onClick, selected, disabled, small, className }) => {
  const [imageStatus, setImageStatus] = useState<ImageStatus>('none');
  const images = useImageManager(state => state.images);
  const preloadedUrls = useImageManager(state => state.preloadedUrls);
  
  const cardNameLower = card.name.toLowerCase();
  
  // Memoized key resolution
  const organKey = useMemo((): keyof CardImageMap => {
    // 1. Special cards (Checked first for precise matching)
    if (card.type === 'special') {
      if (cardNameLower.includes('transplante') || cardNameLower.includes('trasplante')) return 'sp_transplant';
      if (cardNameLower.includes('ladrón')) return 'sp_thief';
      if (cardNameLower.includes('contagio')) return 'sp_infection';
      if (cardNameLower.includes('error')) return 'sp_error';
      if (cardNameLower.includes('guante')) return 'sp_glove';
    }

    // 2. Organs
    if (cardNameLower.includes('heart') || cardNameLower.includes('corazón')) return 'heart';
    if (cardNameLower.includes('brain') || cardNameLower.includes('cerebro')) return 'brain';
    if (cardNameLower.includes('stomach') || cardNameLower.includes('estómago')) return 'stomach';
    if (cardNameLower.includes('bones') || cardNameLower.includes('huesos')) return 'bone';
    if (cardNameLower.includes('comodín') && card.type === 'organ') return 'wildcard';
    
    // 3. Virus
    if (card.type === 'virus') {
       if (cardNameLower.includes('rojo')) return 'virus_red';
       if (cardNameLower.includes('verde')) return 'virus_green';
       if (cardNameLower.includes('azul')) return 'virus_blue';
       if (cardNameLower.includes('amarillo')) return 'virus_yellow';
       if (cardNameLower.includes('comodín')) return 'virus_wildcard';
    }

    // 4. Medicine
    if (card.type === 'medicine') {
       if (cardNameLower.includes('roja')) return 'med_red';
       if (cardNameLower.includes('verde')) return 'med_green';
       if (cardNameLower.includes('azul')) return 'med_blue';
       if (cardNameLower.includes('amarilla')) return 'med_yellow';
       if (cardNameLower.includes('comodín')) return 'med_wildcard';
    }

    return 'heart';
  }, [cardNameLower, card.type]);

  const customUrl = images[organKey];
  const hasCustomImage = !!customUrl;

  useEffect(() => {
    if (hasCustomImage && !small) {
      if (preloadedUrls.has(customUrl)) {
        setImageStatus('loaded');
      } else {
        setImageStatus('loading');
      }
    } else {
      setImageStatus('none');
    }
  }, [customUrl, hasCustomImage, small, preloadedUrls]);

  const theme = card.type === 'organ' ? organTheme[organKey as string] || organTheme.default : null;
  const Icon = theme?.icon || (card.type === 'virus' ? Skull : card.type === 'medicine' ? Shield : Zap);

  const showImage = hasCustomImage && !small && imageStatus === 'loaded';
  const showFallback = !hasCustomImage || small || imageStatus === 'error';
  const isLoading = hasCustomImage && imageStatus === 'loading' && !small;

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'relative flex flex-col items-center justify-between rounded-[1.2rem] border-4 p-2 transition-all cursor-pointer shadow-xl select-none touch-manipulation aspect-[2/3] overflow-hidden group bg-gradient-to-b',
        colorMap[card.color],
        small ? 'w-16 h-24' : 'w-36 md:w-44',
        selected ? 'ring-4 ring-white -translate-y-2 z-20 scale-105' : 'hover:scale-105 active:scale-95',
        disabled && 'opacity-40 grayscale cursor-not-allowed',
        className
      )}
    >
      {/* GLOSSY EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-40 pointer-events-none z-30" />
      
      {/* SKELETON / LOADING */}
      {isLoading && <CardSkeleton />}

      {/* REMOTE IMAGE (Hardware Accelerated) */}
      {hasCustomImage && !small && (
        <img 
          src={customUrl} 
          alt={card.name}
          loading="lazy"
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-10 transition-all duration-500 ease-out will-change-opacity",
            imageStatus === 'loaded' ? "opacity-100 scale-100" : "opacity-0 scale-110"
          )}
          onLoad={() => setImageStatus('loaded')}
          onError={() => setImageStatus('error')}
        />
      )}

      {/* OVERLAY LABEL */}
      {showImage && (
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/90 to-transparent z-20 flex items-end justify-center pb-2 px-1">
          <span className="text-white font-black text-[10px] md:text-xs tracking-tighter uppercase text-center leading-none truncate w-full">
            {card.name}
          </span>
        </div>
      )}

      {/* BASE DESIGN / FALLBACK */}
      {showFallback && (
        <>
          <div className="text-white font-black text-center leading-tight drop-shadow-lg z-20 w-full px-1 text-xs md:text-sm">
            {card.name}
          </div>
          
          <div className="flex flex-1 items-center justify-center py-1 z-20 relative w-full">
            <div className={cn(
              "rounded-full flex items-center justify-center transition-all duration-500 group-hover:rotate-12",
              small ? "p-1" : "p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-inner"
            )}>
              <Icon 
                className={cn(
                  "text-white drop-shadow-glow",
                  small ? "w-6 h-6" : "w-12 h-12 md:w-16 md:h-16"
                )} 
              />
            </div>
          </div>

          {!small && (
            <div className="w-full z-20">
               <div className="bg-black/40 backdrop-blur-md rounded-lg py-1 px-2 border border-white/10 shadow-lg">
                  <p className="text-[10px] text-white font-black text-center tracking-widest uppercase">
                    {theme?.label || card.type}
                  </p>
               </div>
            </div>
          )}
        </>
      )}

      {/* SELECTION INDICATOR */}
      {selected && !small && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-2xl z-40 border-2 border-white animate-bounce">
          <CheckCircle2 size={16} />
        </div>
      )}
      
      {/* ERROR INDICATOR (Dev only) */}
      {imageStatus === 'error' && import.meta.env.MODE === 'development' && (
        <div className="absolute top-2 left-2 bg-red-600 text-white p-1 rounded-full z-50 animate-pulse">
          <AlertCircle size={12} />
        </div>
      )}
    </div>
  );
};

export const CardUI = memo(CardUIBase, (prev, next) => {
  return (
    prev.selected === next.selected &&
    prev.disabled === next.disabled &&
    prev.small === next.small &&
    prev.className === next.className &&
    prev.card === next.card
  );
});
