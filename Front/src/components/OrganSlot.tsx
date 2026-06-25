import React, { memo } from 'react';
import type { OrganState } from '@shared/models';
import { CardUI } from './CardUI';
import { ShieldCheck } from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OrganSlotProps {
  organ: OrganState;
  onClick?: () => void;
  canTarget?: boolean;
  isSelected?: boolean;
  small?: boolean;
}

const OrganSlotBase: React.FC<OrganSlotProps> = ({ organ, onClick, canTarget, isSelected, small }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative group transition-all touch-manipulation w-full h-full",
        canTarget ? 'cursor-pointer hover:ring-4 ring-yellow-400 rounded-xl animate-pulse' : '',
        isSelected ? 'ring-4 ring-green-500 rounded-xl scale-105 z-20 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''
      )}
    >
      {/* Organ Card */}
      <CardUI card={organ.organCard} disabled={!canTarget && !isSelected && onClick === undefined} small={small} selected={isSelected} className="w-full h-full absolute inset-0" />

      {/* Virus layer */}
      <div className={cn(
        "absolute -top-1 md:-top-2 -left-1 md:-left-2 flex flex-col gap-1 z-20 transition-all duration-300 w-full h-full pointer-events-none origin-top-left",
        small ? "scale-[0.6] xs:scale-[0.65]" : "scale-[0.7] md:scale-[0.75]"
      )}>
        {organ.viruses.map((v: any, i: number) => (
          <div key={v.id} className={cn("w-full h-full relative", i > 0 && "-mt-[70%] md:-mt-[80%]")}>
            <CardUI 
              card={v} 
              small 
              className="shadow-[0_4px_15px_rgba(0,0,0,0.5)] border-white/40 ring-2 ring-red-500/50 transition-all pointer-events-auto absolute inset-0"
            />
          </div>
        ))}
      </div>

      {/* Medicines layer (Hidden if immune) */}
      {!organ.isImmune && (
        <div className={cn(
          "absolute -top-1 md:-top-2 -right-1 md:-right-2 flex flex-col gap-1 z-20 transition-all duration-300 w-full h-full pointer-events-none origin-top-right",
          small ? "scale-[0.6] xs:scale-[0.65]" : "scale-[0.7] md:scale-[0.75]"
        )}>
          {organ.medicines.map((m: any, i: number) => (
            <div key={m.id} className={cn("w-full h-full relative", i > 0 && "-mt-[70%] md:-mt-[80%]")}>
              <CardUI 
                card={m} 
                small 
                className="shadow-[0_4px_15px_rgba(0,0,0,0.5)] border-white/40 ring-2 ring-blue-500/50 transition-all pointer-events-auto absolute inset-0"
              />
            </div>
          ))}
        </div>
      )}

      {/* Immune indicator */}
      {organ.isImmune && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30 rounded-xl pointer-events-none border-[3px] md:border-4 border-blue-400 z-30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          <ShieldCheck className="w-1/2 h-1/2 text-blue-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] md:text-[11px] font-black px-3 py-1 rounded-full shadow-2xl z-40 whitespace-nowrap border-2 border-white/20">
          SELECCIONADO
        </div>
      )}
    </div>
  );
};

export const OrganSlot = memo(OrganSlotBase, (prev, next) => {
  return (
    prev.canTarget === next.canTarget &&
    prev.isSelected === next.isSelected &&
    prev.small === next.small &&
    prev.organ === next.organ
  );
});
