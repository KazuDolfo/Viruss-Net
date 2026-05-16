import React, { useState, useEffect, useMemo, memo } from 'react';
import type { Card } from '@shared/models';
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

export const colorMap: Record<string, string> = {
  red: 'from-red-500 to-red-700 border-red-800',
  blue: 'from-blue-500 to-blue-700 border-blue-800',
  green: 'from-green-500 to-green-700 border-green-800',
  yellow: 'from-yellow-400 to-yellow-600 border-yellow-700',
  wildcard: 'from-purple-500 via-pink-500 to-orange-500 border-purple-800'
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
  
  // Normalized name for robust matching (removes accents and converts to lowercase)
  const normalizedName = useMemo(() => {
    return (card.name || '')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }, [card.name]);
  
  // Memoized key resolution
  const organKey = useMemo((): keyof CardImageMap => {
    // 1. Treatment cards (Checked first for precise matching)
    if (card.type === 'treatment' as any || card.type === 'special' as any) {
      if (normalizedName.includes('transplante') || normalizedName.includes('trasplante')) return 'sp_transplant';
      if (normalizedName.includes('ladron')) return 'sp_thief';
      if (normalizedName.includes('contagio')) return 'sp_infection';
      if (normalizedName.includes('error')) return 'sp_error';
      if (normalizedName.includes('guante')) return 'sp_glove';
    }

    // 2. Organs
    if (normalizedName.includes('heart') || normalizedName.includes('corazon')) return 'heart';
    if (normalizedName.includes('brain') || normalizedName.includes('cerebro')) return 'brain';
    if (normalizedName.includes('stomach') || normalizedName.includes('estomago')) return 'stomach';
    if (normalizedName.includes('bone') || normalizedName.includes('hueso')) return 'bone';
    if ((normalizedName.includes('comodin') || normalizedName.includes('multicapa')) && card.type === 'organ') return 'wildcard';
    
    // 3. Virus
    if (card.type === 'virus') {
       if (normalizedName.includes('rojo')) return 'virus_red';
       if (normalizedName.includes('verde')) return 'virus_green';
       if (normalizedName.includes('azul')) return 'virus_blue';
       if (normalizedName.includes('amarillo')) return 'virus_yellow';
       if (normalizedName.includes('comodin') || normalizedName.includes('triple')) return 'virus_wildcard';
    }

    // 4. Medicine
    if (card.type === 'medicine') {
       if (normalizedName.includes('roja')) return 'med_red';
       if (normalizedName.includes('verde')) return 'med_green';
       if (normalizedName.includes('azul')) return 'med_blue';
       if (normalizedName.includes('amarilla')) return 'med_yellow';
       if (normalizedName.includes('comodin') || normalizedName.includes('universal')) return 'med_wildcard';
    }

    // Special catch-all for names if type check failed
    if (normalizedName.includes('transplante') || normalizedName.includes('trasplante')) return 'sp_transplant';
    if (normalizedName.includes('ladron')) return 'sp_thief';
    if (normalizedName.includes('contagio')) return 'sp_infection';
    if (normalizedName.includes('error')) return 'sp_error';
    if (normalizedName.includes('guante')) return 'sp_glove';

    return 'default' as any;
  }, [normalizedName, card.type]);

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

  const showImage = hasCustomImage && imageStatus === 'loaded';
  const showFallback = !hasCustomImage || imageStatus === 'error';
  const isLoading = hasCustomImage && imageStatus === 'loading';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'relative flex flex-col items-center justify-between rounded-[0.75rem] md:rounded-[1rem] border-[2px] md:border-[3px] p-1.5 md:p-2 transition-all cursor-pointer shadow-xl select-none touch-manipulation overflow-hidden group bg-gradient-to-b will-change-transform',
        colorMap[card.color],
        small ? 'w-14 h-20 md:w-16 md:h-24' : 'w-[100px] h-[150px] xs:w-[120px] xs:h-[180px] md:w-[160px] md:h-[240px]',
        selected ? 'ring-4 ring-white -translate-y-4 scale-105 z-20 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'hover:-translate-y-2 hover:scale-[1.02]',
        disabled && 'opacity-40 grayscale cursor-not-allowed',
        className
      )}
    >
      {/* GLOSSY EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-30 md:opacity-40 pointer-events-none z-30" />
      
      {/* SKELETON / LOADING */}
      {isLoading && <CardSkeleton />}

      {/* REMOTE IMAGE (Hardware Accelerated) */}
      {hasCustomImage && (
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

      {/* OVERLAY LABEL & DESCRIPTION */}
      {showImage && (
        <div className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-20 flex flex-col items-center justify-end px-2 transition-all",
          small ? "h-1/3 pb-1.5" : "h-1/2 pb-3 md:pb-5 group-hover:h-2/3"
        )}>
          <span className={cn(
            "text-white font-black tracking-tighter uppercase text-center leading-none drop-shadow-md",
            small ? "text-[6px] md:text-[8px]" : "text-[10px] xs:text-[11px] md:text-sm mb-1"
          )}>
            {card.name}
          </span>
          {card.description && !small && (
             <p className="text-[7px] md:text-[9px] text-white/80 font-medium text-center leading-tight line-clamp-2 md:line-clamp-3 italic">
               {card.description}
             </p>
          )}
        </div>
      )}

      {/* BASE DESIGN / FALLBACK */}
      {showFallback && (
        <>
          <div className="flex flex-col items-center gap-1 z-20 w-full px-1">
            <div className="text-white font-black text-center leading-tight drop-shadow-lg text-[10px] xs:text-xs md:text-sm">
              {card.name}
            </div>
            {!small && card.description && (
              <p className="text-[7px] md:text-[9px] text-white/70 font-medium text-center leading-tight line-clamp-2 italic px-2">
                {card.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-1 items-center justify-center py-1 z-20 relative w-full">
            <div className={cn(
              "rounded-full flex items-center justify-center transition-all duration-500 group-hover:rotate-12",
              small ? "p-0.5" : "p-2 md:p-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-inner"
            )}>
              <Icon 
                className={cn(
                  "text-white drop-shadow-glow",
                  small ? "w-5 h-5 md:w-6 md:h-6" : "w-10 h-10 xs:w-12 xs:h-12 md:w-16 md:h-16"
                )} 
              />
            </div>
          </div>

          {!small && (
            <div className="w-full z-20">
               <div className="bg-black/40 backdrop-blur-md rounded-lg py-0.5 md:py-1 px-1.5 md:px-2 border border-white/10 shadow-lg">
                  <p className="text-[8px] md:text-[10px] text-white font-black text-center tracking-widest uppercase truncate">
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
